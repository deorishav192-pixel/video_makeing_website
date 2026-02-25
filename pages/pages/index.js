import Head from 'next/head';
import { useState, useCallback } from 'react';

const GENRES = ['Vlog','Tutorial','Review','Short Film','Documentary','Comedy','Educational','Fitness','Cooking','Travel','Tech','Fashion','Gaming','Motivation','Interview'];
const TONES  = ['Energetic','Calm','Humorous','Inspirational','Dramatic','Professional','Casual','Mysterious','Heartwarming','Edgy'];
const DURS   = { YouTube:['1-3 min','5-7 min','10-15 min','20+ min'], Instagram:['15 sec','30 sec','60 sec','3-5 min'], Both:['30 sec','1-3 min','5-7 min','10+ min'] };

function parse(raw) {
  const sec = (key) => {
    const m = raw.match(new RegExp(`\\*\\*${key}\\*\\*:?\\s*([\\s\\S]*?)(?=\\*\\*(?:Video Title|Hook|Outline|Script|Thumbnail|Caption|Hashtag|Music|Tips)|$)`, 'i'));
    return m ? m[1].trim() : '';
  };
  const titleM = raw.match(/\*\*Video Title\*\*:?\s*([^\n]+)/i);
  const title = titleM ? titleM[1].replace(/["""]/g,'').trim() : 'Your Video Concept';
  const htags = [...raw.matchAll(/#[\w]+/g)].map(m=>m[0]).filter((v,i,a)=>a.indexOf(v)===i).slice(0,15);
  return { title, hook: sec('Hook'), outline: sec('Outline'), script: sec('Script'), thumbnail: sec('Thumbnail Concept'), caption: sec('Caption'), hashtags: htags, music: sec('Music'), tips: sec('Tips'), raw };
}

function Block({ label, children }) {
  if (!children) return null;
  return (
    <div style={{marginBottom:'26px'}}>
      <h3 style={{fontSize:'10px',letterSpacing:'3px',textTransform:'uppercase',color:'#3cffe0',marginBottom:'12px',display:'flex',alignItems:'center',gap:'8px'}}>
        <span style={{display:'inline-block',width:'16px',height:'1px',background:'#3cffe0'}} />{label}
      </h3>
      {children}
    </div>
  );
}

export default function Home() {
  const [platform, setPlatform] = useState('YouTube');
  const [genre,    setGenre]    = useState('Tutorial');
  const [tones,    setTones]    = useState(['Energetic']);
  const [duration, setDuration] = useState('');
  const [topic,    setTopic]    = useState('');
  const [audience, setAudience] = useState('');
  const [extras,   setExtras]   = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [result,   setResult]   = useState(null);
  const [copied,   setCopied]   = useState(false);

  const durs = DURS[platform];
  const toggleTone = useCallback(t => setTones(p => p.includes(t) ? p.filter(x=>x!==t) : [...p,t]), []);

  const generate = async () => {
    if (!topic.trim()) { setError('Please enter a video topic.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/generate', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ platform, genre, tones, duration: duration||durs[0], topic:topic.trim(), audience:audience.trim(), extras:extras.trim() }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Something went wrong.');
      else setResult(parse(data.result));
    } catch { setError('Network error - check your connection.'); }
    finally { setLoading(false); }
  };

  const copyAll = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.raw).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };

  const prose = { fontSize:'14px', lineHeight:'1.75', color:'#b8c8dd', fontWeight:'300' };
  const pre   = { background:'#0e1320', border:'1px solid #1e2a3a', borderRadius:'10px', padding:'18px', fontFamily:'monospace', fontSize:'13px', lineHeight:'1.8', color:'#b0c0d8', whiteSpace:'pre-wrap', overflowX:'auto', maxHeight:'360px', overflowY:'auto' };
  const inp   = { width:'100%', background:'#111827', border:'1px solid #1e2a3a', borderRadius:'8px', color:'#f0f4ff', fontFamily:'sans-serif', fontSize:'14px', padding:'10px 13px', outline:'none' };

  return (
    <>
      <Head>
        <title>ClipForge - AI Video Studio</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="description" content="Generate complete video scripts, outlines, thumbnails and hashtags for YouTube and Instagram." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
      </Head>

      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}}>
        <div style={{position:'absolute',width:'600px',height:'600px',borderRadius:'50%',filter:'blur(130px)',background:'rgba(232,255,60,0.04)',top:'-200px',right:'-100px'}} />
        <div style={{position:'absolute',width:'500px',height:'500px',borderRadius:'50%',filter:'blur(130px)',background:'rgba(60,255,224,0.03)',bottom:'-150px',left:'-100px'}} />
      </div>

      <div style={{position:'relative',zIndex:1,minHeight:'100vh',display:'flex',flexDirection:'column'}}>

        <header style={{padding:'20px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #1e2a3a',background:'rgba(8,11,18,0.9)',backdropFilter:'blur(12px)',position:'sticky',top:0,zIndex:100}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'26px',letterSpacing:'3px'}}>
            CLIP<span style={{color:'#e8ff3c'}}>FORGE</span>
          </div>
          <div style={{background:'rgba(232,255,60,0.1)',border:'1px solid rgba(232,255,60,0.3)',color:'#e8ff3c',fontSize:'10px',fontWeight:'600',letterSpacing:'2px',padding:'4px 10px',borderRadius:'4px'}}>
            AI VIDEO STUDIO
          </div>
        </header>

        <section style={{padding:'56px 40px 32px',textAlign:'center',maxWidth:'860px',margin:'0 auto'}}>
          <p style={{fontSize:'10px',letterSpacing:'4px',textTransform:'uppercase',color:'#6b7a99',marginBottom:'16px'}}>Powered by Claude AI</p>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(44px,7vw,84px)',lineHeight:'0.95',letterSpacing:'2px',marginBottom:'16px'}}>
            Generate <span style={{color:'#e8ff3c'}}>Viral</span><br />Video Concepts
          </h1>
          <p style={{color:'#6b7a99',fontSize:'16px',fontWeight:'300',lineHeight:'1.65',maxWidth:'460px',margin:'0 auto'}}>
            Complete scripts, outlines, thumbnails and hashtag strategies for YouTube and Instagram.
          </p>
        </section>

        <div style={{display:'grid',gridTemplateColumns:'360px 1fr',flex:1,borderTop:'1px solid #1e2a3a'}}>

          <aside style={{borderRight:'1px solid #1e2a3a',padding:'28px',background:'#0e1320',overflowY:'auto'}}>

            <div style={{marginBottom:'24px'}}>
              <p style={{fontSize:'10px',letterSpacing:'3px',textTransform:'uppercase',color:'#6b7a99',marginBottom:'12px'}}>Platform</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                {['YouTube','Instagram','Both'].map(p => (
                  <button key={p} onClick={()=>{setPlatform(p);setDuration('');}} type="button"
                    style={{background:platform===p?'rgba(232,255,60,0.08)':'#111827',border:`2px solid ${platform===p?'#e8ff3c':'#1e2a3a'}`,borderRadius:'10px',padding:'13px 10px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',color:platform===p?'#e8ff3c':'#6b7a99',fontFamily:'sans-serif',fontSize:'12px',fontWeight:'600',transition:'all 0.2s',gridColumn:p==='Both'?'1/-1':'auto'}}>
                    <span style={{fontSize:'18px'}}>{p==='YouTube'?'▶':p==='Instagram'?'◈':'⬡'}</span>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:'24px'}}>
              <p style={{fontSize:'10px',letterSpacing:'3px',textTransform:'uppercase',color:'#6b7a99',marginBottom:'12px'}}>Content</p>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',marginBottom:'7px'}}>Topic <span style={{color:'#e8ff3c'}}>*</span></label>
                <input type="text" placeholder="e.g. Morning routine for productivity" value={topic}
                  onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generate()}
                  maxLength={300} style={inp} />
              </div>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',marginBottom:'7px'}}>Genre</label>
                <select value={genre} onChange={e=>setGenre(e.target.value)} style={{...inp,cursor:'pointer'}}>
                  {GENRES.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',marginBottom:'7px'}}>Target Audience <span style={{color:'#6b7a99',fontWeight:'400',fontSize:'12px'}}>(optional)</span></label>
                <input type="text" placeholder="e.g. Busy professionals 25-40" value={audience}
                  onChange={e=>setAudience(e.target.value)} maxLength={200} style={inp} />
              </div>
            </div>

            <div style={{marginBottom:'24px'}}>
              <p style={{fontSize:'10px',letterSpacing:'3px',textTransform:'uppercase',color:'#6b7a99',marginBottom:'12px'}}>Style</p>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',marginBottom:'7px'}}>Tone</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                  {TONES.map(t=>(
                    <button key={t} onClick={()=>toggleTone(t)} type="button"
                      style={{background:tones.includes(t)?'rgba(60,255,224,0.1)':'#111827',border:`1px solid ${tones.includes(t)?'#3cffe0':'#1e2a3a'}`,borderRadius:'20px',padding:'5px 13px',cursor:'pointer',fontSize:'12px',fontWeight:'600',color:tones.includes(t)?'#3cffe0':'#6b7a99',fontFamily:'sans-serif',transition:'all 0.18s'}}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',marginBottom:'7px'}}>Duration</label>
                <div style={{display:'flex',gap:'6px'}}>
                  {durs.map(d=>(
                    <button key={d} onClick={()=>setDuration(d)} type="button"
                      style={{flex:1,background:duration===d?'rgba(232,255,60,0.08)':'#111827',border:`1px solid ${duration===d?'#e8ff3c':'#1e2a3a'}`,borderRadius:'8px',padding:'8px 4px',cursor:'pointer',fontFamily:'sans-serif',fontSize:'11px',fontWeight:'600',color:duration===d?'#e8ff3c':'#6b7a99',transition:'all 0.18s'}}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block',fontSize:'13px',fontWeight:'600',marginBottom:'7px'}}>Special Notes <span style={{color:'#6b7a99',fontWeight:'400',fontSize:'12px'}}>(optional)</span></label>
                <textarea placeholder="e.g. Include a product review, end with CTA" value={extras}
                  onChange={e=>setExtras(e.target.value)} maxLength={400} rows={3}
                  style={{...inp,resize:'vertical',lineHeight:'1.5'}} />
              </div>
            </div>

            <button onClick={generate} disabled={loading} type="button"
              style={{width:'100%',padding:'15px',borderRadius:'12px',border:'none',cursor:loading?'not-allowed':'pointer',background:'#e8ff3c',color:'#080b12',fontFamily:"'Bebas Neue',sans-serif",fontSize:'20px',letterSpacing:'3px',opacity:loading?0.6:1,transition:'transform 0.2s'}}>
              {loading ? 'GENERATING...' : 'GENERATE VIDEO'}
            </button>

            {error && (
              <div style={{marginTop:'14px',background:'rgba(255,79,106,0.08)',border:'1px solid rgba(255,79,106,0.3)',borderRadius:'10px',padding:'14px',color:'#ff8a9a',fontSize:'13px',lineHeight:'1.6'}}>
                {error}
              </div>
            )}
          </aside>

          <main style={{padding:'36px',overflowY:'auto',background:'#080b12'}}>
            {!loading && !result && (
              <div style={{minHeight:'400px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'14px',color:'#6b7a99',textAlign:'center'}}>
                <div style={{fontSize:'60px',opacity:0.25}}>🎬</div>
                <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'28px',letterSpacing:'2px',color:'#1e2a3a'}}>Your Video Awaits</h2>
                <p style={{fontSize:'14px',fontWeight:'300',lineHeight:'1.7',maxWidth:'300px'}}>Fill in your preferences and hit Generate to create a complete, ready-to-shoot video concept.</p>
              </div>
            )}

            {loading && (
              <div style={{minHeight:'400px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'14px',textAlign:'center'}}>
                <div style={{width:'46px',height:'46px',borderRadius:'50%',border:'2px solid #1e2a3a',borderTopColor:'#e8ff3c',animation:'spin 0.75s linear infinite'}} />
                <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'22px',letterSpacing:'3px',color:'#6b7a99'}}>Crafting Your Vision</p>
                <p style={{fontSize:'13px',color:'#6b7a99',fontWeight:'300'}}>Building script, outline, thumbnail and more...</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}

            {result && !loading && (
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'18px'}}>
                  <button onClick={generate} type="button" style={{background:'transparent',border:'1px solid #1e2a3a',color:'#6b7a99',borderRadius:'8px',padding:'7px 16px',cursor:'pointer',fontSize:'12px',fontWeight:'600',fontFamily:'sans-serif'}}>Regenerate</button>
                  <span style={{fontSize:'12px',color:'#6b7a99'}}>AI-generated - refine as needed</span>
                </div>

                <div style={{background:'#111827',border:'1px solid #1e2a3a',borderRadius:'16px',overflow:'hidden'}}>
                  <div style={{padding:'22px 26px',borderBottom:'1px solid #1e2a3a',background:'linear-gradient(135deg,rgba(232,255,60,0.04),transparent)',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'16px'}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'10px'}}>
                        <span style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',fontWeight:'600',padding:'3px 9px',borderRadius:'4px',background:platform==='YouTube'?'rgba(255,0,0,0.13)':platform==='Instagram'?'rgba(200,50,255,0.12)':'rgba(60,255,224,0.1)',color:platform==='YouTube'?'#ff6060':platform==='Instagram'?'#e080ff':'#3cffe0',border:`1px solid ${platform==='YouTube'?'rgba(255,0,0,0.2)':platform==='Instagram'?'rgba(200,50,255,0.2)':'rgba(60,255,224,0.2)'}`}}>{platform}</span>
                        <span style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',fontWeight:'600',padding:'3px 9px',borderRadius:'4px',background:'rgba(232,255,60,0.1)',color:'#e8ff3c',border:'1px solid rgba(232,255,60,0.2)'}}>{duration||durs[0]}</span>
                        <span style={{fontSize:'10px',letterSpacing:'2px',textTransform:'uppercase',fontWeight:'600',padding:'3px 9px',borderRadius:'4px',background:'rgba(255,255,255,0.04)',color:'#6b7a99',border:'1px solid #1e2a3a'}}>{genre}</span>
                      </div>
                      <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'28px',letterSpacing:'1px',lineHeight:'1.1'}}>{result.title}</h2>
                    </div>
                    <button onClick={copyAll} type="button" style={{background:'#0e1320',border:'1px solid #1e2a3a',color:'#6b7a99',borderRadius:'8px',padding:'7px 14px',cursor:'pointer',fontSize:'12px',fontWeight:'600',whiteSpace:'nowrap',fontFamily:'sans-serif',flexShrink:0}}>
                      {copied ? 'Copied!' : 'Copy All'}
                    </button>
                  </div>

                  <div style={{padding:'26px'}}>
                    <Block label="Hook - First 3-5 Seconds"><p style={prose}>{result.hook}</p></Block>
                    <Block label="Video Outline">
                      <div style={{background:'#0e1320',border:'1px solid #1e2a3a',borderRadius:'10px',padding:'6px 16px'}}>
                        {result.outline.split('\n').map(l=>l.replace(/^[\d.\-*]+\s*/,'')).filter(Boolean).map((line,i,arr)=>(
                          <div key={i} style={{display:'flex',gap:'12px',padding:'8px 0',borderBottom:i<arr.length-1?'1px solid #1e2a3a':'none'}}>
                            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'14px',color:'#e8ff3c',minWidth:'22px',lineHeight:'1.75'}}>{String(i+1).padStart(2,'0')}</span>
                            <span style={prose}>{line}</span>
                          </div>
                        ))}
                      </div>
                    </Block>
                    <Block label="Sample Script"><pre style={pre}>{result.script}</pre></Block>
                    <Block label="Thumbnail Concept">
                      <div style={{background:'linear-gradient(135deg,#0e1320,#111827)',border:'1px solid #1e2a3a',borderRadius:'12px',padding:'20px',aspectRatio:'16/9',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                        <span style={{fontSize:'9px',letterSpacing:'3px',textTransform:'uppercase',color:'#6b7a99'}}>THUMBNAIL PREVIEW</span>
                        <div>
                          <p style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'clamp(16px,2.5vw,26px)',lineHeight:'1.1'}}>{result.title.toUpperCase()}</p>
                          <p style={{fontSize:'12px',color:'#6b7a99',fontWeight:'300',marginTop:'4px'}}>{(result.thumbnail||'').slice(0,90)}</p>
                        </div>
                      </div>
                      <p style={{...prose,marginTop:'12px'}}>{result.thumbnail}</p>
                    </Block>
                    <Block label={platform==='Instagram'?'Instagram Caption':'YouTube Description'}><pre style={pre}>{result.caption}</pre></Block>
                    <Block label="Music Direction"><p style={prose}>{result.music}</p></Block>
                    <Block label="Production Tips"><p style={prose}>{result.tips}</p></Block>
                    {result.hashtags.length > 0 && (
                      <Block label="Hashtags">
                        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                          {result.hashtags.map((h,i)=>(
                            <span key={i} style={{background:'rgba(232,255,60,0.07)',border:'1px solid rgba(232,255,60,0.2)',color:'#e8ff3c',fontSize:'12px',fontWeight:'600',padding:'4px 12px',borderRadius:'20px'}}>{h}</span>
                          ))}
                        </div>
                      </Block>
                    )}
                    <div style={{display:'flex',gap:'10px',marginTop:'24px',paddingTop:'24px',borderTop:'1px solid #1e2a3a',flexWrap:'wrap'}}>
                      <button onClick={copyAll} type="button" style={{flex:1,minWidth:'140px',padding:'12px',borderRadius:'8px',cursor:'pointer',fontFamily:'sans-serif',fontSize:'13px',fontWeight:'600',background:'#e8ff3c',color:'#080b12',border:'1px solid #e8ff3c'}}>
                        {copied?'Copied!':'Copy Full Concept'}
                      </button>
                      <button onClick={generate} type="button" style={{flex:1,minWidth:'140px',padding:'12px',borderRadius:'8px',cursor:'pointer',fontFamily:'sans-serif',fontSize:'13px',fontWeight:'600',background:'transparent',color:'#6b7a99',border:'1px solid #1e2a3a'}}>
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        <footer style={{textAlign:'center',padding:'18px',borderTop:'1px solid #1e2a3a',fontSize:'12px',color:'#6b7a99',background:'#0e1320'}}>
          Built with ClipForge · Powered by Claude AI
        </footer>
      </div>
    </>
  );
}
