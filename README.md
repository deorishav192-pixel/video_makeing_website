# 🎬 ClipForge — AI Video Studio

Generate complete, ready-to-shoot video concepts for **YouTube** and **Instagram** using Claude AI.  
Includes scripts, outlines, thumbnail ideas, captions, hashtags, music direction, and production tips.

---

## ✨ Features

- 🎯 Platform-aware generation (YouTube / Instagram / Both)
- 📝 Full script + structured outline with timestamps
- 🖼️ Thumbnail concept generator
- 📋 Platform-optimised caption / description
- #️⃣ Hashtag strategy
- 🎵 Music direction & royalty-free suggestions
- 🔒 **Secure** — API key never exposed to the browser
- ⚡ Rate limiting to prevent abuse
- 🚀 One-click Vercel deploy

---

## 🚀 Deploy in 5 minutes (Vercel — recommended)

### Step 1 — Get your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up / log in
3. Navigate to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

---

### Step 2 — Upload to GitHub

1. Create a new repo on [github.com](https://github.com) (private recommended)
2. Upload all project files **or** use the CLI:

```bash
git init
git add .
git commit -m "Initial ClipForge commit"
git remote add origin https://github.com/YOUR_USERNAME/clipforge.git
git push -u origin main
```

---

### Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. In **Environment Variables**, add:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-your-key-here` |
| `RATE_LIMIT_PER_HOUR` | `10` (or whatever limit you want) |

4. Click **Deploy** — done! 🎉

Your site will be live at `https://your-project.vercel.app`

---

## 💻 Run locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and paste your ANTHROPIC_API_KEY

# 3. Start dev server
npm run dev

# Open http://localhost:3000
```

---

## 📁 Project Structure

```
clipforge/
├── pages/
│   ├── _app.js          # Global app wrapper
│   ├── _document.js     # HTML document & meta tags
│   ├── index.js         # Main UI page
│   └── api/
│       └── generate.js  # 🔒 Secure API proxy (server-side only)
├── styles/
│   ├── globals.css      # Global CSS variables & resets
│   └── Home.module.css  # Component styles
├── .env.local.example   # Environment variable template
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

---

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | — | **Required.** Your Anthropic API key |
| `RATE_LIMIT_PER_HOUR` | `10` | Max generations per IP per hour |

---

## 💰 Cost

Each generation uses approximately **1,000–2,000 tokens** with Claude claude-opus-4-5.  
At current pricing (~$0.003–$0.015 per generation), running 10 req/hour costs **< $1/day** for typical usage.

---

## 🛡️ Security

- API key is **only** used server-side in `/pages/api/generate.js`
- Input is validated and sanitised before sending to Anthropic
- IP-based rate limiting prevents abuse
- `.env.local` is in `.gitignore` — your key is never committed

---

## 🔄 Upgrading the AI model

In `pages/api/generate.js`, change the `model` field:

```js
model: "claude-opus-4-5",         // Most capable (current)
model: "claude-sonnet-4-5",   // Faster & cheaper
model: "claude-haiku-4-5",    // Fastest & cheapest
```

---

## 📄 License

MIT — use freely, modify, and deploy your own version.
