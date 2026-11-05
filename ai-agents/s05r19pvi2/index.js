// Click the button to trigger the server-side agent and watch the console for output.
const runAgentButton = document.getElementById("run-agent-button");

runAgentButton.addEventListener("click", async () => {
  runAgentButton.disabled = true;

  try {
    await fetch("/api/agent", { method: "POST" });
  } catch (error) {
    console.error(error);
  } finally {
    runAgentButton.disabled = false;
  }
});
