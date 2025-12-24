document.addEventListener("DOMContentLoaded", () => {

  const JAMENDO_CLIENT_ID = "d5d9b4f5";
  const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";
  const CHAT_API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";

  const promptInput = document.getElementById("prompt-input");
  const generateBtn = document.getElementById("generate-btn");
  const chatHistory = document.getElementById("chat-history");
  const loading = document.getElementById("loading");

  /* ===============================
     🧠 SMART MEMORY (STABLE)
  ================================ */
  let memory = JSON.parse(localStorage.getItem("jarvis_memory")) || [];

  const saveMemory = () => {
    if (memory.length > 16) memory = memory.slice(-16);
    localStorage.setItem("jarvis_memory", JSON.stringify(memory));
  };

  /* ===============================
     MESSAGE UI
  ================================ */
  const appendMessage = (content, sender, isHTML = false) => {
    const div = document.createElement("div");
    div.classList.add("message", `${sender}-message`);
    isHTML ? div.innerHTML = content : div.textContent = content;
    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;
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
          "I am JARVIS. I was designed and built by Jeff. This environment reflects his vision — clean, focused, and intentional.",
          "assistant"
        );
      }
    },
    {
      match: /(create|image|draw)/i,
      handler: (input) => {
        appendMessage(input, "user");
        appendMessage("Generating visual output…", "assistant");
        const imgURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(input)}?width=1024&height=1024&nologo=true&seed=${Math.random()}`;
        appendMessage(`<img src="${imgURL}" class="generated-img">`, "assistant", true);
      }
    },
    {
      match: /(play|music|song)/i,
      handler: async (input) => {
        appendMessage(input, "user");
        appendMessage("Searching audio archives…", "assistant");
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
            appendMessage("No matching audio found.", "assistant");
          }
        } catch {
          appendMessage("Audio system unavailable.", "assistant");
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
                "You are JARVIS, a composed and intelligent assistant. You respond clearly, confidently, and concisely. You maintain a professional tone, think carefully, and never break character. You were created by Jeff."
            },
            ...memory
          ]
        })
      });

      const data = await response.json();
      const reply = data.choices[0].message.content;

      memory.push({ role: "assistant", content: reply });
      saveMemory();

      appendMessage(reply, "assistant");

    } catch {
      appendMessage("Temporary connection issue detected.", "assistant");
    } finally {
      loading.style.display = "none";
    }
  };

  generateBtn.addEventListener("click", handleAction);
  promptInput.addEventListener("keypress", e => e.key === "Enter" && handleAction());

});
