document.addEventListener("DOMContentLoaded", () => {

  const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";
  const CHAT_API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";
  const JAMENDO_CLIENT_ID = "d5d9b4f5";

  const input = document.getElementById("prompt-input");
  const button = document.getElementById("generate-btn");
  const history = document.getElementById("chat-history");
  const loading = document.getElementById("loading");

  let memory = JSON.parse(localStorage.getItem("jarvis_memory")) || [];

  const saveMemory = () => {
    if (memory.length > 12) memory = memory.slice(-12);
    localStorage.setItem("jarvis_memory", JSON.stringify(memory));
  };

  const addMessage = (content, sender, isHTML = false) => {
    const div = document.createElement("div");
    div.className = `message ${sender}-message`;
    isHTML ? div.innerHTML = content : div.textContent = content;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
  };

  const playMusic = async (query) => {
    addMessage("Searching free music…", "assistant");
    try {
      const res = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=1&search=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (!data.results.length) {
        addMessage(
          "I can’t play copyrighted songs like Eminem, but I can play free music with a similar vibe. Try: chill rap, dark hip hop, lofi.",
          "assistant"
        );
        return;
      }

      const track = data.results[0];
      addMessage(
        `<div>
          <b>${track.name}</b><br>${track.artist_name}
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

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";

    addMessage(text, "user");

    // MUSIC
    if (/play|music|song/i.test(text)) {
      playMusic(text);
      return;
    }

    // IMAGE
    if (/image|draw|create/i.test(text)) {
      addMessage("Generating image…", "assistant");
      const img = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&nologo=true`;
      addMessage(`<img src="${img}" class="generated-img">`, "assistant", true);
      return;
    }

    // AI CHAT
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
            {
              role: "system",
              content:
                "You are JARVIS. You are calm, professional, concise, and intelligent. You were created by Jeff."
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

  button.addEventListener("click", sendMessage);
  input.addEventListener("keypress", e => e.key === "Enter" && sendMessage());
});
