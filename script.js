document.addEventListener("DOMContentLoaded", () => {

  const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";
  const CHAT_API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";

  const input = document.getElementById("prompt-input");
  const button = document.getElementById("generate-btn");
  const history = document.getElementById("chat-history");
  const loading = document.getElementById("loading");
  const imageUpload = document.getElementById("image-upload");

  let uploadedImageData = null;
  let memory = JSON.parse(localStorage.getItem("jarvis_memory")) || [];

  const saveMemory = () => {
    if (memory.length > 10) memory = memory.slice(-10);
    localStorage.setItem("jarvis_memory", JSON.stringify(memory));
  };

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
      uploadedImageData = reader.result;
      addMessage(`<img src="${uploadedImageData}" class="generated-img">`, "user", true);
      addMessage("Image received. Describe how you want to transform it.", "assistant");
    };
    reader.readAsDataURL(file);
  });

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";

    addMessage(text, "user");
    loading.style.display = "block";

    // IMAGE → IMAGE (SMART FAKE)
    if (uploadedImageData) {
      const prompt = `Recreate the following image with these changes: ${text}. The image style should match the uploaded photo.`;
      const imgURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.random()}`;

      addMessage(`<img src="${imgURL}" class="generated-img">`, "assistant", true);
      uploadedImageData = null;
      loading.style.display = "none";
      return;
    }

    // NORMAL CHAT
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
                "You are JARVIS. You are professional, calm, and intelligent. You respond clearly and confidently. You were created by Jeff."
            },
            ...memory
          ]
        })
      });

      const data = await res.json();
      const reply = data.choices[0].message.content;

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
  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

});
