document.addEventListener("DOMContentLoaded", () => {
    const JAMENDO_CLIENT_ID = "d5d9b4f5"; 
    const CHAT_API_KEY = "a7f22572-4f0f-4bc5-b137-782a90e50c5e";
    const CHAT_API_ENDPOINT = "https://api.sambanova.ai/v1/chat/completions";

    const promptInput = document.getElementById("prompt-input");
    const generateBtn = document.getElementById("generate-btn");
    const chatHistory = document.getElementById("chat-history");
    const loading = document.getElementById("loading");

    const appendMessage = (content, sender, isHTML = false) => {
        const div = document.createElement("div");
        div.classList.add("message", `${sender}-message`);
        if (isHTML) div.innerHTML = content;
        else div.textContent = content;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    const handleAction = async () => {
        const input = promptInput.value.trim();
        if (!input) return;
        const lowInput = input.toLowerCase();
        promptInput.value = "";

        // 1. IMAGE COMMAND (Look for "create", "generate", "image", "draw")
        if (lowInput.includes("create") || lowInput.includes("image") || lowInput.includes("draw")) {
            appendMessage(input, "user");
            appendMessage("Generating your image... 🎨", "assistant");
            const imgURL = `https://image.pollinations.ai/prompt/${encodeURIComponent(input)}?width=1024&height=1024&nologo=true&seed=${Math.random()}`;
            appendMessage(`<img src="${imgURL}" class="generated-img" style="width:100%; border-radius:10px; margin-top:10px;">`, "assistant", true);
            return;
        }

        // 2. MUSIC COMMAND (Look for "play", "music", "song")
        if (lowInput.includes("play") || lowInput.includes("music") || lowInput.includes("song")) {
            appendMessage(input, "user");
            appendMessage("Searching for music... 🎵", "assistant");
            try {
                const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=1&search=${encodeURIComponent(input)}`);
                const data = await res.json();
                if (data.results.length > 0) {
                    const track = data.results[0];
                    appendMessage(`
                        <div style="background:rgba(255,255,255,0.1); padding:10px; border-radius:8px;">
                            <b>${track.name}</b> by ${track.artist_name}<br>
                            <audio controls autoplay src="${track.audio}" style="width:100%; margin-top:8px;"></audio>
                        </div>`, "assistant", true);
                } else {
                    appendMessage("I couldn't find any music for that.", "assistant");
                }
            } catch (e) { appendMessage("Music search failed.", "assistant"); }
            return;
        }

        // 3. DEFAULT CHAT
        appendMessage(input, "user");
        loading.style.display = "block";
        try {
            const response = await fetch(CHAT_API_ENDPOINT, {
                method: "POST",
                headers: { "Authorization": `Bearer ${CHAT_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "Meta-Llama-3.1-8B-Instruct",
                    messages: [{ role: "system", content: "You are Soul, an AI by Jeff." }, { role: "user", content: input }]
                })
            });
            const data = await response.json();
            appendMessage(data.choices[0].message.content, "assistant");
        } catch (err) {
            appendMessage("Soul is resting. Try again in a second!", "assistant");
        } finally {
            loading.style.display = "none";
        }
    };

    generateBtn.addEventListener("click", handleAction);
    promptInput.addEventListener("keypress", (e) => { if (e.key === "Enter") handleAction(); });

    // Background Slideshow
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
