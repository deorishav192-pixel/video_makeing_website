const rateMap = new Map();

function checkRate(ip) {
  const limit = parseInt(process.env.RATE_LIMIT_PER_HOUR || '15', 10);
  const now = Date.now();
  const win = 60 * 60 * 1000;
  const rec = rateMap.get(ip) || { count: 0, resetAt: now + win };
  if (now > rec.resetAt) { rec.count = 0; rec.resetAt = now + win; }
  rec.count++;
  rateMap.set(ip, rec);
  return { ok: rec.count <= limit, resetAt: rec.resetAt };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key not configured.' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const { ok, resetAt } = checkRate(ip);
  if (!ok) {
    const mins = Math.ceil((resetAt - Date.now()) / 60000);
    return res.status(429).json({ error: `Rate limit reached. Try again in ${mins} minutes.` });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const { platform, genre, tones, duration, topic, audience, extras } = body || {};
  if (!topic || String(topic).trim().length < 3) {
    return res.status(400).json({ error: 'Please enter a video topic (at least 3 characters).' });
  }

  const p = ['YouTube','Instagram','Both'].includes(platform) ? platform : 'YouTube';
  const g = String(genre || 'Tutorial').slice(0, 50);
  const t = (Array.isArray(tones) ? tones : ['Energetic']).slice(0, 5).map(x => String(x).slice(0, 30));
  const d = String(duration || '5-7 min').slice(0, 30);
  const a = String(audience || '').slice(0, 200);
  const e = String(extras || '').slice(0, 400);

  const prompt = `You are a world-class video content strategist and scriptwriter.

Create a complete video concept for:
- Platform: ${p}
- Genre: ${g}
- Tone: ${t.join(', ')}
- Duration: ${d}
- Topic: ${String(topic).trim()}
${a ? `- Target Audience: ${a}` : ''}
${e ? `- Special Notes: ${e}` : ''}

Respond with ALL these sections using the exact bold headers:

**Video Title**: [compelling click-worthy title]
**Hook**: [attention-grabbing opening for first 3-5 seconds]
**Outline**: [structured breakdown with timestamps]
**Script**: [detailed sample script with natural dialogue]
**Thumbnail Concept**: [vivid description - text, imagery, colors, composition]
**Caption**: [full ${p === 'Instagram' ? 'Instagram caption' : 'YouTube description'}]
**Hashtags**: [12-15 relevant hashtags starting with #]
**Music**: [background music style and royalty-free suggestions]
**Tips**: [3 specific production tips for this video]

Be specific, creative, and platform-aware.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return res.status(502).json({ error: err?.error?.message || 'AI service error.' });
    }
    const data = await r.json();
    const text = (data.content || []).map(c => c.text || '').join('\n');
    return res.status(200).json({ result: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};
