import { marked } from "marked";
import DOMPurify from "dompurify";
import { ICONS } from "./icons.js";

const SWAP_PRESENTATION = {
  Confluence: { icon: ICONS.confluence },
  Typeform: { icon: ICONS.typeform },
  ChatGPT: { icon: ICONS.openai },
  Claude: { icon: ICONS.anthropic },
  "Google Drive": { label: "Drive", icon: ICONS.google },
  "Google Analytics": { label: "Analytics", icon: ICONS.google },
  Notion: { icon: ICONS.notion },
  Dropbox: { icon: ICONS.dropbox },
  Firebase: { icon: ICONS.firebase },
  Shopify: { icon: ICONS.shopify },
  Trello: { icon: ICONS.trello },
  Airtable: { icon: ICONS.airtable },
  Calendly: { icon: ICONS.calendly },
  Discord: { icon: ICONS.discord },
  Intercom: { icon: ICONS.intercom },
  Mailchimp: { icon: ICONS.mailchimp },
  Miro: { icon: ICONS.miro },
  Obsidian: { icon: ICONS.obsidian },
  Zapier: { icon: ICONS.zapier },
  Zendesk: { icon: ICONS.zendesk },
};

// Manage the browser-side UI state and DOM updates
const starterSwapsContainer = document.getElementById("starter-swaps");
const outputContent = document.getElementById("output-content");
const submitButton = document.getElementById("submit-button");
const submitLabel = document.getElementById("submit-label");
const outputContainer = document.getElementById("output-container");
const inputPanel = document.getElementById("input-panel");
const userInput = document.getElementById("user-input");

const state = {
  starterSwapNames: [],
  selectedSwapNames: [],
  isLoading: false,
  canSubmit: false,
  // This is a one-shot app: once an answer is shown, the input is removed.
  hasAnswered: false,
};

function showInput() {
  inputPanel.classList.remove("hidden");
}

function hideInput() {
  inputPanel.classList.add("hidden");
}

function showOutput() {
  outputContainer.classList.remove("hidden");
  outputContainer.classList.add("visible");
}

function autoResizeTextarea(textarea) {
  // Reset first so the textarea can shrink as well as grow
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function setLoading(isLoading) {
  state.isLoading = isLoading;
  syncSubmitButtonState();
  submitButton.setAttribute("aria-busy", String(isLoading));
  submitLabel.textContent = isLoading
    ? "Loading..."
    : submitButton.dataset.readyLabel || "Swap it";

  // Hide the input while a request is in flight and show a loader in the
  // output area. This is a one-shot app, so once an answer has been shown we
  // keep the input hidden; only an error (which leaves hasAnswered false)
  // brings it back for a retry.
  if (isLoading) {
    hideInput();
    showOutputLoading();
  } else if (!state.hasAnswered) {
    showInput();
  }
}

function showOutputLoading(message = "Loading...") {
  showOutput();
  outputContent.replaceChildren(buildLoadingStatus(message));
}

// Canonical loading pill: a neutral swap-loader plus a status message.
// Branded templates (e.g. Discord) override the loader glyph; the structure
// stays the same so the styling and behavior are shared.
function buildLoadingStatus(message) {
  const status = document.createElement("p");
  status.className = "loading-status";

  const loader = document.createElement("span");
  loader.className = "swap-loader";
  loader.setAttribute("aria-hidden", "true");
  loader.append(buildSwapLoaderIcon());

  const statusText = document.createElement("span");
  statusText.textContent = message;

  status.append(loader, statusText);
  return status;
}

function buildSwapLoaderIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

  icon.setAttribute("class", "swap-loader-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("aria-hidden", "true");
  path.setAttribute("d", "M6 8h10.5l-3-3M18 16H7.5l3 3");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "2.1");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  icon.append(path);

  return icon;
}

export function renderStarterSwaps(swapNames, emptyMessage = "No popular software loaded yet.") {
  state.starterSwapNames = [...swapNames];
  state.selectedSwapNames = state.selectedSwapNames.filter((swapName) =>
    state.starterSwapNames.includes(swapName)
  );

  // Render once on load, then re-render after each click
  renderSwapSelection(emptyMessage);
  updateSubmitLabel();
}

