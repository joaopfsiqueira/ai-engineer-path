export const giftSchema = {
  type: "json_schema",
  json_schema: {
    name: "gift_suggestions",
    schema: {
      type: "object",
      properties: {
        gifts: {
          type: "array",
          items: {
            type: "object",
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
  },
};
