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

    loading.style.display = "block";
    resultText.textContent = ""; 
    resultText.style.display = "none";

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-8B-Instruct", 
          // 💡 NEW, Professional System Prompt: 
          messages: [
            { role: "system", content: "You are a concise, professional, and technical AI assistant. Answer questions directly, provide clear explanations, and offer code when requested. Avoid flowery or overly creative language." },
            { role: "user", content: prompt }
          ],
          max_tokens: 250 // Increased tokens for better responses
        })
      });

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
      resultText.textContent = "Connection Error: " + err.message;
      resultText.style.display = "block";
    } finally {
      loading.style.display = "none";
    }
  });
});
