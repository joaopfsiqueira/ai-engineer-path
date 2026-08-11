export const giftSchemaResponses = {
  type: "json_schema",
  name: "gift_suggestions",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      gifts: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            price_range: { type: "string" },
            why_its_good: { type: "string" },
          },
          required: ["name", "price_range", "why_its_good"],
        },
      },
    },
    required: ["gifts"],
  },
};
