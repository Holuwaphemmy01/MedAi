import { LlmAgent, LoopAgent, Event, EventActions } from "@iqai/adk";

export const getQuestionFromUserAgent = () => {
  const questionAskerAgent = new LlmAgent({
    name: "questionAsker",
    model: "gemini-2.5-flash",
    description: `
      You are a friendly medical assistant. Ask the user one question at a time to gather:
      - Age
      - Duration of symptoms
      - Description of symptoms
      - Any relevant medical history
      Once all this info is collected, respond with "INFO_COMPLETE".
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
