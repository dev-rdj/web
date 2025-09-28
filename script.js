document.addEventListener("DOMContentLoaded", () => {
  console.log("Jeff Creations - AI Chat Assistant Initialized 🚀");
  
  // ------------------------------------------------
  // --- NEW: BACKGROUND SLIDESHOW LOGIC ---
  // ------------------------------------------------
  const slides = document.querySelectorAll('#background-image-layer .slide');
  let currentSlide = 0;
  const slideInterval = 5000; // Change image every 5 seconds (5000ms)

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
          setInterval(nextSlide, slideInterval);
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

    // Auto-play attempt (will likely fail, but is what was requested)
    audio.play()
        .then(() => {
            console.log("Audio intro successfully started (Auto-Play).");
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
                    audio.play();
                    setTimeout(() => { audio.pause(); audio.currentTime = 0; }, 3000);
                    document.removeEventListener('click', fallbackPlay);
                }
            }, { once: true });
        });
  }


  // ------------------------------------------------
  // --- ORIGINAL: TEMPLATE MENU CONTROL (Hamburger Icon) ---
  // ------------------------------------------------
  const menuToggle = document.querySelector(".menu-toggle");
  const closeMenuBtn = document.querySelector(".close-btn");
  const menuOverlay = document.getElementById("menu-overlay");

  menuToggle.addEventListener("click", () => {
    menuOverlay.classList.add("open");
  });

  closeMenuBtn.addEventListener("click", () => {
    menuOverlay.classList.remove("open");
  });

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
    messageDiv.textContent = content;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  const handleChat = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return; 

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
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${response.statusText} - ${errorData.detail || errorData.error || 'Server responded with an error.'}`);
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

  promptInput.focus();
});
