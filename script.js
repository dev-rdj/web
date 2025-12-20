const CHAT_API = "https://api.sambanova.ai/v1/chat/completions";
const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

const imagePrompt = document.getElementById("image-prompt");
const generateImageBtn = document.getElementById("generate-image");
const imageResult = document.getElementById("image-result");

const downloadAudioBtn = document.getElementById("download-audio");
const audioPlayer = document.getElementById("audio-player");

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = role;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* REAL AI CHAT */
sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage("user", message);
  userInput.value = "";

  addMessage("bot", "Thinking…");

  try {
    const res = await fetch(CHAT_API, {
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

    const data = await res.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "I’m here. Try asking again.";

    chatBox.lastChild.textContent = reply;

  } catch (err) {
    chatBox.lastChild.textContent = "Connection error.";
  }
});

userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendBtn.click();
});

/* IMAGE (BROWSER SAFE) */
generateImageBtn.addEventListener("click", () => {
  const prompt = imagePrompt.value.trim();
  if (!prompt) return;

  const img = document.createElement("img");
  img.src = `https://source.unsplash.com/512x512/?${encodeURIComponent(prompt)}`;

  imageResult.innerHTML = "";
  imageResult.appendChild(img);
});

/* AUDIO */
downloadAudioBtn.addEventListener("click", () => {
  const url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  const a = document.createElement("a");
  a.href = url;
  a.download = "jeff-space-audio.mp3";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  audioPlayer.src = url;
  audioPlayer.play();
});
