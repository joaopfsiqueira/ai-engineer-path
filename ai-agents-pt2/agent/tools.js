export const tools = [
  {
    type: "function",
    name: "search_swaps",
    description:
      "Search OpenSwap's database for open-source alternatives to a specified product.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Only the name of the product being replaced. Do not include any requirements or other words.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    strict: true,
  },
];
