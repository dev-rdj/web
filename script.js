document.addEventListener("DOMContentLoaded", () => {

  const JAMENDO_CLIENT_ID = "d5d9b4f5";
  const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";
  const CHAT_API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";

  const promptInput = document.getElementById("prompt-input");
  const generateBtn = document.getElementById("generate-btn");
  const chatHistory = document.getElementById("chat-history");
  const loading = document.getElementById("loading");

  /* ===============================
     MEMORY SYSTEM (SESSION BASED)
  ================================ */
  let memory = JSON.parse(localStorage.getItem("jarvis_memory")) || [];

  const saveMemory = () => {
    if (memory.length > 10) memory = memory.slice(-10);
    localStorage.setItem("jarvis_memory", JSON.stringify(memory));
  };

  /* ===============================
     MESSAGE HANDLER
  ================================ */
  const appendMessage = (content, sender, isHTML = false, speak = false) => {
    const div = document.createElement("div");
    div.classList.add("message", `${sender}-message`);
    if (isHTML) div.innerHTML = content;
    else div.textContent = content;
    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    if (speak && sender === "assistant") speakText(div.innerText);
  };

  /* ===============================
     VOICE OUTPUT (WOW FACTOR)
  ================================ */
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  /* ===============================
     COMMAND ROUTER
  ================================ */
  const commands = [
    {
      match: /(who made you|creator|who is jeff)/i,
      handler: (input) => {
        appendMessage(input, "user");
        appendMessage(
          "I am 𝐽𝛥𝑅𝛻𝛪𝑆. I was designed and built by Jeff — this space reflects his vision and creativity.",
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
        appendMessage("Visual protocols engaged… 🎨", "assistant");
        const imgURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(input)}?width=1024&height=1024&nologo=true&seed=${Math.random()}`;
        appendMessage(
          `<img src="${imgURL}" class="generated-img">`,
          "assistant",
          true
        );
      }
    },
    {
      match: /(play|music|song)/i,
      handler: async (input) => {
        appendMessage(input, "user");
        appendMessage("Searching audio database… 🎵", "assistant");
        try {
          const res = await fetch(
            `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=1&search=${encodeURIComponent(input)}`
          );
          const data = await res.json();
          if (data.results.length) {
            const track = data.results[0];
            appendMessage(
              `
              <div class="music-bubble">
                <div class="content">
                  <b>${track.name}</b><br>
                  ${track.artist_name}
                  <audio controls autoplay src="${track.audio}"></audio>
                </div>
              </div>
              `,
              "assistant",
              true
            );
          } else {
            appendMessage("No matching track found.", "assistant");
          }
        } catch {
          appendMessage("Music service unavailable.", "assistant");
        }
      }
    }
  ];

  /* ===============================
     MAIN ACTION
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
            { role: "system", content: "You are 𝐽𝛥𝑅𝛻𝛪𝑆, an intelligent assistant created by Jeff. You are calm, intelligent, and supportive." },
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
      appendMessage("Connection error. Please try again.", "assistant");
    } finally {
      loading.style.display = "none";
    }
  };

  generateBtn.addEventListener("click", handleAction);
  promptInput.addEventListener("keypress", e => e.key === "Enter" && handleAction());

});
