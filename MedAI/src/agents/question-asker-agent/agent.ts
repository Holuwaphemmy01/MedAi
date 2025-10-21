// import { LlmAgent } from "@iqai/adk";
// import { env } from "../../env";


// export const getQuestionFromUserAgent = () => {
//     const questionAgent = new LlmAgent({
//         name: "question_agent",
//         description: "Responsible for gathering all relevant patient information through structured and adaptive questioning. It collects key data such as age, gender, symptom descriptions, duration, severity, and relevant medical history. The agent ensures completeness and accuracy of responses, reformats them into a structured format, and prepares the data for downstream analysis by other agents.",
//         model: env.LLM_MODEL,
//     });

//     return questionAgent;
// };




// src/agents/QuestionAskerAgent.ts
import { LlmAgent, LoopAgent, Event, EventActions } from "@iqai/adk";

/**
 * Step 1: Ask one question about the user's health
 */
const questionAgent = new LlmAgent({
  name: "question-asker",
  model: "gpt-4o-mini",
  instruction: `
    You are a medical intake assistant.
    Ask the user one relevant question at a time about their condition.
    Focus on gathering information like:
    - Duration
    - Severity
    - Medical history
    - Medications
    - Lifestyle or travel

    Keep each question short and clear.
  `,
  outputKey: "user_response",
});

/**
 * Step 2: Evaluate if enough information has been gathered.
 */
const completenessChecker = new (class extends LlmAgent {
  constructor() {
    super({
      name: "completeness-checker",
      model: "gpt-4o-mini",
      instruction: `
        Review the collected responses and decide:
        If enough info exists to analyze symptoms (age, duration, severity, medical history, etc.),
        respond ONLY with "DONE".
        Otherwise, respond with a hint about the next needed question.
      `,
      outputKey: "check_status",
    });
  }
})();

/**
 * Step 3: Stop loop when info is complete
 */
const stopConditionChecker = new (class extends LlmAgent {
  constructor() {
    super({
      name: "stop-condition-checker",
      description: "Ends the questioning loop when completeness is achieved",
    });
  }

  protected async *runAsyncImpl(ctx: any) {
    const status = ctx.session.state.get("check_status", "");
    const complete = status.includes("DONE");

    yield new Event({
      author: this.name,
      actions: new EventActions({ escalate: complete }),
    });
  }
})();

/**
 * Step 4: Wrap them into a loop — the main QuestionAskerAgent
 */
export const QuestionAskerAgent = new LoopAgent({
  name: "question-loop",
  description: "Continuously asks relevant questions until enough health data is gathered",
  subAgents: [questionAgent, completenessChecker, stopConditionChecker],
  maxIterations: 5, // stops automatically after 5 rounds
});