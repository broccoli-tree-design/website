/** Every module a client workflow can use, in workflow order. Workflows
 *  pick modules by these keys. */
export const MODULES = {
  insights: "Insights",
  ideation: "Ideation",
  opportunity: "Opportunity",
  audience: "Audience",
  attention: "Attention",
  channel: "Channel",
  investment: "Investment",
  flight: "Flight",
  optimization: "Optimization",
} as const;
