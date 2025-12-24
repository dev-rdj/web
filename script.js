document.addEventListener("DOMContentLoaded", () => {

  const JAMENDO_CLIENT_ID = "d5d9b4f5";
  const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";
  const CHAT_API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";

  const promptInput = document.getElementById("prompt-input");
  const generateBtn = document.getElementById("generate-btn");
  const chatHistory = document.getElementById("chat-history");
  const loading = document.getElementById("loading");

  /* ===============================
     🧠 SMART MEMORY (CONTEXT AWARE)
  ================================ */
  let memory = JSON.parse(localStorage.getItem("jarvis_memory")) || [];

  const saveMemory = () => {
    if (memory.length > 14) memory = memory.slice(-14);
    localStorage.setItem("jarvis_memory", JSON.stringify(memory));
  };

  /* ===============================
     MESSAGE UI
  ================================ */
  const appendMessage = (content, sender, isHTML = false, speak = false) => {
    const div = document.createElement("div");
    div.classList.add("message", `${sender}-message`);
    isHTML ? div.innerHTML = content : div.textContent = content;
    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    if (speak && sender === "assistant") speakAsJarvis(div.innerText);
  };

  /* ===============================
     🗣️ JARVIS VOICE (LOCKED)
  ================================ */
  let jarvisVoice = null;

  const loadJarvisVoice = () => {
    const voices = speechSynthesis.getVoices();
    jarvisVoice =
      voices.find(v => /daniel|alex|fred|mark|english|male/i.test(v.name)) ||
      voices.find(v => v.lang === "en-US") ||
      voices[0];
  };

  const speakAsJarvis = (text) => {
    if (!window.speechSynthesis) return;
    if (!jarvisVoice) loadJarvisVoice();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = jarvisVoice;
    utterance.rate = 0.92;
    utterance.pitch = 0.85;
    utterance.volume = 0.9;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  speechSynthesis.onvoiceschanged = loadJarvisVoice;

  /* ===============================
     🔧 COMMAND ROUTER
  ================================ */
  const commands = [
    {
      match: /(who made you|creator|who is jeff)/i,
      handler: (input) => {
        appendMessage(input, "user");
        appendMessage(
          "I am JARVIS. I was designed and brought to life by Jeff — a creator with vision. I exist to assist, analyze, and create.",
          "assistant",
          false,
          true
        );
      }
    },
    {
      match: /(create|image|draw)/i,
      handler: (input) => {
        appendMessage(input, "user");
        appendMessage("Visual generation engaged.", "assistant");
        const imgURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(input)}?width=1024&height=1024&nologo=true&seed=${Math.random()}`;
        appendMessage(`<img src="${imgURL}" class="generated-img">`, "assistant", true);
      }
    },
    {
      match: /(play|music|song)/i,
      handler: async (input) => {
        appendMessage(input, "user");
        appendMessage("Searching audio libraries.", "assistant");
        try {
          const res = await fetch(
            `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=1&search=${encodeURIComponent(input)}`
          );
          const data = await res.json();
          if (data.results.length) {
            const track = data.results[0];
            appendMessage(
              `<div class="music-bubble">
                <div class="content">
                  <b>${track.name}</b><br>${track.artist_name}
                  <audio controls autoplay src="${track.audio}"></audio>
                </div>
              </div>`,
              "assistant",
              true
            );
          } else {
            appendMessage("No suitable audio found.", "assistant", false, true);
          }
        } catch {
          appendMessage("Music systems are currently unavailable.", "assistant", false, true);
        }
      }
    }
  ];

  /* ===============================
     🚀 MAIN INTELLIGENCE LOOP
  ================================ */
  const handleAction = async () => {
    const input = promptInput.value.trim();
    if (!input) return;
    promptInput.value = "";

    for (const cmd of commands) {
      if (cmd.match.test(input)) {
        cmd.handler(input);
        return;
      }
    }

    appendMessage(input, "user");
    loading.style.display = "block";

    memory.push({ role: "user", content: input });

    try {
      const response = await fetch(CHAT_API_ENDPOINT, {
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
                "You are JARVIS, an advanced AI assistant. You think step-by-step internally, but speak clearly and confidently. You are calm, intelligent, concise, and supportive. You never mention being an AI model. You were created by Jeff and remain loyal to that identity."
            },
            ...memory
          ]
        })
      });

      const data = await response.json();
      const reply = data.choices[0].message.content;

      memory.push({ role: "assistant", content: reply });
      saveMemory();

      appendMessage(reply, "assistant", false, true);

    } catch {
      appendMessage("I am experiencing a temporary connection issue.", "assistant", false, true);
    } finally {
      loading.style.display = "none";
    }
  };

  generateBtn.addEventListener("click", handleAction);
  promptInput.addEventListener("keypress", e => e.key === "Enter" && handleAction());

});
