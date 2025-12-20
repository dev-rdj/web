document.addEventListener("DOMContentLoaded", () => {
  console.log("Jeff Creations - AI Chat Assistant Initialized 🚀");

  /* ------------------------------------------------
     1. API KEYS (THE MOST IMPORTANT PART!)
     Get a free Client ID from: https://developer.jamendo.com/v3.0
  ------------------------------------------------ */
  const JAMENDO_CLIENT_ID = "REPLACE_WITH_YOUR_JAMENDO_CLIENT_ID"; 
  
  // Existing Keys
  const CHAT_API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";
  const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";
  
  const BYTEZ_ENDPOINT = "https://api.bytez.ai/models/v2/dreamlike-art/dreamlike-photoreal-2.0"; 
  const BYTEZ_API_KEY = "dfb37a549a0651d78812dd2e1748103f"; 

  /* ------------------------------------------------
     2. DOM ELEMENTS
  ------------------------------------------------ */
  const generateBtn = document.getElementById("generate-btn");
  const promptInput = document.getElementById("prompt-input");
  const chatHistory = document.getElementById("chat-history");
  const loading = document.getElementById("loading");
  const imageResultArea = document.getElementById("image-result-area");
  
  let activeTab = 'chat';

  /* ------------------------------------------------
     3. HELPER FUNCTIONS
  ------------------------------------------------ */
  const appendMessage = (content, sender) => {
    const div = document.createElement("div");
    div.classList.add("message", `${sender}-message`);
    div.textContent = content;
    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  const appendImageToChat = (src, prompt) => {
    const div = document.createElement("div");
    div.classList.add("message", "assistant-message");
    const img = document.createElement("img");
    img.src = src;
    img.alt = prompt;
    img.className = "generated-img";
    div.appendChild(img);
    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };

  /* ------------------------------------------------
     4. TAB SWITCHING
  ------------------------------------------------ */
  window.switchTab = function(tab) {
    activeTab = tab;
    
    // update buttons
    document.querySelectorAll('.chat-tabs .tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // show/hide panes
    document.getElementById('chat-view').style.display = tab === 'chat' ? 'block' : 'none';
    document.getElementById('image-view').style.display = tab === 'image' ? 'block' : 'none';
    document.getElementById('music-view').style.display = tab === 'music' ? 'block' : 'none';

    // update input placeholder
    if (tab === 'image') promptInput.placeholder = "Describe an image...";
    else if (tab === 'music') promptInput.placeholder = "Search for music here...";
    else promptInput.placeholder = "Ask a technical question...";
    
    promptInput.focus();
  };

  // Add click listeners to tabs
  document.querySelectorAll('.chat-tabs .tab').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  /* ------------------------------------------------
     5. IMAGE GENERATION (Bytez)
  ------------------------------------------------ */
  async function generateImage(prompt) {
    // Show loading in chat
    appendMessage(`Generating image for: "${prompt}"...`, "assistant");
    
    try {
      const res = await fetch(BYTEZ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${BYTEZ_API_KEY}` 
        },
        body: JSON.stringify({ text: prompt })
      });

      const data = await res.json();
      
      // Check for API errors
      if (!res.ok) throw new Error(data.message || "API Error");
      
      const imgURL = data?.output?.image_url;
      if (!imgURL) throw new Error("No image URL returned");

      appendImageToChat(imgURL, prompt);

      // Also show in Image Tab if open
      if(activeTab === 'image') {
          const img = document.createElement("img");
          img.src = imgURL;
          img.className = "generated-img";
          imageResultArea.prepend(img);
      }

    } catch (err) {
      console.error(err);
      appendMessage("Error generating image: " + err.message, "assistant");
    }
  }

  /* ------------------------------------------------
     6. CHAT LOGIC (SambaNova)
  ------------------------------------------------ */
  const handleMainInput = async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // IF IMAGE TAB IS ACTIVE
    if (activeTab === "image") {
      promptInput.value = "";
      await generateImage(prompt);
      return;
    }

    // IF MUSIC TAB IS ACTIVE - Redirect to music search
    if (activeTab === "music") {
        document.getElementById('music-q').value = prompt;
        document.getElementById('music-search').click();
        promptInput.value = "";
        return;
    }

    // NORMAL CHAT
    appendMessage(prompt, "user");
    promptInput.value = "";
    loading.style.display = "block";

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
            { role: "system", content: "You are Soul, a helpful AI assistant." },
            { role: "user", content: prompt }
          ],
          max_tokens: 250
        })
      });

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || "No response";
      appendMessage(reply, "assistant");

    } catch (err) {
      appendMessage("Error: Could not connect to Soul.", "assistant");
    } finally {
      loading.style.display = "none";
    }
  };

  /* ------------------------------------------------
     7. MUSIC LOGIC (Jamendo)
  ------------------------------------------------ */
  const musicSearchBtn = document.getElementById('music-search');
  
  async function searchMusic(query) {
      const resultsDiv = document.getElementById('music-results');
      resultsDiv.innerHTML = "Searching...";
      
      if(JAMENDO_CLIENT_ID.includes("REPLACE")) {
          resultsDiv.innerHTML = "<span style='color:red'>Error: Missing Jamendo Client ID in script.js</span>";
          return;
      }

      try {
          const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&search=${encodeURIComponent(query)}`);
          const data = await response.json();
          
          resultsDiv.innerHTML = ""; // Clear loading
          
          if(!data.results || data.results.length === 0) {
              resultsDiv.textContent = "No music found.";
              return;
          }

          data.results.forEach(track => {
              const row = document.createElement('div');
              row.className = 'music-track-row';
              row.innerHTML = `
                <img src="${track.image}" width="50" height="50" style="border-radius:4px;">
                <div style="flex:1; margin-left:10px;">
                    <div style="font-weight:bold">${track.name}</div>
                    <div style="font-size:0.8em; opacity:0.7">${track.artist_name}</div>
                </div>
                <button class="play-btn" style="padding:5px 10px; cursor:pointer;">Play</button>
              `;
              
              // Add play functionality
              row.querySelector('.play-btn').addEventListener('click', () => {
                  switchTab('chat'); // Go back to chat to show the player
                  
                  const wrapper = document.createElement('div');
                  wrapper.innerHTML = `
                    <div class="message assistant-message" style="width:100%">
                        <p><strong>Now Playing:</strong> ${track.name}</p>
                        <audio controls autoplay src="${track.audio}" style="width:100%"></audio>
                    </div>
                  `;
                  chatHistory.appendChild(wrapper);
                  chatHistory.scrollTop = chatHistory.scrollHeight;
              });

              resultsDiv.appendChild(row);
          });

      } catch (e) {
          resultsDiv.textContent = "Error fetching music.";
          console.error(e);
      }
  }

  musicSearchBtn.addEventListener('click', () => {
      const q = document.getElementById('music-q').value;
      if(q) searchMusic(q);
  });


  /* ------------------------------------------------
     8. INITIALIZATION & EVENTS
  ------------------------------------------------ */
  generateBtn.addEventListener("click", handleMainInput);
  promptInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleMainInput();
  });

  // Start Background Slideshow
  const slides = document.querySelectorAll('#background-image-layer .slide');
  let currentSlide = 0;
  if(slides.length > 0) {
      slides[0].classList.add('active');
      setInterval(() => {
          slides[currentSlide].classList.remove('active');
          currentSlide = (currentSlide + 1) % slides.length;
          slides[currentSlide].classList.add('active');
      }, 5000);
  }

  // Handle Audio Intro (Click fallback)
  const audio = document.getElementById('introSFX');
  document.body.addEventListener('click', () => {
      // Try to play audio on first user interaction if it hasn't played
      if(audio.paused) {
          audio.play().catch(e => console.log("Audio play failed (normal if no file):", e));
      }
  }, { once: true }); // Only run once
  
  // Menu Toggle
  document.querySelector(".menu-toggle").addEventListener("click", () => {
      document.getElementById("menu-overlay").classList.add("open");
  });
  document.querySelector(".close-btn").addEventListener("click", () => {
      document.getElementById("menu-overlay").classList.remove("open");
  });

});
