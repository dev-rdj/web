document.addEventListener("DOMContentLoaded", () => {
    console.log("Soul AI - System Online 🚀");

    /* ================================================================
       1. CONFIGURATION & KEYS
    ================================================================ */
    const JAMENDO_CLIENT_ID = "d5d9b4f5"; 
    const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";
    const CHAT_API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";

    /* ================================================================
       2. DOM ELEMENTS
    ================================================================ */
    const promptInput = document.getElementById("prompt-input");
    const generateBtn = document.getElementById("generate-btn");
    const chatHistory = document.getElementById("chat-history");
    const loading = document.getElementById("loading");
    const musicResults = document.getElementById('music-results');
    
    let activeTab = 'chat';

    /* ================================================================
       3. SMART TAB SWITCHING
    ================================================================ */
    window.switchTab = function(tab) {
        activeTab = tab;

        // Update Tab Button UI
        document.querySelectorAll('.chat-tabs .tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Show/Hide relevant panes
        document.getElementById('chat-view').style.display = tab === 'chat' ? 'block' : 'none';
        document.getElementById('image-view').style.display = tab === 'image' ? 'block' : 'none';
        document.getElementById('music-view').style.display = tab === 'music' ? 'block' : 'none';

        // Update Placeholder based on mode
        if (tab === 'image') {
            promptInput.placeholder = "Describe an image to generate...";
        } else if (tab === 'music') {
            promptInput.placeholder = "Search for a song or artist...";
        } else {
            promptInput.placeholder = "Ask Soul anything...";
        }
        
        promptInput.focus();
    };

    // Attach listeners to your existing tab buttons
    document.querySelectorAll('.chat-tabs .tab').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    /* ================================================================
       4. CORE ACTIONS (Chat, Image, Music)
    ================================================================ */
    
    // --- HANDLING THE MAIN INPUT ---
    const handleAction = async () => {
        const userInput = promptInput.value.trim();
        if (!userInput) return;

        if (activeTab === 'chat') {
            await runChat(userInput);
        } else if (activeTab === 'image') {
            runImageGen(userInput);
        } else if (activeTab === 'music') {
            await runMusicSearch(userInput);
        }
        
        promptInput.value = ""; // Clear input after action
    };

    // --- 1. CHAT LOGIC ---
    async function runChat(text) {
        appendMessage(text, "user");
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
                        { role: "system", content: "You are Soul, a friendly AI assistant created by Jeff." },
                        { role: "user", content: text }
                    ]
                })
            });
            const data = await response.json();
            appendMessage(data.choices[0].message.content, "assistant");
        } catch (err) {
            appendMessage("I'm having trouble connecting to my brain. Try again?", "assistant");
        } finally {
            loading.style.display = "none";
        }
    }

    // --- 2. IMAGE GEN LOGIC (Using Pollinations) ---
    function runImageGen(text) {
        appendMessage(`Creating your image: "${text}"...`, "assistant");
        
        // We use a random seed so requesting the same prompt twice gives a new image
        const seed = Math.floor(Math.random() * 10000);
        const imgURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=1024&height=1024&nologo=true&seed=${seed}`;
        
        const div = document.createElement("div");
        div.classList.add("message", "assistant-message");
        div.innerHTML = `<img src="${imgURL}" class="generated-img" style="width:100%; border-radius:10px; margin-top:10px;" alt="${text}">`;
        
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // --- 3. MUSIC SEARCH LOGIC ---
    async function runMusicSearch(query) {
        musicResults.innerHTML = "Searching Jamendo...";
        try {
            const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=10&search=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            musicResults.innerHTML = ""; // Clear "Searching..."

            if (data.results.length === 0) {
                musicResults.innerHTML = "No songs found for that search.";
                return;
            }

            data.results.forEach(track => {
                const item = document.createElement('div');
                item.className = 'music-track-row';
                item.style = "display:flex; align-items:center; gap:10px; margin-bottom:10px; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;";
                item.innerHTML = `
                    <img src="${track.image}" width="50" height="50" style="border-radius:4px;">
                    <div style="flex:1">
                        <div style="font-weight:bold; font-size:14px;">${track.name}</div>
                        <div style="font-size:12px; opacity:0.7;">${track.artist_name}</div>
                    </div>
                    <button class="play-btn" style="background:var(--purple-electric); border:none; color:white; padding:5px 10px; border-radius:5px; cursor:pointer;">Play</button>
                `;

                item.querySelector('.play-btn').addEventListener('click', () => {
                    switchTab('chat'); // Switch to chat to see the player
                    const playerDiv = document.createElement('div');
                    playerDiv.className = "message assistant-message";
                    playerDiv.innerHTML = `
                        <p>🎵 Now Playing: <strong>${track.name}</strong></p>
                        <audio controls autoplay src="${track.audio}" style="width:100%;"></audio>
                    `;
                    chatHistory.appendChild(playerDiv);
                    chatHistory.scrollTop = chatHistory.scrollHeight;
                });

                musicResults.appendChild(item);
            });
        } catch (err) {
            musicResults.innerHTML = "Music search failed. Check your connection.";
        }
    }

    /* ================================================================
       5. HELPERS & EVENTS
    ================================================================ */
    const appendMessage = (content, sender) => {
        const div = document.createElement("div");
        div.classList.add("message", `${sender}-message`);
        div.textContent = content;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    generateBtn.addEventListener("click", handleAction);
    promptInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleAction();
    });

    // Handle Background Slideshow (from your original logic)
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
});
