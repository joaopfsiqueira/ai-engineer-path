const runChatCompletionsButton = document.getElementById("run-chat-completions-button");
const runResponsesButton = document.getElementById("run-responses-button");

runChatCompletionsButton.addEventListener("click", async () => {
  runChatCompletionsButton.disabled = true;

  try {
    await fetch("/api/chat-completions", { method: "POST" });
  } catch (error) {
    console.error(error);
  } finally {
    runChatCompletionsButton.disabled = false;
  }
});

runResponsesButton.addEventListener("click", async () => {
  runResponsesButton.disabled = true;

  try {
    await fetch("/api/responses", { method: "POST" });
  } catch (error) {
    console.error(error);
  } finally {
    runResponsesButton.disabled = false;
  }
});
