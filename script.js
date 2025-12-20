document.addEventListener("DOMContentLoaded", () => {
  console.log("Jeff Creations - AI Chat Assistant Initialized 🚀");

  /* ------------------------------------------------
     API KEYS & ENDPOINTS
     !! WARNING: These keys are visible in the browser source code !!
  ------------------------------------------------ */

  // SambaNova (Llama Chat) API
  const CHAT_API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";
  const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";

  // Bytez (Image Generation) API
  const BYTEZ_API_KEY = "dfb37a549a0651d78812dd2e1748103f";
  const BYTEZ_ENDPOINT =
    "https://api.bytez.ai/models/v2/dreamlike-art/dreamlike-photoreal-2.0";

  /* ------------------------------------------------
     DOM ELEMENTS
  ------------------------------------------------ */
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  const imagePrompt = document.getElementById("image-prompt");
  const generateImageBtn = document.getElementById("generate-image");
  const imageResult = document.getElementById("image-result");

  const downloadAudioBtn = document.getElementById("download-audio");
  const audioPlayer = document.getElementById("audio-player");

  /* ------------------------------------------------
     CHAT FUNCTIONS
  ------------------------------------------------ */

  function addMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = sender;
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage("user", message);
    userInput.value = "";

    try {
      const response = await fetch(CHAT_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CHAT_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Meta-Llama-3-8B-Instruct",
          messages: [{ role: "user", content: message }]
        })
      });

      const data = await response.json();
      const reply =
        data.choices?.[0]?.message?.content || "No response.";

      addMessage("bot", reply);
    } catch (error) {
      console.error(error);
      addMessage("bot", "Error connecting to chat service.");
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  /* ------------------------------------------------
     IMAGE GENERATION
  ------------------------------------------------ */

  generateImageBtn.addEventListener("click", async () => {
    const prompt = imagePrompt.value.trim();
    if (!prompt) return;

    imageResult.innerHTML = "Generating image...";

    try {
      const response = await fetch(BYTEZ_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${BYTEZ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          width: 512,
          height: 512
        })
      });

      const data = await response.json();

      if (data?.data?.[0]?.url) {
        const img = document.createElement("img");
        img.src = data.data[0].url;
        img.style.maxWidth = "100%";
        imageResult.innerHTML = "";
        imageResult.appendChild(img);
      } else {
        imageResult.textContent = "Failed to generate image.";
      }
    } catch (err) {
      console.error(err);
      imageResult.textContent = "Error generating image.";
    }
  });

  /* ------------------------------------------------
     AUDIO DOWNLOAD
  ------------------------------------------------ */

  downloadAudioBtn.addEventListener("click", () => {
    const audio = new Audio("Audio/sample.mp3");
    audioPlayer.src = audio.src;
    audio.play();
  });

});
