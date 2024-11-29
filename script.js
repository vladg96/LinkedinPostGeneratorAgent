document.getElementById('generateButton').addEventListener('click', async () => {
  const url = document.getElementById('urlInput').value;
  const prompt = document.getElementById('promptInput').value;
  const spinner = document.getElementById('spinner');
  const postContent = document.getElementById('postContent');
  const generatedImage = document.getElementById('generatedImage'); // Ensure the image element exists

  console.log('Step 0');

  // Reset UI
  postContent.style.display = 'none';
  spinner.style.display = 'block';
  
  if (generatedImage) {
    generatedImage.style.display = 'none'; // Hide image initially
  }

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
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJoazlvRnJwWm9pdDlacURDTiIsImlhdCI6MTczMjcxMTk5N30.SPqitsu3M6CssoaEBh4B3TbtcfIlen_O6wrSqA3IdSk", // Replace with your valid token
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "inputs": {
          "URL": url,
          "userPrompt": prompt
        }
      })
    });

    if (!postResponse.ok) {
      const errorBody = await postResponse.text();  // Get the error message body
      console.error('Error response:', errorBody);  // Log it to the console
      throw new Error('Failed to execute agent.');
    }

    const postResult = await postResponse.json();
    const executionId = postResult.executionId;

    if (!executionId) throw new Error('No execution ID returned.');

    console.log(executionId);

    // Step 2: Poll for the agent result
    let status = 'running';
    let retries = 0;
    const maxRetries = 15;
    const delay = 5000; // 5 seconds

    while (status === 'running' && retries < maxRetries) {
      const getResponse = await fetch(`https://cloud.integrail.ai/api/hk9oFrpZoit9ZqDCN/agent/${executionId}/status`, {
        method: "GET",
        headers: {
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJoazlvRnJwWm9pdDlacURDTiIsImlhdCI6MTczMjcxMTk5N30.SPqitsu3M6CssoaEBh4B3TbtcfIlen_O6wrSqA3IdSk" // Replace with your valid token
        }
      });

      console.log('Step 2 finished');

      if (!getResponse.ok) throw new Error('Failed to fetch agent status.');

      const getResult = await getResponse.json();
      status = getResult.execution?.status;

      if (status === 'finished') {
        const result = getResult.execution?.outputs?.['2-output'] || "No relevant information found.";
        console.log(result);
        postContent.textContent = result;
        console.log(postContent.textContent);


        const imageURL = getResult.execution?.outputs?.['7-output']?.url; // Assuming image URL is here
        console.log(imageURL);
        if (imageURL && generatedImage) {
          generatedImage.src = imageURL;
          console.log(generatedImage.src);
          generatedImage.style.display = 'block'; // Display the image
        }

        postContent.style.display = 'block';
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
