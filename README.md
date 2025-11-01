# Brief to Plan

A learning project to explore **LangGraph** for building AI agent workflows. Takes a project brief and generates a detailed technical implementation plan.

## What it does

Converts a simple project idea into:
- Technical requirements analysis
- System architecture design
- Detailed backend/frontend task breakdown with epics, stories, and tasks

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add your OpenAI API key to `.env`:
```bash
OPENAI_API_KEY=sk-...
```

## Run

```bash
npm start -- --brief "Your project idea here"
```

Example:
```bash
npm start -- --brief "A web app to track workout sessions with timers and friend sharing"
```

## Output

- Console: Quick summary
- File: Detailed markdown plan in `output/plan-[timestamp].md`

## Built with

- **LangGraph** - AI agent orchestration (the main learning focus!)
- **Vercel AI SDK** - Structured outputs
- **OpenAI GPT-4o** - Language model
- **TypeScript** - Type safety
