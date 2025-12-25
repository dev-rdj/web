document.addEventListener("DOMContentLoaded", () => {

  // SPLASH REMOVAL
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash) splash.remove();
  }, 2600);

  const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";
  const CHAT_API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";
  const JAMENDO_CLIENT_ID = "d5d9b4f5";

  const input = document.getElementById("prompt-input");
  const button = document.getElementById("generate-btn");
  const history = document.getElementById("chat-history");
  const loading = document.getElementById("loading");
  const imageUpload = document.getElementById("image-upload");

  let uploadedImage = null;
  let memory = [];

  const addMessage = (content, sender, isHTML = false) => {
    const div = document.createElement("div");
    div.className = `message ${sender}-message`;
    isHTML ? div.innerHTML = content : div.textContent = content;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
  };

  imageUpload.addEventListener("change", () => {
    const file = imageUpload.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      uploadedImage = reader.result;
      addMessage(`<img src="${uploadedImage}" class="generated-img">`, "user", true);
      addMessage("Image received. Describe how to transform it.", "assistant");
    };
    reader.readAsDataURL(file);
  });

  const playMusic = async (query) => {
    addMessage("Searching free music…", "assistant");
    try {
      const res = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=1&search=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (!data.results.length) {
        addMessage("I can only play free music. Try: chill, lofi, ambient.", "assistant");
        return;
      }
      const t = data.results[0];
      addMessage(
        `<b>${t.name}</b><br>${t.artist_name}
         <audio controls autoplay style="width:100%;margin-top:6px">
         <source src="${t.audio}" type="audio/mpeg"></audio>`,
        "assistant",
        true
      );
    } catch {
      addMessage("Music service unavailable.", "assistant");
    }
  };

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMessage(text, "user");

    if (/play|music|song/i.test(text)) {
      playMusic(text);
      return;
    }

    if (/image|draw|create/i.test(text)) {
      addMessage("Generating image…", "assistant");
      const img = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&nologo=true`;
      addMessage(`<img src="${img}" class="generated-img">`, "assistant", true);
      return;
    }

    loading.style.display = "block";
    memory.push({ role: "user", content: text });

    try {
      const res = await fetch(CHAT_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CHAT_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-8B-Instruct",
          messages: [
            { role: "system", content: "You are JARVIS. Calm, professional, intelligent. Created by Jeff." },
            ...memory
          ]
        })
      });
      const data = await res.json();
      const reply = data.choices[0].message.content;
      memory.push({ role: "assistant", content: reply });
      addMessage(reply, "assistant");
    } catch {
      addMessage("Connection issue.", "assistant");
    } finally {
      loading.style.display = "none";
    }
  };

  button.addEventListener("click", sendMessage);
  input.addEventListener("keypress", e => e.key === "Enter" && sendMessage());
});
