document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     SPLASH SCREEN
  ================================ */
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash) splash.remove();
  }, 2600);

  /* ===============================
     CONFIG
  ================================ */
  const JAMENDO_CLIENT_ID = "d5d9b4f5";

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
     IMAGE UPLOAD (IMAGE → IMAGE)
  ================================ */
  let uploadedImage = null;

  imageUpload?.addEventListener("change", () => {
    const file = imageUpload.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      uploadedImage = reader.result;
      addMessage(`<img src="${uploadedImage}" class="generated-img">`, "user", true);
      addMessage("Image received. Describe how you want to transform it.", "assistant");
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
          "I can play royalty-free music only. Try keywords like chill, lofi, ambient.",
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
     IMAGE GENERATION (BYTEZ)
  ================================ */
  const generateImage = async (prompt) => {
    addMessage("Generating image… 🎨", "assistant");

    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (data.image) {
        addMessage(`<img src="${data.image}" class="generated-img">`, "assistant", true);
      } else {
        addMessage("Image generation failed.", "assistant");
      }
    } catch {
      addMessage("Image service unavailable.", "assistant");
    }
  };

  /* ===============================
     MAIN SEND FUNCTION
  ================================ */
  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";

    addMessage(text, "user");

    /* MUSIC */
    if (/play|music|song/i.test(text)) {
      playMusic(text);
      return;
    }

    /* IMAGE GENERATION */
    if (/image|draw|create/i.test(text) && !uploadedImage) {
      generateImage(text);
      return;
    }

    /* IMAGE → IMAGE (SIMPLIFIED) */
    if (uploadedImage) {
      const prompt = `Transform this image: ${text}`;
      uploadedImage = null;
      generateImage(prompt);
      return;
    }

    /* CHAT AI (SAMBANOVA) */
    loading.style.display = "block";
    memory.push({ role: "user", content: text });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      const reply = data.reply || "I had trouble responding.";

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
     EVENTS
  ================================ */
  button.addEventListener("click", sendMessage);
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

});
