document.addEventListener("DOMContentLoaded", () => {
  console.log("Jeff Creations - AI Chat Assistant 🚀");

  const generateBtn = document.getElementById("generate-btn");
  const promptInput = document.getElementById("prompt-input");
  const resultText = document.getElementById("result-text"); 
  const loading = document.getElementById("loading");

  // NOTE: Replace YOUR_API_KEY_GOES_HERE with your actual key.
  const API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions"; 
  const API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e"; 

  generateBtn.addEventListener("click", async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert("Please enter a prompt!");
      return;
    }

    // 1. Initial State: Show standard loading message
    loading.textContent = "Assistant is thinking... ⏳";
    loading.style.display = "block";
    resultText.textContent = ""; 
    resultText.style.display = "none";
    
    // Set a timeout to briefly display the custom message while the API is working
    // This runs in parallel with the fetch request.
    const customMessageTimeout = setTimeout(() => {
        // 2. Transition State: Display custom message
        loading.textContent = "Assistant made with love by Jeff ❤️"; 
    }, 1500); // Display the custom message after 1.5 seconds

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-8B-Instruct", 
          messages: [
            { role: "system", content: "You are a concise, professional, and technical AI assistant. Answer questions directly, provide clear explanations, and offer code when requested. Avoid flowery or overly creative language." },
            { role: "user", content: prompt }
          ],
          max_tokens: 250
        })
      });

      // Clear the timeout to prevent the custom message from interfering if the API is very slow
      clearTimeout(customMessageTimeout);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.detail || errorData.error || 'Server responded with an error.'}`);
      }
      
      const data = await response.json();

      if (data.choices && data.choices[0]?.message?.content) {
        resultText.textContent = data.choices[0].message.content;
      } else {
        resultText.textContent = "No response received. Please check your API key and endpoint.";
      }
      resultText.style.display = "block";

    } catch (err) {
      // Clear the timeout on error as well
      clearTimeout(customMessageTimeout);
      resultText.textContent = "Connection Error: " + err.message;
      resultText.style.display = "block";
    } finally {
      // 3. Final State: Hide loading indicator
      loading.style.display = "none";
    }
  });
});
