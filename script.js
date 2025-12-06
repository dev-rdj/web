document.addEventListener("DOMContentLoaded", () => {
  console.log("Jeff Creations - AI Chat Assistant Initialized 🚀");

  /* ------------------------------------------------
     API KEYS & ENDPOINTS
     !! WARNING: These keys are visible in the browser source code !!
  ------------------------------------------------ */
  // SambaNova (Llama Chat) API
  const CHAT_API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";
  const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";

  // Bytez (Image Generation) API - Using Dreamlike model based on testing
  const BYTEZ_API_KEY = "dfb37a549a0651d78812dd2e1748103f"; 
  const BYTEZ_ENDPOINT = "https://api.bytez.ai/models/v2/dreamlike-art/dreamlike-photoreal-2.0"; 

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
    loading.textContent = "Generating image using Soul... 🎨⏳";

    try {
      const res = await fetch(BYTEZ_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          // CRITICAL: Ensure the 'Bearer ' prefix is included
          "Authorization": `Bearer ${BYTEZ_API_KEY}` 
        },
        body: JSON.stringify({
          text: prompt, // Uses 'text' for this model
        })
      });

      if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Bytez API Error:", errorData);
          throw new Error(`API failed: ${errorData.message || res.statusText || res.status}`);
      }

      const data = await res.json();
      
      // The image URL is often nested under 'output' in Bytez responses
      const imgURL = data?.output?.image_url;

      if (!imgURL) {
        appendMessage("Image API succeeded, but returned an empty image link.", "assistant");
        return;
      }

      appendMessage("Here is your image:", "assistant");
      appendImageMessage(imgURL, prompt);

    } catch (err) {
      appendMessage("Feature Coming Soon!!!" + err.message, "assistant");
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
      // Added error logging for chat as well
      appendMessage("Error: Could not connect to chat API. Check key/limits.", "assistant");
      console.error("Chat API Error:", err);
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

/* ===========================================================
   MUSIC-IN-CHAT EXTENSION (Appended safely; non-destructive)
   - Adds Jamendo search & Play-in-Chat functionality
   - Will NOT overwrite your chat logic; it wraps/extends switchTab
   - Replace MUSIC_CLIENT_ID with your Jamendo client id or use proxy
   =========================================================== */

(() => {
  // Config: replace with your Jamendo client id or enable proxy
  const MUSIC_CLIENT_ID = "REPLACE_WITH_YOUR_JAMENDO_CLIENT_ID";
  const USE_PROXY = false;
  const PROXY_URL = "/jamendo-proxy";
  const JAMENDO_BASE = "https://api.jamendo.com/v3.0";

  // Safe references to DOM elements used by the music UI
  const musicQ = document.getElementById('music-q');
  const musicSearchBtn = document.getElementById('music-search');
  const musicLimit = document.getElementById('music-limit');
  const musicResults = document.getElementById('music-results');
  const musicPlayerArea = document.getElementById('music-player-area');
  const musicInsertLastBtn = document.getElementById('music-insert-last');

  // Keep track of last played track
  let LAST_PLAYED_TRACK = null;

  // Helper: create element
  function createEl(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v);
    });
    children.forEach(c => el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return el;
  }

  // Jamendo fetch (supports proxy)
  async function jamendoFetchTracks(q, limit = 8) {
    if (USE_PROXY) {
      const url = new URL(PROXY_URL, window.location.origin);
      if (q) url.searchParams.set('q', q);
      url.searchParams.set('limit', String(limit));
      const r = await fetch(url.toString());
      if (!r.ok) throw new Error('Proxy error ' + r.status);
      return (await r.json()).results || [];
    } else {
      if (!MUSIC_CLIENT_ID || MUSIC_CLIENT_ID.startsWith('REPLACE')) {
        throw new Error('Missing Jamendo client id. Put it into MUSIC_CLIENT_ID or enable proxy.');
      }
      const params = new URLSearchParams({
        client_id: MUSIC_CLIENT_ID,
        format: 'json',
        limit,
      });
      if (q) params.set('search', q);
      const resp = await fetch(`${JAMENDO_BASE}/tracks/?${params.toString()}`);
      if (!resp.ok) throw new Error('Jamendo API error ' + resp.status);
      const json = await resp.json();
      return json.results || [];
    }
  }

  // Render tracks in music pane
  function renderMusicResults(tracks) {
    if (!musicResults) return;
    musicResults.innerHTML = '';
    if (!tracks || tracks.length === 0) {
      musicResults.appendChild(createEl('div', { class: 'small', html: 'No results. Try another query.' }));
      return;
    }
    tracks.forEach(track => {
      const row = createEl('div', { class: 'music-track-row' }, []);
      const cover = createEl('img', { src: track.album_image || track.track_image || '', alt: track.name || 'cover' });
      const meta = createEl('div', { style: 'flex:1' }, []);
      const title = createEl('div', { class: 'title', html: (track.name || 'Untitled') + ' — ' + (track.artist_name || '') });
      const info = createEl('div', { class: 'small', html: `Duration: ${Math.floor((track.duration || 0)/60)}:${String((track.duration||0)%60).padStart(2,'0')} • License: ${track.license||'unknown'}` });
      const btn = createEl('button', { type: 'button', style: 'margin-top:6px;padding:6px 8px;border-radius:6px' }, ['Play in chat']);
      btn.addEventListener('click', () => openTrackInChat(track));
      meta.appendChild(title); meta.appendChild(info); meta.appendChild(btn);
      row.appendChild(cover); row.appendChild(meta);
      musicResults.appendChild(row);
    });
  }

  // Insert track as chat-style bubble into existing chatHistory
  function openTrackInChat(track) {
    LAST_PLAYED_TRACK = track;
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;

    // Ensure chat tab is visible. We attempt to call switchTab('chat') safely.
    try {
      if (typeof window.switchTab === 'function') window.switchTab('chat');
    } catch (e) { /* ignore */ }

    const wrapper = createEl('div', { style: 'margin:10px 0; display:flex; gap:10px; align-items:flex-start;' }, []);
    const cover = createEl('img', { src: track.album_image || track.track_image || '', style: 'width:64px;height:64px;object-fit:cover;border-radius:8px' });
    const bubble = createEl('div', { class: 'music-bubble' }, []);
    const title = createEl('div', { style: 'font-weight:600; margin-bottom:6px;' }, [ document.createTextNode((track.name || 'Untitled') + ' — ' + (track.artist_name || '')) ]);
    const audio = createEl('audio', { controls: '', style: 'width:100%' }, []);
    if (track.audio) audio.src = track.audio;
    else if (track.audiodownload) audio.src = track.audiodownload;
    else if (track.streaming) audio.src = track.streaming;
    else if (track.file) audio.src = track.file;

    const license = createEl('div', { class: 'small', style: 'margin-top:6px; color:rgba(255,255,255,0.7);' }, [ document.createTextNode('License: ' + (track.license || 'unknown')) ]);

    bubble.appendChild(title);
    if (audio.src) bubble.appendChild(audio);
    else bubble.appendChild(createEl('div', { class: 'small', html: 'No playable stream available for this track.' }));

    bubble.appendChild(license);
    wrapper.appendChild(cover);
    wrapper.appendChild(bubble);

    chatHistory.appendChild(wrapper);
    setTimeout(()=> { chatHistory.scrollTop = chatHistory.scrollHeight; }, 80);
  }

  // Insert last-played track into chat when user clicks the "Insert last played into chat" button
  function insertLastPlayedIntoChat() {
    if (!LAST_PLAYED_TRACK) {
      alert('No track has been played yet.');
      return;
    }
    openTrackInChat(LAST_PLAYED_TRACK);
  }

  // Wire up the music UI events (if elements exist)
  function setupMusicUI() {
    if (!musicSearchBtn || !musicQ || !musicLimit) return;

    musicSearchBtn.addEventListener('click', async () => {
      const q = (musicQ.value || '').trim();
      const lim = parseInt(musicLimit.value || '6', 10);
      musicResults.innerHTML = '';
      musicResults.appendChild(createEl('div', { class: 'small', html: 'Searching...' }));
      try {
        const tracks = await jamendoFetchTracks(q, lim);
        renderMusicResults(tracks);
      } catch (err) {
        musicResults.innerHTML = '';
        musicResults.appendChild(createEl('div', { class: 'small', html: 'Error: ' + err.message }));
      }
    });

    musicQ.addEventListener('keydown', (e) => { if (e.key === 'Enter') musicSearchBtn.click(); });
    if (musicInsertLastBtn) musicInsertLastBtn.addEventListener('click', insertLastPlayedIntoChat);
  }

  // Extend existing switchTab safely: if switchTab exists, wrap it to support 'music'; if not, define basic
  (function patchSwitchTab() {
    const orig = window.switchTab;
    if (typeof orig === 'function') {
      window.switchTab = function(tab) {
        if (tab === 'music') {
          // mark tabs active/inactive
          document.querySelectorAll('.chat-tabs .tab').forEach(btn => {
            const t = btn.dataset.tab;
            if (t === 'music') {
              btn.classList.add('active');
              btn.setAttribute('aria-selected', 'true');
            } else {
              btn.classList.remove('active');
              btn.setAttribute('aria-selected', 'false');
            }
          });
          // show/hide panes
          document.querySelectorAll('#chat-box .pane').forEach(p => p.style.display = 'none');
          const pane = document.getElementById('music-view');
          if (pane) pane.style.display = 'block';
          const q = document.getElementById('music-q');
          if (q) q.focus();
        } else {
          // fallback to original behavior for chat/image
          try { orig(tab); } catch(e) { console.error('Error calling original switchTab:', e); }
        }
      };
    } else {
      // No original switchTab (unlikely), define a minimal one
      window.switchTab = function(tab) {
        document.querySelectorAll('.chat-tabs .tab').forEach(btn => btn.classList.remove('active'));
        if (tab === 'music') {
          const el = document.getElementById('tab-music'); if (el) el.classList.add('active');
          document.querySelectorAll('#chat-box .pane').forEach(p => p.style.display = 'none');
          const pane = document.getElementById('music-view'); if (pane) pane.style.display = 'block';
        } else if (tab === 'image') {
          const el = document.getElementById('tab-image'); if (el) el.classList.add('active');
          document.querySelectorAll('#chat-box .pane').forEach(p => p.style.display = 'none');
          const pane = document.getElementById('image-view'); if (pane) pane.style.display = 'block';
        } else {
          const el = document.getElementById('tab-chat'); if (el) el.classList.add('active');
          document.querySelectorAll('#chat-box .pane').forEach(p => p.style.display = 'none');
          const pane = document.getElementById('chat-view'); if (pane) pane.style.display = 'block';
        }
      };
    }
  })();

  // Auto-run setup on DOMContentLoaded (if the page's DOM is ready)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMusicUI);
  } else {
    setupMusicUI();
  }

  // Expose some helpers to window for debugging
  window.__music_in_chat = {
    openTrackInChat,
    jamendoFetchTracks,
    renderMusicResults,
    insertLastPlayedIntoChat
  };

})();
