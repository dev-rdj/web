document.addEventListener("DOMContentLoaded", () => {
  console.log("Jeff Creations - AI Chat Assistant Initialized 🚀");
  
  // ------------------------------------------------
  // --- NEW: AUDIO INTRO LOGIC (3-Second Auto-Play Attempt) ---
  // ------------------------------------------------
  const audio = document.getElementById('introSFX');
  
  if (audio) {
    // Set volume to half (50%) to make it less intrusive
    audio.volume = 0.5; 

    // ⚠️ WARNING: This .play() function will be blocked by most modern browsers
    // (Chrome, Safari, Firefox) unless the user has already clicked the page.
    audio.play()
        .then(() => {
            console.log("Audio intro successfully started (Auto-Play).");
            // Stop the audio after 3 seconds
            setTimeout(() => {
                audio.pause();
                audio.currentTime = 0; // Rewind for next reload attempt
            }, 3000); 
        })
        .catch(error => {
            console.warn("Audio auto-play failed. Browser policy requires user interaction.", error);
            
            // Fallback: Add a click listener so the user can hear it on their first interaction.
            document.addEventListener('click', function fallbackPlay() {
                if (audio.paused) {
                    audio.play();
                    setTimeout(() => { audio.pause(); audio.currentTime = 0; }, 3000);
                    // Remove listener after first successful play attempt
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

  // Close menu when a link is clicked
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

  // YOUR API KEY AND ENDPOINT (Ensure this key is valid)
  const API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions"; 
  const API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e"; 

  // --- AI CHAT API FUNCTIONS ---
  const appendMessage = (content, sender) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = content;
    chatHistory.appendChild(messageDiv);
    
    chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom
  };

  const handleChat = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return; 

    // 1. Append User Message
    appendMessage(prompt, 'user');
    promptInput.value = ''; 

    // 2. Initial Loading State
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
      
      // 3. Append Assistant Message
      appendMessage(assistantResponse, 'assistant');

    } catch (err) {
      clearTimeout(customMessageTimeout);
      appendMessage(`Error: ${err.message}. Please check your connection, API Key, and the network console.`, 'assistant');
    } finally {
      // 4. Hide Loading State
      loading.style.display = "none";
    }
  };

  // Event Listeners for Chat
  generateBtn.addEventListener("click", handleChat);
  promptInput.addEventListener("keypress", (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleChat();
    }
  });

  // Automatically focus on the input when the page loads
  promptInput.focus();
});
