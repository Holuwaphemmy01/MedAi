# MedAI

AI-powered Telegram health assistant built with TypeScript and the IQAI ADK. MedAI guides users through a short conversation, analyzes symptoms, and provides safe, general health recommendations. The bot runs on Telegram using the Model Context Protocol (MCP) provided by @iqai/adk.

---

## Overview

MedAI is organized as a small set of cooperating LLM agents:
- Question Asker: collects age, duration of symptoms, description, and history, one question at a time.
- Symptom Analyzer: reasons over the collected information using the configured LLM model.
- Recommendation Agent: summarizes likely causes and safe next steps (non-diagnostic guidance).
- Telegram Agent: connects the pipeline to Telegram via MCP and relays messages.

The runtime entry point is src/index.ts, which wires the pipeline, the Telegram MCP tools, and a simple response formatter.

## Tech Stack
- Language: TypeScript (tsc, tsx)
- Runtime: Node.js
- Framework/SDK: @iqai/adk (agents, MCP Telegram integration)
- Validation: zod
- Env management: dotenv
- Build: TypeScript compiler (tsc)

## Requirements
- Node.js LTS (recommended): 18+ (TODO: verify exact version used in deployment)
- A Telegram bot token from @BotFather
- A Google AI Studio API key (for Gemini) or compatible key for the configured model

## Getting Started

1) Clone and install
- Using npm (package-lock.json is present in this repo):
  - npm install
- Using pnpm (optional):
  - pnpm install

2) Configure environment
Create a .env file in the project root with the variables below. There is no example.env in this repo; create it manually.

Example .env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
GOOGLE_API_KEY=your_google_api_key
# Optional overrides
LLM_MODEL=gemini-2.5-flash
ADK_DEBUG=false

3) Create your Telegram bot
- Open Telegram and talk to @BotFather
- Send /newbot and follow prompts to obtain a token
- Put the token into TELEGRAM_BOT_TOKEN in .env

4) Run in development
- npm run dev
  - Starts tsx watching src/index.ts

5) Build and run in production
- npm run build
  - Compiles to dist/
- npm start
  - Runs dist/index.js

## Scripts
Defined in package.json:
- dev: tsx watch src/index.ts
- build: tsc
- prebuild: pnpm clean (invoked by build; see note below)
- clean: rimraf dist
- start: node dist/index.js

Note: prebuild uses pnpm clean. If you use npm only, prebuild will still execute the clean script correctly because it is defined in package.json. You do not need pnpm installed to run npm run build.

## Entry Points
- Runtime entry: src/index.ts (compiled to dist/index.js)
- Root agent builder: src/agents/agent.ts
- Telegram MCP agent: src/agents/telegram-agent/agent.ts and src/agents/telegram-agent/tool.ts

## Environment Variables
Validated in src/env.ts using zod. Required unless defaulted.
- TELEGRAM_BOT_TOKEN: Telegram Bot API token (required)
- GOOGLE_API_KEY: API key for the configured LLM (required)
- LLM_MODEL: Model name (default: gemini-2.5-flash)
- ADK_DEBUG: boolean flag (default: false)

## How it Works (High Level)
- src/index.ts initializes dotenv, builds the root agent (src/agents/agent.ts), creates a sampling handler, and sets up the Telegram agent tools via MCP.
- The QuestionAsker loops until required info is gathered (INFO_COMPLETE), then the SymptomAnalyzer and RecommendationAgent produce a response.
- formatMedAIResponse in src/utils/medAIFormatter.ts cleans response text for Telegram.

## Project Structure
- src/
  - index.ts — app entry point
  - env.ts — zod-validated environment
  - utils/
    - medAIFormatter.ts — strips markdown artifacts for clean Telegram output
  - agents/
    - agent.ts — root agent setup
    - medical-pipeline-agent/
      - agent.ts — sequential pipeline (question → analyze → recommend)
    - question-asker-agent/
      - agent.ts — LoopAgent that gathers user info
    - symptom-analyzer-agent/
      - agent.ts — uses env.LLM_MODEL for analysis
    - recommendation-agent/
      - agent.ts — produces safe, general recommendations
    - telegram-agent/
      - agent.ts — defines Telegram-facing agent
      - tool.ts — initializes MCP Telegram tools


## Data and Persistence
- This repository does not explicitly configure a database. A src/data/ path is ignored in .gitignore for potential future use. TODO: document any persistence if added later.

## Running with ADK CLI (Optional)
If you use the ADK CLI for local prototyping, you can install it globally:
- npm install -g @iqai/adk-cli
Then you may try adk run or adk web for interactive testing. These are optional and not required to run MedAI.

## License
- MIT (as declared in package.json). TODO: add a LICENSE file to the repository root if one is desired.

## Notes and TODOs
- Verify Node.js version used in deployment and update Requirements accordingly.
- Add tests and CI.
- If Dockerization is required, add a Dockerfile and document usage.
