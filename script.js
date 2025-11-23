document.addEventListener("DOMContentLoaded", () => {
  console.log("Jeff Creations - AI Chat Assistant Initialized 🚀");

  /* ------------------------------------------------
     API KEYS & ENDPOINTS
     !! WARNING: These keys are visible in the browser source code !!
  ------------------------------------------------ */
  // SambaNova (Llama Chat) API
  const CHAT_API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";
  const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";

  // Bytez (Image Generation) API
  const BYTEZ_API_KEY = "dfb37a549a0651d78812dd2e1748103f"; 
  const BYTEZ_ENDPOINT = "https://api.bytez.ai/v1/model/succinctly/text2image-prompt-generator";

  /* ------------------------------------------------
     DOM ELEMENTS
  ------------------------------------------------ */
  const generateBtn = document.getElementById("generate-btn");
  const promptInput = document.getElementById("prompt-input");
  const chatHistory = document.getElementById("chat-history");
  const loading = document.getElementById("loading");

  let activeTab = 'chat'; // Default active tab
  
  /* ------------------------------------------------
     HELPER FUNCTIONS
  ------------------------------------------------ */
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
  const appendImageMessage = (src, alt="generated image") => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.className = "generated-img";
    appendMessageElement(img);
  };
  
  /* ------------------------------------------------
     TAB SWITCHING LOGIC
  ------------------------------------------------ */
  window.switchTab = function(tab) {
    activeTab = tab === 'image' ? 'image' : 'chat';

    document.querySelectorAll('.chat-tabs .tab').forEach(el => el.classList.remove('active'));
    document.getElementById(activeTab === 'image' ? "tab-image" : "tab-chat").classList.add('active');

    promptInput.placeholder = activeTab === 'image'
      ? "Describe the image you want..."
      : "Ask a technical question...";

    promptInput.focus();
  };
  
  /* ------------------------------------------------
     IMAGE GENERATION HANDLER (Bytez API)
  ------------------------------------------------ */
  async function generateImage(prompt) {
    loading.style.display = "block";
    loading.textContent = "Generating image using Bytez... ⏳";

    try {
      const res = await fetch(BYTEZ_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${BYTEZ_API_KEY}`
        },
        body: JSON.stringify({
          input: prompt, 
          parameters: { 
              image_width: 1024, 
              image_height: 1024 
          } 
        })
      });

      if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Bytez API Error:", errorData);
          throw new Error(`API failed with status ${res.status}: ${errorData.message || res.statusText}`);
      }

      const data = await res.json();
      const imgURL = data?.output?.image_url;

      if (!imgURL) {
        appendMessage("Image API returned an empty result or unexpected format.", "assistant");
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
     CHAT HANDLER (SambaNova API)
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
      const response = await fetch(CHAT_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CHAT_API_KEY}`,
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


  /* ------------------------------------------------
     EVENT LISTENERS
  ------------------------------------------------ */
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
  
  /* ------------------------------------------------
     BACKGROUND SLIDESHOW (Your Original Code)
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
     AUDIO INTRO (Your Original Code)
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
     MENU CONTROL (Your Original Code)
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
     FUN CLICK COUNTER (New Feature)
  ------------------------------------------------ */
  const clickDisplay = document.getElementById("click-display");
  const clickMeBtn = document.getElementById("click-me-btn");
  let totalClicks = 0;

  if (clickMeBtn && clickDisplay) {
    clickMeBtn.addEventListener("click", () => {
      totalClicks++;
      clickDisplay.textContent = totalClicks;
      
      // Optional: Give a visual pop on click!
      clickMeBtn.style.transform = 'scale(0.98)';
      setTimeout(() => {
        clickMeBtn.style.transform = 'scale(1)';
      }, 100);
    });
  }

});
