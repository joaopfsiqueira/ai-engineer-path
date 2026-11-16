const runAgentButton = document.getElementById("run-agent-button");

runAgentButton.addEventListener("click", async () => {
  runAgentButton.disabled = true;

  try {
    const response = await fetch("/api/agent", { method: "POST" });
    const result = await response.json();
    console.log(result.agentResponse);
  } catch (error) {
    console.error(error);
  } finally {
    runAgentButton.disabled = false;
  }
});
