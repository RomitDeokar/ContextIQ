# ContextIQ 2.0

> **An enterprise semantic firewall that verifies meaning before intelligence.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)

---

## What is ContextIQ?

Enterprise AI systems fail because they guess meaning from general world knowledge. In real organizations, the word **"apple"** might mean a dessert category, a product code, an internal project, or a hardware vendor — depending entirely on context.

ContextIQ solves this by placing a **local semantic firewall** between the user and the LLM. Before any AI response is generated, ContextIQ scores the ambiguity of the query, detects mixed-language input, checks session history, and either forces clarification or passes a fully resolved context to Gemini for language generation.

**The LLM never guesses. It only generates.**

---

## Problem Statement

Built for **Hack & Forge 2026** — Data Science Summit, BIT Mesra.

**Problem Statement 1:** Context-Aware Multilingual Semantic Intelligence for Enterprise AI.

> Conventional AI systems fail in enterprise environments because they attempt to infer meaning directly from general-world knowledge without verifying context.

---

## Live Demo

🔗 [contextiq.vercel.app](https://context-iq-eta.vercel.app/) 

---

## Key Features

| Feature | Description |
|--------|-------------|
| 🔥 **Semantic Firewall Engine** | Local ambiguity scoring runs before every Gemini call |
| 🌐 **Multilingual Detection** | `franc` detects Hinglish, Hindi, and mixed-language input word-by-word |
| 🔍 **Fuzzy Term Matching** | `fuse.js` identifies unknown or near-match enterprise terms |
| 🏢 **Department Context** | Dept selection re-weights glossary, reducing false ambiguity |
| 🧠 **Session Memory** | Prior resolutions adjust confidence score dynamically (±10) |
| 📋 **Semantic Audit Trail** | Last 3 decisions visible at all times for traceability |
| ⚠️ **Confidence Guard** | Blocks Gemini entirely when ambiguity score exceeds threshold |
| 📖 **Vocab Expansion** | Unknown terms are saved live to the org glossary via localStorage |

---

## How It Works

```
User selects department
        ↓
User types query
        ↓
languageDetector.js        ← franc: sentence + word-by-word Hindi check
        ↓
semanticFirewallEngine.js  ← fuse.js + vocab + session memory + dept weighting
        ↓
score > 60?
  YES  →  ClarificationCard + ConfidenceGuard (Gemini BLOCKED)
  NO   →  geminiClient.js (context pre-resolved)
        ↓
ChatWindow renders response
  + AmbiguityHeatmap
  + SemanticResolutionTrace
  + RecentDecisions (last 3)
        ↓
useChat.js saves resolution → feeds back into engine next query
```

---

## Ambiguity Scoring Formula

```
glossary exact match          × 30
+ multiple meanings found     × 25
+ mixed language detected     × 20   ← franc
+ unknown term penalty        × 15   ← fuse.js
+ missing dept context        × 10
+ session consistency adjust  ± 10
─────────────────────────────────────
  Total out of 100
```

### Score Thresholds

| Score | Action |
|-------|--------|
| `> 60` | ClarificationCard shown · Gemini **BLOCKED** · ConfidenceGuard fires |
| `40 – 60` | Gemini called **with ambiguity warning flag** |
| `< 40` | Gemini called · context already resolved · clean response |

### Session Memory Logic

```
same term → same meaning again  →  −10  (more certain)
same term → different meaning   →  +10  (conflict detected)
```

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | React 18 + Vite + TailwindCSS |
| AI | Gemini 1.5 Flash (free tier) |
| Language Detection | `franc` |
| Fuzzy Matching | `fuse.js` |
| Vocab Store | JSON + localStorage |
| Session Memory | React state + localStorage |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Project Structure

```
contextiq/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── DepartmentSelector.jsx      ← dept filter, glossary re-weighting
│   │   ├── ChatWindow.jsx              ← main chat interface
│   │   ├── MessageBubble.jsx           ← user + AI message bubbles
│   │   ├── ClarificationCard.jsx       ← clickable context options
│   │   ├── AmbiguityHeatmap.jsx        ← word risk highlights (red/amber/green)
│   │   ├── SemanticResolutionTrace.jsx ← full reasoning trace for current query
│   │   ├── RecentDecisions.jsx         ← last 3 semantic decisions (audit trail)
│   │   ├── ConfidenceGuard.jsx         ← blocks Gemini when score > 60
│   │   └── VocabExpansionLayer.jsx     ← unknown term → save to glossary
│   │
│   ├── data/
│   │   └── enterprise_vocab.json       ← 20+ terms, 4 departments, conflicting defs
│   │
│   ├── hooks/
│   │   ├── useChat.js                  ← chat state + session memory persistence
│   │   └── useAmbiguity.js             ← orchestrates engine + Gemini
│   │
│   ├── utils/
│   │   ├── geminiClient.js             ← Gemini API wrapper
│   │   ├── promptTemplates.js          ← system + user prompt templates
│   │   ├── semanticFirewallEngine.js   ← full scoring logic
│   │   └── languageDetector.js         ← franc wrapper, Hinglish detection
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/contextiq.git
cd contextiq

# Install dependencies
npm install
npm install lucide-react franc fuse.js

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Deploy to Vercel

```bash
npm run build
# Push to GitHub and import repo in Vercel
# Add VITE_GEMINI_API_KEY in Vercel environment variables
```

---

## Demo Flows

These are the 4 recommended demo flows that showcase every feature:

### Flow 1 — Department Weighting
- **Dept:** F&B
- **Input:** `Show apple performance`
- **What happens:** 4 glossary meanings found, dept weighting narrows to F&B dessert category, trace shows session memory empty, RecentDecisions populates

### Flow 2 — Hinglish Detection
- **Dept:** None selected
- **Input:** `Apple ka report dikhao`
- **What happens:** `franc` detects Hinglish word-by-word, score spikes above 60, ConfidenceGuard fires, Gemini blocked

### Flow 3 — Unknown Term / Vocab Expansion
- **Dept:** Manufacturing
- **Input:** `Falcon shipment delayed`
- **What happens:** `fuse.js` catches near-unknown term, VocabExpansionLayer prompts to save "falcon" to org glossary live

### Flow 4 — Session Memory (the closer)
- **Dept:** IT Helpdesk
- **Input:** `Book the issue` → wait for resolution → type `Book the issue` again
- **What happens:** Second query shows −10 session adjustment, score visibly drops, RecentDecisions shows both entries side by side, engine resolves faster

> **Flow 4 is the demo closer.** No other system shows live learning from session context. Run it last.

---

## Component Reference

### SemanticResolutionTrace

Displays the full reasoning trace after every query:

```
┌──────────────────────────────────────┐
│  Semantic Resolution Trace           │
├──────────────────────────────────────┤
│  Detected term    : apple            │
│  Meanings found   : 4                │
│  Department       : F&B (selected)   │
│  Confidence       : 82%              │
│  Trigger          : multiple         │
│                     glossary defs    │
│  Language         : Hinglish         │
│  Session memory   : no prior context │
│  Action taken     : clarified        │
└──────────────────────────────────────┘
```

### ConfidenceGuard

Fires when score > 60, Gemini is fully blocked:

```
┌──────────────────────────────────────────┐
│  ⚠  Confidence Guard Active              │
│                                          │
│  Score: 71 — clarification required      │
│  Reason: 4 conflicting definitions,      │
│  no department selected,                 │
│  Hinglish detected                       │
│                                          │
│  Clarify context before this query       │
│  can be safely processed.                │
└──────────────────────────────────────────┘
```

### RecentDecisions

Audit trail of the last 3 semantic decisions:

```
Recent Semantic Decisions
──────────────────────────────────────────────
[F&B]  apple    → score 82 — clarification required
[none] apple ka → score 71 — clarification required
[Mfg]  falcon   → score 15 — passed to gemini
```

---

## Enterprise Vocabulary

The seed glossary (`enterprise_vocab.json`) ships with 20 terms across 5 departments, each with 2–4 conflicting definitions. Examples:

| Term | Dept | Meaning |
|------|------|---------|
| apple | F&B | Premium dessert category |
| apple | Manufacturing | Product code A-PL-001 |
| apple | IT | Apple Inc. hardware asset |
| apple | Finance | Project Apple — Q3 audit |
| book | IT Helpdesk | Log a support ticket |
| book | Finance | Record in accounting ledger |
| book | HR | Schedule a meeting room |
| pipeline | IT | CI/CD deployment pipeline |
| pipeline | Finance | Sales opportunity pipeline |
| pipeline | Manufacturing | Physical fluid pipeline |

Unknown terms detected at runtime are saved to localStorage and merged into the live glossary automatically via VocabExpansionLayer.

---

## Judging Criteria Map

| Criterion | How ContextIQ addresses it |
|-----------|---------------------------|
| **Context understanding** | Department weighting + session ±10 memory adjustment |
| **Innovation** | Local semantic firewall scores before any LLM call |
| **Technical feasibility** | franc + fuse.js + Gemini — all free, all production-ready |
| **Multilingual intelligence** | franc detects Hinglish live, word-by-word |
| **Enterprise applicability** | 20-term org vocab + RecentDecisions audit trail |

---

## Architecture Decisions

**Why score locally before calling Gemini?**
Gemini has no knowledge of your organization's internal terminology. Passing an ambiguous query directly produces hallucinated or wrong-context responses. The local engine resolves meaning first; Gemini only handles language generation.

**Why franc for language detection?**
franc runs entirely in the browser, requires no API, and supports 400+ languages. Word-by-word detection handles short mixed phrases like "Apple ka report" reliably without sentence-level misclassification.

**Why fuse.js for unknown terms?**
Hard exact-match lookups miss near-matches ("falkon" vs "falcon"). fuse.js fuzzy matching with threshold 0.4 catches typos, abbreviations, and partial matches — critical for real enterprise input.

**Why localStorage over a backend?**
For a 24-hour hackathon prototype, localStorage provides real persistence across page reloads without infrastructure overhead. In production, this would be replaced by a shared team database (e.g., Supabase).

---

## Team
Arshdeep Singh - leader
Romit Deokar
Ketan

---

