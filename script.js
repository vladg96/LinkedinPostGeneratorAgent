document.getElementById('generateButton').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value;
  const prompt = document.getElementById('promptInput').value;
  const outputDiv = document.getElementById('output');
  const spinner = document.getElementById('spinner');

  // Reset UI
  outputDiv.style.display = 'none';
  spinner.style.display = 'block';

  if (!url || !prompt) {
    alert('Please fill in both fields.');
    spinner.style.display = 'none';
    return;
  }

  try {
    // Step 1: POST Request to start the agent
    const postResponse = await fetch("https://cloud.integrail.ai/api/hk9oFrpZoit9ZqDCN/agent/GntyNCQaNdzdchpEG/execute", {
      method: "POST",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJoazlvRnJwWm9pdDlacURDTiIsImlhdCI6MTczMjcxMTk5N30.SPqitsu3M6CssoaEBh4B3TbtcfIlen_O6wrSqA3IdSk",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "inputs": {
          "URL": url,
          "userPrompt": prompt
        }
      })
    });

    if (!postResponse.ok) throw new Error('Failed to execute agent.');

    const postResult = await postResponse.json();
    const executionId = postResult.executionId;

    if (!executionId) throw new Error('No execution ID returned.');

    // Step 2: Poll for the agent result
    let status = 'running';
    let retries = 0;
    const maxRetries = 15;
    const delay = 5000; // 5 seconds

    while (status === 'running' && retries < maxRetries) {
      const getResponse = await fetch(`https://cloud.integrail.ai/api/hk9oFrpZoit9ZqDCN/agent/${executionId}/status`, {
        method: "GET",
        headers: {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJoazlvRnJwWm9pdDlacURDTiIsImlhdCI6MTczMjcxMTk5N30.SPqitsu3M6CssoaEBh4B3TbtcfIlen_O6wrSqA3IdSk"
        }
      });

      if (!getResponse.ok) throw new Error('Failed to fetch agent status.');

      const getResult = await getResponse.json();
      status = getResult.execution?.status;

      if (status === 'finished') {
        const result = getResult.execution?.outputs?.['2-output'] || "No relevant information found.";
        outputDiv.textContent = result;
        outputDiv.className = 'success';
        outputDiv.style.display = 'block';
        spinner.style.display = 'none';
        return;
      }

      retries++;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    outputDiv.textContent = 'Execution took too long. Please try again later.';
    outputDiv.className = 'error';
    outputDiv.style.display = 'block';
    spinner.style.display = 'none';
  } catch (error) {
    console.error(error);
    outputDiv.textContent = 'An error occurred. Please try again.';
    outputDiv.className = 'error';
    outputDiv.style.display = 'block';
    spinner.style.display = 'none';
  }
});
