import { readFileSync } from "node:fs";
const swaps = JSON.parse(readFileSync(new URL("./swaps.json", import.meta.url), "utf-8"));

// The agent passes the model's search_swaps arguments into this function.
export async function searchSwaps({ query } = {}) {
  await simulateLatency();

  // Search the database entries for every match.
  const results = swaps.filter((swap) => matchesQuery(swap, query));

  return {
    totalMatches: results.length,
    swaps: results,
  };
}

// Return true if the swap's replaces array contains the query string
function matchesQuery(swap, query = "") {
  if (typeof query !== "string") {
    return false;
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return false;
  }

  return swap.replaces.some(
    (product) => product.toLowerCase() === normalizedQuery
  );
}

// Return a list of starter products for the app to show as chips
export function getStarterSwapOptions() {
  return STARTER_SWAP_OPTIONS;
}

const STARTER_SWAP_OPTIONS = [
  "Confluence",
  "Typeform",
  "ChatGPT",
  "Claude",
  "Google Drive",
  "Google Analytics",
  "Notion",
  "Dropbox",
  "Firebase",
  "Shopify",
  "Trello",
  "Airtable",
  "Calendly",
  "Discord",
  "Intercom",
  "Mailchimp",
  "Miro",
  "Obsidian",
  "Zapier",
  "Zendesk",
];

// A real database call takes a moment, so searchSwaps waits before answering.
const SIMULATED_DB_LATENCY_MS = 300;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateLatency() {
  await wait(SIMULATED_DB_LATENCY_MS);
}
