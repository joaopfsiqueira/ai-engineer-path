import * as ui from "./ui.js";

const searchForm = document.getElementById("search-form");

start();

async function start() {
  // Register event handlers and load initial data.
  document.getElementById("user-input").addEventListener("input", ui.handleInputChange);
  searchForm.addEventListener("submit", handleSwapRequest);
  ui.syncSubmitAvailability();

  // Load the popular software names from the server so the UI mirrors the database.
  await ui.loadPopularSoftware();
}

async function handleSwapRequest(e) {
  // Keep the form on the page so JavaScript can handle the request
  e.preventDefault();

  const userPrompt = buildPrompt();

  if (!userPrompt) {
    ui.renderOutputError("Type what you want to replace or select at least one starter swap.");
    ui.syncSubmitAvailability();
    return;
  }

  // Show the loading state before the network request starts
  ui.setLoading(true);

  try {
    // Send the prompt to the Express route
    const response = await fetch("/api/swaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Server returned an error");
    }

    // Challenge: See challenge.md for instructions.
    ui.renderOutputError(data.swapAgentResponse);
  } catch (error) {
    console.error(error);
    ui.renderOutputError("Sorry, something went wrong. Please try again.");
  } finally {
    // Always reset the UI, even if the request fails
    ui.setLoading(false);
  }
}

// Build a prompt that includes the user's text and any selected starter swaps
function buildPrompt() {
  const userInputText = ui.getUserInputText();
  const selectedSwapNames = ui.getSelectedSwapNames();
  const promptSections = [];

  // Include the starter swaps if any are selected
  if (selectedSwapNames.length > 0) {
    const selectedSwapsString = selectedSwapNames.map((swapName) => `- ${swapName}`).join("\n");
    promptSections.push(
      `Starter swaps selected:\n${selectedSwapsString}`
    );
  }

  // Include the user's text if they typed anything
  if (userInputText) {
    promptSections.push(`User request:\n${userInputText}`);
  }

  // Omit empty inputs, then separate the remaining labeled sections.
  return promptSections.join("\n\n");
}
