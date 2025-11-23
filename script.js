document.addEventListener("DOMContentLoaded", () => {
  console.log("Jeff Creations - AI Chat Assistant Initialized 🚀");
  
  // ------------------------------------------------
  // --- NEW: BACKGROUND SLIDESHOW LOGIC (unchanged)
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
  // --- MENU CONTROL (unchanged)
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
  // --- CHAT ELEMENTS & ORIGINAL API ---
  // ------------------------------------
  const generateBtn = document.getElementById("generate-btn");
  const promptInput = document.getElementById("prompt-input");
  const chatHistory = document.getElementById("chat-history");
  const loading = document.getElementById("loading");

  const API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions"; 
  const API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e"; 

  // Keep track of active tab: 'chat' or 'image'
  let activeTab = 'chat';

  // Tab switcher function (connected to UI buttons)
  window.switchTab = function(tab) {
    activeTab = tab === 'image' ? 'image' : 'chat';
    // update UI active class
    document.querySelectorAll('.chat-tabs .tab').forEach(el => el.classList.remove('active'));
    if (activeTab === 'image') {
      document.getElementById('tab-image').classList.add('active');
      document.getElementById('prompt-input').placeholder = "Describe the image you want...";
    } else {
      document.getElementById('tab-chat').classList.add('active');
      document.getElementById('prompt-input').placeholder = "Ask a technical question...";
    }
    promptInput.focus();
  };

  // append text message convenience (preserves your chat-bubble style)
  const appendMessage = (content, sender) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = content;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  // append Element message (for images)
  const appendMessageElement = (node, sender='assistant') => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.appendChild(node);
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  // append generated image nicely
  const appendImageMessage = (imgSrc, altText="Generated image") => {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = altText;
    img.className = 'generated-img';
    appendMessageElement(img, 'assistant');
  };

  // ------------------------------------------------
  // --- IMAGE GENERATION (No Puter SDK / No Popup)
  // ------------------------------------------------
  async function generateImage(prompt) {
    loading.textContent = "Generating image... ⏳";
    loading.style.display = "block";

    try {
      const res = await fetch("https://api.puter.com/rest/v1/ai/image/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "free" // public free key; no SDK, no popup
        },
        body: JSON.stringify({
          prompt: prompt,
          size: "1024x1024"
        })
      });

      if (!res.ok) {
        const text = await res.text().catch(()=>'');
        throw new Error(`Image API error ${res.status} ${res.statusText} ${text}`);
      }

      const data = await res.json();

      // handle common response shapes: base64 or URL
      if (data?.image_base64) {
        const src = `data:image/png;base64,${data.image_base64}`;
        appendMessage("Here is your image:", 'assistant');
        appendImageMessage(src, prompt);
      } else if (data?.result?.[0]?.uri) {
        appendMessage("Here is your image:", 'assistant');
        appendImageMessage(data.result[0].uri, prompt);
      } else if (data?.uri) {
        appendMessage("Here is your image:", 'assistant');
        appendImageMessage(data.uri, prompt);
      } else {
        // maybe the API returns an array of images
        const maybeUrl = (data && typeof data === 'string') ? data : null;
        if (maybeUrl) {
          appendMessage("Here is your image:", 'assistant');
          appendImageMessage(maybeUrl, prompt);
        } else {
          appendMessage("Image generation returned no recognizable image.", 'assistant');
          console.warn("Unexpected image API response:", data);
        }
      }
    } catch (err) {
      console.error("generateImage error:", err);
      appendMessage(`Error generating image: ${err.message}`, 'assistant');
    } finally {
      loading.style.display = "none";
    }
  }

  // ------------------------------------
  // --- ORIGINAL: handleChat (patched)
  // ------------------------------------
  const handleChat = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return; 

    // if Image tab active -> send prompt to image generator (no /img required)
    if (activeTab === 'image') {
      appendMessage(prompt, 'user');
      promptInput.value = '';
      await generateImage(prompt);
      return;
    }

    // Otherwise handle as your original text LLM
    appendMessage(prompt, 'user');
    promptInput.value = ''; 

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

  // ------------------------------------
  // --- Event listeners (unchanged)
  // ------------------------------------
  generateBtn.addEventListener("click", handleChat);
  promptInput.addEventListener("keypress", (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleChat();
    }
  });

  // Ctrl+Enter to send too
  promptInput.addEventListener("keydown", (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleChat();
    }
  });

  // Set initial focus
  promptInput.focus();

}); // DOMContentLoaded