export function handleInputChange() {
  autoResizeTextarea(userInput);
  syncSubmitAvailability();
}

export function getUserInputText() {
  return userInput.value.trim();
}

export function getSelectedSwapNames() {
  return [...state.selectedSwapNames];
}

export async function loadPopularSoftware() {
  try {
    const response = await fetch("/api/popular-software");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load popular software.");
    }

    renderStarterSwaps(data.popularSoftware);
    syncSubmitAvailability();
  } catch (error) {
    console.error(error);
    renderStarterSwaps([], "Could not load popular software.");
  }
}

export function syncSubmitAvailability() {
  setSubmitReady(Boolean(getUserInputText()) || state.selectedSwapNames.length > 0);
}

function setSubmitReady(canSubmit) {
  state.canSubmit = canSubmit;
  syncSubmitButtonState();
}

function renderSwapSelection(emptyMessage) {
  // Re-render after every click so the selected styles stay in sync with state
  renderSwapChips(state.starterSwapNames, state.selectedSwapNames, (swapName) => {
    toggleSelectedSwap(swapName);
    renderSwapSelection(emptyMessage);
    updateSubmitLabel();
    syncSubmitAvailability();
  }, emptyMessage);
}

function toggleSelectedSwap(swapName) {
  // Clicking a chip acts like a toggle: add it if missing, remove it if selected
  if (state.selectedSwapNames.includes(swapName)) {
    state.selectedSwapNames = state.selectedSwapNames.filter(
      (selectedSwapName) => selectedSwapName !== swapName
    );
    return;
  }

  state.selectedSwapNames = [...state.selectedSwapNames, swapName];
}

function renderSwapChips(swapNames, selectedSwapNames, onToggle, emptyMessage) {
  starterSwapsContainer.replaceChildren();

  if (!swapNames.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = emptyMessage;
    starterSwapsContainer.append(emptyState);
    return;
  }

  swapNames.forEach((swapName) => {
    const button = buildSwapChip(swapName, selectedSwapNames);
    button.addEventListener("click", () => onToggle(button.dataset.swapName));
    starterSwapsContainer.append(button);
  });
}

function buildSwapChip(swapName, selectedSwapNames) {
  // Each chip is a button with a selected style when its name is in state
  const isSelected = selectedSwapNames.includes(swapName);
  const button = document.createElement("button");
  const titleRow = document.createElement("div");
  const presentation = SWAP_PRESENTATION[swapName] ?? {};
  const icon = buildSwapIcon(presentation.icon);
  const title = document.createElement("p");

  button.type = "button";
  button.className = `swap-card${isSelected ? " is-selected" : ""}`;
  button.dataset.swapName = swapName;
  button.setAttribute("aria-label", swapName);
  button.setAttribute("aria-pressed", String(isSelected));

  titleRow.className = "swap-title-row";
  title.className = "swap-title";
  title.textContent = presentation.label ?? swapName;

  if (icon) {
    titleRow.append(icon);
  }
  titleRow.append(title);
  button.append(titleRow);

  return button;
}

function updateSubmitLabel() {
  // Match the button label to the current chip selection
  const label = state.selectedSwapNames.length > 1 ? "Swap 'em" : "Swap it";
  submitButton.dataset.readyLabel = label;
  submitLabel.textContent = label;
}

export function renderMarkdownSafely(markdown) {
  // Assistant responses are Markdown, so render then sanitize before inserting HTML.
  const html = marked.parse(markdown);
  outputContent.innerHTML = DOMPurify.sanitize(html);
  // One-shot: the answer is final, so retire the input for good.
  state.hasAnswered = true;
  hideInput();
}

export function renderOutputError(message) {
  // Render errors separately so failures stay simple
  showOutput();
  outputContent.textContent = message;
}

function syncSubmitButtonState() {
  submitButton.disabled = state.isLoading || !state.canSubmit;
}

function buildSwapIcon(iconDefinition) {
  if (!iconDefinition) {
    return null;
  }

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

  icon.setAttribute("class", "swap-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  path.setAttribute("d", iconDefinition.path);
  icon.append(path);

  return icon;
}
