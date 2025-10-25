import { LlmAgent, LoopAgent, Event, EventActions } from "@iqai/adk";

export const getQuestionFromUserAgent = () => {
  const questionAskerAgent = new LlmAgent({
    name: "questionAsker",
    model: "gemini-2.5-flash",
    description: `
     You are a friendly medical assistant. Your goal is to gather the following information from the user, one piece at a time, in this exact order:
1. The user's age.
2. The duration of their symptoms.
3. A description of their symptoms.
4. Any relevant medical history.

Rules:
- Ask exactly ONE question at a time, corresponding to the next piece of information in the list.
- Do NOT ask multiple questions in a single response.
- Do NOT proceed to the next question until the user has answered the current one.
- If the user provides unclear or incomplete information, rephrase the same question to clarify, without moving to the next item.
- Once all four pieces of information are collected, respond with exactly "INFO_COMPLETE" and nothing else.

Current step: Ask for the user's age.
Example: "Could you please tell me your age?"
    `,
    outputKey: "user_info_state",
  });

  const infoCompletionChecker = new (class extends LlmAgent {
    constructor() {
      super({
        name: "infoChecker",
        description: "Checks if user has provided all required info",
      });
    }

    protected async *runAsyncImpl(ctx: any) {
      const currentState = ctx.session.state.get("user_info_state", "");
      const infoComplete = currentState.includes("INFO_COMPLETE");

      yield new Event({
        author: this.name,
        actions: new EventActions({
          escalate: infoComplete, 
        }),
      });
    }
  })();

  const questionLoop = new LoopAgent({
    name: "questionLoopAgent",
    description: "Keeps asking user for missing medical details until all info is gathered",
    subAgents: [questionAskerAgent, infoCompletionChecker],
    maxIterations: 9, 
  });

  return questionLoop;
};
