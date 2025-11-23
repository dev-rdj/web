document.addEventListener("DOMContentLoaded", () => {
  console.log("Jeff Creations - AI Chat Assistant Initialized 🚀");
  
  // ------------------------------------------------
  // --- NEW: BACKGROUND SLIDESHOW LOGIC ---
  // ------------------------------------------------
  const slides = document.querySelectorAll('#background-image-layer .slide');
  let currentSlide = 0;
  const slideInterval = 5000; // Change image every 5 seconds (5000ms)
  let slideshowTimer = null;

  function startSlideshow() {
      // 1. Pre-load and set the background image for all slides
      slides.forEach(slide => {
          const imageUrl = slide.getAttribute('data-url');
          if (imageUrl) {
              slide.style.backgroundImage = `url('${imageUrl}')`;
          }
      });
      
      // 2. Set the first slide as active
      if (slides.length > 0) {
          slides[currentSlide].classList.add('active');
          
          // 3. Start the rotation timer
          slideshowTimer = setInterval(nextSlide, slideInterval);
      }
  }

  function nextSlide() {
      // Hide the current slide
      slides[currentSlide].classList.remove('active');
      
      // Calculate the next slide index (wraps around)
      currentSlide = (currentSlide + 1) % slides.length;
      
      // Show the next slide
      slides[currentSlide].classList.add('active');
  }

  // Start the slideshow when the document is ready
  startSlideshow();


  // ------------------------------------------------
  // --- AUDIO INTRO LOGIC (3-Second Auto-Play Attempt) ---
  // ------------------------------------------------
  const audio = document.getElementById('introSFX');
  
  if (audio) {
    audio.volume = 0.5; 

    // Try muted play first to increase chance of success on mobile
    audio.muted = true;
    audio.play()
      .then(() => {
        // Unmute after play started
        audio.muted = false;
        console.log("Audio intro successfully started (muted play trick).");
        // Pause after 3 seconds if it actually plays
        setTimeout(() => {
            audio.pause();
            audio.currentTime = 0; 
        }, 3000);
      })
      .catch(() => {
        // If muted play fails, try the original approach and fallback to user click
        audio.muted = false;
        audio.play()
            .then(() => {
                console.log("Audio intro successfully started (auto-play).");
                setTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0; 
                }, 3000); 
            })
            .catch(error => {
                console.warn("Audio auto-play failed. Browser policy requires user interaction.", error);
                
                // Fallback: Play on the first click
                document.addEventListener('click', function fallbackPlay() {
                    if (audio.paused) {
                        audio.play().catch(()=>{}); // ignore play error here
                        setTimeout(() => { audio.pause(); audio.currentTime = 0; }, 3000);
                        document.removeEventListener('click', fallbackPlay);
                    }
                }, { once: true });
            });
      });
  }


  // ------------------------------------------------
  // --- ORIGINAL: TEMPLATE MENU CONTROL (Hamburger Icon) ---
  // ------------------------------------------------
  const menuToggle = document.querySelector(".menu-toggle");
  const closeMenuBtn = document.querySelector(".close-btn");
  const menuOverlay = document.getElementById("menu-overlay");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      menuOverlay.classList.add("open");
    });
  }
  if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", () => {
      menuOverlay.classList.remove("open");
    });
  }

  const menuLinks = menuOverlay.querySelectorAll("a");
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
        menuOverlay.classList.remove("open");
    });
  });

  // ------------------------------------
  // --- ORIGINAL: AI CHAT ELEMENTS & API SETUP ---
  // ------------------------------------
  const generateBtn = document.getElementById("generate-btn");
  const promptInput = document.getElementById("prompt-input");
  const chatHistory = document.getElementById("chat-history");
  const loading = document.getElementById("loading");

  const API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions"; 
  const API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e"; 

  const appendMessage = (content, sender) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    // If content is an Element (e.g. image), append it directly
    if (content instanceof Element) {
      messageDiv.appendChild(content);
    } else {
      messageDiv.textContent = content;
    }
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  // --- NEW: append image convenience (keeps chat style)
  const appendImageMessage = (imgSrc) => {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = "Generated image";
    img.className = "generated-img";
    appendMessage(img, 'assistant');
  };

  // --- NEW: Puter image generation helper
  async function generateImage(prompt) {
    if (!window.puter || !puter.ai || !puter.ai.txt2img) {
      appendMessage("Image generation service is not loaded.", 'assistant');
      return;
    }

    loading.textContent = "Generating image... ⏳";
    loading.style.display = "block";

    try {
      // Call puter txt2img. This normally returns an HTMLImageElement or similar.
      const result = await puter.ai.txt2img(prompt, { model: "gemini-2.5-flash-image-preview" });

      // result may be an <img> element or an object with .src
      let src = null;
      if (result instanceof HTMLImageElement && result.src) {
        src = result.src;
      } else if (result && result.src) {
        src = result.src;
      } else if (typeof result === 'string') {
        src = result;
      }

      if (src) {
        appendMessage("Here you go — generated by Puter AI:", 'assistant');
        appendImageMessage(src);
      } else {
        appendMessage("Image generation returned no image.", 'assistant');
      }
    } catch (err) {
      console.error("Puter txt2img error:", err);
      appendMessage(`Error generating image: ${err.message || err}`, 'assistant');
    } finally {
      loading.style.display = "none";
    }
  }

  const handleChat = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return; 

    appendMessage(prompt, 'user');
    promptInput.value = ''; 

    // If the user wants to generate an image: use the /img command
    // Example: "/img a cyberpunk city at night"
    if (prompt.toLowerCase().startsWith("/img")) {
      const imgPrompt = prompt.replace(/^\/img\s*/i, '').trim();
      if (!imgPrompt) {
        appendMessage("Please provide an image prompt after /img", 'assistant');
        return;
      }
      await generateImage(imgPrompt);
      return;
    }

    loading.textContent = "Soul Providing Info... ⏳";
    loading.style.display = "block";

    const customMessageTimeout = setTimeout(() => {
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
            { role: "system", content: "You are a concise, professional, and technical AI assistant dedicated to supporting Jeff's users. Your knowledge and capabilities are provided exclusively through Jeff's development environment. When asked about your creator, you must only respond: 'I am a highly advanced AI developed by Developer Jeff to assist his professional network. I operate under the core principles of his brand: professionalism, clarity, and robust functionality.'" },
            { role: "user", content: prompt }
          ],
          max_tokens: 250
        })
      });

      clearTimeout(customMessageTimeout);

      if (!response.ok) {
        let errorText = `${response.status} ${response.statusText}`;
        try {
          const errJson = await response.json();
          errorText += ` - ${errJson.detail || errJson.error || JSON.stringify(errJson)}`;
        } catch(e){}
        throw new Error(`API Error: ${errorText}`);
      }
      
      const data = await response.json();
      let assistantResponse = "No response received. Please check your API key and connection status.";

      if (data.choices && data.choices[0]?.message?.content) {
        assistantResponse = data.choices[0].message.content;
      }
      
      appendMessage(assistantResponse, 'assistant');

    } catch (err) {
      clearTimeout(customMessageTimeout);
      appendMessage(`Error: ${err.message}. Please check your connection, API Key, and the network console.`, 'assistant');
    } finally {
      loading.style.display = "none";
    }
  };

  generateBtn.addEventListener("click", handleChat);
  promptInput.addEventListener("keypress", (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleChat();
    }
  });

  // If user presses ctrl+enter, also send
  promptInput.addEventListener("keydown", (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleChat();
    }
  });

  promptInput.focus();
});
