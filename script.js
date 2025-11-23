document.addEventListener("DOMContentLoaded", () => {
  console.log("Jeff Creations - AI Chat Assistant Initialized 🚀");

  /* ------------------------------------------------
     BACKGROUND SLIDESHOW (unchanged)
  ------------------------------------------------ */
  const slides = document.querySelectorAll('#background-image-layer .slide');
  let currentSlide = 0;
  const slideInterval = 5000;
  let slideshowTimer = null;

  function startSlideshow() {
      slides.forEach(slide => {
          const imageUrl = slide.getAttribute('data-url');
          if (imageUrl) slide.style.backgroundImage = `url('${imageUrl}')`;
      });
      if (slides.length > 0) {
          slides[currentSlide].classList.add('active');
          slideshowTimer = setInterval(nextSlide, slideInterval);
      }
  }
  function nextSlide() {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
  }
  startSlideshow();

  /* ------------------------------------------------
     AUDIO INTRO (unchanged)
  ------------------------------------------------ */
  const audio = document.getElementById('introSFX');
  if (audio) {
    audio.volume = 0.5;
    audio.muted = true;
    audio.play()
      .then(() => {
        audio.muted = false;
        setTimeout(() => { audio.pause(); audio.currentTime = 0; }, 3000);
      })
      .catch(() => {
        audio.muted = false;
        audio.play()
          .then(() => setTimeout(() => { audio.pause(); audio.currentTime = 0; }, 3000))
          .catch(() => {
            document.addEventListener("click", function playOnce() {
              audio.play().catch(()=>{});
              setTimeout(() => { audio.pause(); audio.currentTime = 0; }, 3000);
              document.removeEventListener("click", playOnce);
            }, { once: true });
          });
      });
  }

  /* ------------------------------------------------
     MENU CONTROL (unchanged)
  ------------------------------------------------ */
  const menuToggle = document.querySelector(".menu-toggle");
  const closeMenuBtn = document.querySelector(".close-btn");
  const menuOverlay = document.getElementById("menu-overlay");

  if (menuToggle) menuToggle.addEventListener("click", () => menuOverlay.classList.add("open"));
  if (closeMenuBtn) closeMenuBtn.addEventListener("click", () => menuOverlay.classList.remove("open"));
  menuOverlay.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => menuOverlay.classList.remove("open"));
  });

  /* ------------------------------------------------
     CHAT UI + ORIGINAL API (unchanged)
  ------------------------------------------------ */
  const generateBtn = document.getElementById("generate-btn");
  const promptInput = document.getElementById("prompt-input");
  const chatHistory = document.getElementById("chat-history");
  const loading = document.getElementById("loading");

  const API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";
  const API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";

  let activeTab = 'chat';

  window.switchTab = function(tab) {
    activeTab = tab === 'image' ? 'image' : 'chat';

    document.querySelectorAll('.chat-tabs .tab').forEach(el => el.classList.remove('active'));
    document.getElementById(activeTab === 'image' ? "tab-image" : "tab-chat").classList.add('active');

    promptInput.placeholder = activeTab === 'image'
      ? "Describe the image you want..."
      : "Ask a technical question...";

    promptInput.focus();
  };

  /* Message helpers */
  const appendMessage = (content, sender) => {
    const div = document.createElement("div");
    div.classList.add("message", `${sender}-message`);
    div.textContent = content;
    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };
  const appendMessageElement = (node, sender='assistant') => {
    const div = document.createElement("div");
    div.classList.add("message", `${sender}-message`);
    div.appendChild(node);
    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };
  const appendImageMessage = (src, alt="image") => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.className = "generated-img";
    appendMessageElement(img);
  };

  /* ------------------------------------------------
     FINAL FIXED IMAGE GENERATOR (NO POPUP)
     Works with FREE puter key
  ------------------------------------------------ */
  async function generateImage(prompt) {
    loading.style.display = "block";
    loading.textContent = "Generating image... ⏳";

    try {
      const res = await fetch("https://api.puter.com/rest/v1/ai/image/generate", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "free"
        },
        body: JSON.stringify({
          prompt,
          size: "1024x1024"
        })
      });

      if (!res.ok) throw new Error("Image generation failed");

      const data = await res.json();

      let imgURL = null;

      if (data.image_base64) {
        imgURL = "data:image/png;base64," + data.image_base64;
      } else if (data.uri) {
        imgURL = data.uri;
      } else if (data.result?.[0]?.uri) {
        imgURL = data.result[0].uri;
      }

      if (!imgURL) {
        appendMessage("Image API returned an empty result.", "assistant");
        return;
      }

      appendMessage("Here is your image:", "assistant");
      appendImageMessage(imgURL, prompt);

    } catch (err) {
      appendMessage("Error generating image: " + err.message, "assistant");
    } finally {
      loading.style.display = "none";
    }
  }

  /* ------------------------------------------------
     Chat handler (UNCHANGED except tab logic)
  ------------------------------------------------ */
  const handleChat = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    if (activeTab === "image") {
      appendMessage(prompt, "user");
      promptInput.value = "";
      await generateImage(prompt);
      return;
    }

    appendMessage(prompt, "user");
    promptInput.value = "";

    loading.textContent = "Soul Providing Info... ⏳";
    loading.style.display = "block";

    const customTimeout = setTimeout(() => {
      loading.textContent = "Soul made with love by Jeff ❤️";
    }, 1500);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Meta-Llama-3.1-8B-Instruct",
          messages: [
            { role: "system", content: "You are a concise, professional assistant created by Developer Jeff." },
            { role: "user", content: prompt }
          ],
          max_tokens: 250
        })
      });

      clearTimeout(customTimeout);

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || "No response";

      appendMessage(reply, "assistant");

    } catch (err) {
      appendMessage("Error: " + err.message, "assistant");
    } finally {
      loading.style.display = "none";
    }
  };

  /* Event listeners */
  generateBtn.addEventListener("click", handleChat);
  promptInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleChat();
    }
  });
  promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleChat();
    }
  });

  promptInput.focus();
});
