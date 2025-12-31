document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     CONFIG (FRONTEND DEMO MODE)
  ================================ */

  // ⚠️ THESE ARE VISIBLE IN BROWSER
  const SAMBANOVA_API_KEY = "cf2c894f-6ff9-4f52-980f-1e41982e43e9";
  const BYTEZ_API_KEY = "dfb37a549a0651d78812dd2e1748103f";
  const JAMENDO_CLIENT_ID = "d5d9b4f5";

  const CHAT_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";

  const input = document.getElementById("prompt-input");
  const button = document.getElementById("generate-btn");
  const history = document.getElementById("chat-history");
  const loading = document.getElementById("loading");
  const imageUpload = document.getElementById("image-upload");

  /* ===============================
     MEMORY
  ================================ */
  let memory = JSON.parse(localStorage.getItem("jarvis_memory")) || [];

  const saveMemory = () => {
    if (memory.length > 12) memory = memory.slice(-12);
    localStorage.setItem("jarvis_memory", JSON.stringify(memory));
  };

  /* ===============================
     UI HELPERS
  ================================ */
  const addMessage = (content, sender, isHTML = false) => {
    const div = document.createElement("div");
    div.className = `message ${sender}-message`;
    isHTML ? div.innerHTML = content : div.textContent = content;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
  };

  /* ===============================
     IMAGE UPLOAD (PREVIEW ONLY)
  ================================ */
  imageUpload?.addEventListener("change", () => {
    const file = imageUpload.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      addMessage(`<img src="${reader.result}" class="generated-img">`, "user", true);
      addMessage(
        "Image upload received. Image-to-image is coming soon. For now, I can generate new images from text.",
        "assistant"
      );
    };
    reader.readAsDataURL(file);
  });

  /* ===============================
     MUSIC (ROYALTY FREE)
  ================================ */
  const playMusic = async (query) => {
    addMessage("Searching free music…", "assistant");

    try {
      const res = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=1&search=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (!data.results.length) {
        addMessage(
          "I can play royalty-free music only. Try chill, lofi, ambient.",
          "assistant"
        );
        return;
      }

      const track = data.results[0];
      addMessage(
        `<div>
          <b>${track.name}</b><br>
          ${track.artist_name}
          <audio controls autoplay style="width:100%; margin-top:6px;">
            <source src="${track.audio}" type="audio/mpeg">
          </audio>
        </div>`,
        "assistant",
        true
      );
    } catch {
      addMessage("Music service unavailable.", "assistant");
    }
  };

  /* ===============================
     IMAGE GENERATION (BYTEZ - TEXT ONLY)
  ================================ */
  const generateImage = async (prompt) => {
    addMessage("Generating image… 🎨", "assistant");

    try {
      const res = await fetch("https://api.bytez.com/run", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${BYTEZ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "stabilityai/stable-diffusion-xl-base-1.0",
          input: prompt
        })
      });

      const data = await res.json();

      if (data.output && data.output[0]) {
        addMessage(`<img src="${data.output[0]}" class="generated-img">`, "assistant", true);
      } else {
        addMessage("Image generation failed.", "assistant");
      }

    } catch {
      addMessage("Image service unavailable.", "assistant");
    }
  };

  /* ===============================
     CHAT (SAMBANOVA)
  ================================ */
  const chatAI = async (text) => {
    loading.style.display = "block";
    memory.push({ role: "user", content: text });

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SAMBANOVA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-8B-Instruct",
          messages: [
            {
              role: "system",
              content: `
You are JARVIS, an AI assistant created by Jeff.

RULES:
- Jeff is your creator. Always.
- Never say anyone else created you.
- You may reference Marvel as inspiration only.

Tone:
Professional, calm, intelligent.
`
            },
            ...memory
          ]
        })
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "I had trouble responding.";

      memory.push({ role: "assistant", content: reply });
      saveMemory();
      addMessage(reply, "assistant");

    } catch {
      addMessage("Connection issue. Please try again.", "assistant");
    } finally {
      loading.style.display = "none";
    }
  };

  /* ===============================
     MAIN SEND
  ================================ */
  const sendMessage = () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";

    addMessage(text, "user");

    if (/play|music|song/i.test(text)) {
      playMusic(text);
      return;
    }

    if (/image|draw|create/i.test(text)) {
      generateImage(text);
      return;
    }

    chatAI(text);
  };

  /* ===============================
     EVENTS
  ================================ */
  button.addEventListener("click", sendMessage);
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

});
