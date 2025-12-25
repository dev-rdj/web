document.addEventListener("DOMContentLoaded", () => {

  const JAMENDO_CLIENT_ID = "d5d9b4f5";

  const input = document.getElementById("prompt-input");
  const button = document.getElementById("generate-btn");
  const history = document.getElementById("chat-history");
  const loading = document.getElementById("loading");

  const addMessage = (text, sender, isHTML = false) => {
    const div = document.createElement("div");
    div.className = `message ${sender}-message`;
    isHTML ? div.innerHTML = text : div.textContent = text;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
  };

  const playMusic = async (query) => {
    addMessage(`Searching music…`, "assistant");
    try {
      const res = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=1&search=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (!data.results.length) {
        addMessage(
          "I can’t play copyrighted music like Eminem. However, I can play free tracks with a similar vibe. Try: “chill rap” or “dark hip hop”.",
          "assistant"
        );
        return;
      }

      const track = data.results[0];
      addMessage(
        `
        <div>
          <b>${track.name}</b><br>
          ${track.artist_name}
          <audio controls autoplay style="width:100%; margin-top:6px;">
            <source src="${track.audio}" type="audio/mpeg">
          </audio>
        </div>
        `,
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

    // MUSIC COMMAND
    if (/play|music|song/i.test(text)) {
      playMusic(text);
      return;
    }

    // IMAGE COMMAND
    if (/image|draw|create/i.test(text)) {
      addMessage("Generating image…", "assistant");
      const img = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&nologo=true`;
      addMessage(`<img src="${img}" class="generated-img">`, "assistant", true);
      return;
    }

    // NORMAL CHAT
    addMessage(
      "I’m here. You can ask me questions, generate images, or play free music.",
      "assistant"
    );
  };

  button.addEventListener("click", sendMessage);
  input.addEventListener("keypress", e => e.key === "Enter" && sendMessage());
});
