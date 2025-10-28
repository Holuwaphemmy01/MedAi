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
- Node.js LTS: 18+ recommended; Dockerfile uses Node 20-alpine (TODO: lock exact supported versions)
- npm (package-lock.json present). You may use pnpm/yarn, but npm is the default here.
- A Telegram bot token from @BotFather
- A Google AI Studio API key (for Gemini) or compatible key for the configured model

## Getting Started

1) Install dependencies
- npm install

2) Configure environment
Create a .env file in the project root with the variables below.

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

5) Build and run in production (local)
- npm run build
  - Compiles to dist/
- npm start
  - Start script currently points to dist/index.js. If your build outputs dist/src/index.js, see Entry Points for the TODO to reconcile.

6) Docker (optional)
- Build: docker build -t medai:local .
- Run (env-file): docker run --env-file .env --name medai-bot --rm medai:local
  - Note: The Dockerfile uses Node 20-alpine and CMD to run dist/src/index.js. Ensure build output matches or adjust CMD accordingly.

## Scripts
Defined in package.json:
- dev: tsx watch src/index.ts
- build: tsc
- prebuild: npm run clean
- clean: node -e "require('fs').rmSync('dist', { recursive: true, force: true })"
- start: node dist/index.js

Note: prebuild runs the clean script via npm run clean prior to tsc. No need for pnpm; npm is the default in this repo.

## Entry Points
- Runtime entry: src/index.ts
- Build output: By default tsc emits to dist/. With the current tsconfig (rootDir: ./, include: src/**/*.ts), compiled entry typically ends up at dist/src/index.js.
  - package.json "main" and start script reference dist/index.js. TODO: Reconcile by either changing tsconfig.rootDir to "src" or updating the start path.
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
- .gitignore — ignores dist/, env files, and src/data/
- tsconfig.json — TypeScript config (emits to dist/)
- package.json — scripts and dependencies
- Dockerfile — container build/runtime config (CMD runs dist/src/index.js)


## Data and Persistence
- No database is configured. A src/data/ path is ignored in .gitignore for potential future use.
- TODO: Document any persistence or storage if added later (e.g., conversation history store).

## Running with ADK CLI (Optional)
If you use the ADK CLI for local prototyping, you can install it globally:
- npm install -g @iqai/adk-cli
Then you may try adk run or adk web for interactive testing. These are optional and not required to run MedAI.

## License
- MIT license (declared in package.json). TODO: Add a LICENSE file to the repository root to include the full text.

## Deploying to Vercel (Websites)
Vercel is optimized for request/response workloads (static sites, Next.js, serverless/edge functions). This project is a long‑running Telegram bot process that keeps a connection open to Telegram via MCP and does not expose an HTTP handler. As‑is, it is not a good fit for Vercel serverless because Vercel does not allow background/long‑lived processes.

If you still want to use Vercel, you would need to refactor the bot to an HTTP webhook model so Telegram calls your Vercel Function on each update. That refactor is not implemented in this repository. High‑level changes required:
- Add an HTTP handler (api/telegram.ts) that verifies Telegram updates and routes messages into your agents.
- Switch the Telegram integration to webhook mode instead of a long‑running MCP process.
- Ensure all work completes within the Vercel function timeout and is stateless between requests (persist conversation in an external store).

Build command on Vercel (if you add a webhook function):
- Install Command: npm install
- Build Command: npm run build
- Output Directory: none (serverless functions don’t produce a static output)

Recommended deployment targets for this repository without refactors:
- Railway.app: Deploy as a long‑running Node service (start command: npm start); set TELEGRAM_BOT_TOKEN and GOOGLE_API_KEY env vars.
- Render.com: Web Service, Node runtime; Build Command: npm run build; Start Command: npm start.
- Fly.io / Docker / a VM/VPS: Run the Node process continuously.

If you want us to add the webhook HTTP function for Vercel, please confirm and we’ll create a minimal api/telegram endpoint and adapt the Telegram integration accordingly.

## Tests
- There are currently no automated tests in this repository.
- TODOs:
  - Add unit tests (e.g., using vitest or jest) for utils and agent logic.
  - Add integration tests for the Telegram flow (can be mocked).
  - Set up CI (e.g., GitHub Actions) to run lint/build/tests.

## Notes and TODOs
- Verify Node.js version used in deployment and update Requirements accordingly.
- Reconcile build output path vs. start script (dist/index.js vs dist/src/index.js).
- Consider adding a Docker Compose file if more services are introduced.
