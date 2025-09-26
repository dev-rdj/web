document.addEventListener("DOMContentLoaded", () => {
  console.log("Jeff Creations - SambaNova AI Test 🚀");

  const generateBtn = document.getElementById("generate-btn");
  const promptInput = document.getElementById("prompt");
  const resultBox = document.getElementById("result");
  const loading = document.getElementById("loading");

  generateBtn.addEventListener("click", async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert("Please enter a prompt!");
      return;
    }

    loading.style.display = "block";
    resultBox.style.display = "none";

    try {
      const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer a7f22572-4f0f-4bc5-b137-782a90e50c5e",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-8B-Instruct", // or your vision model if available
          messages: [
            { role: "system", content: "You are an assistant that responds creatively to prompts." },
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await response.json();
      console.log(data);

      if (data.choices && data.choices[0]?.message?.content) {
        resultBox.textContent = data.choices[0].message.content;
        resultBox.style.display = "block";
      } else {
        resultBox.textContent = "No response received.";
        resultBox.style.display = "block";
      }
    } catch (err) {
      resultBox.textContent = "Error: " + err.message;
      resultBox.style.display = "block";
    } finally {
      loading.style.display = "none";
    }
  });
});
