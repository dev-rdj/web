// ============================
// BACKGROUND SLIDESHOW
// ============================

const bgImages = ["images/image1.jpg", "images/image2.jpg", "images/image3.jpg"];
let currentImageIndex = 0;

function changeBackground() {
    currentImageIndex = (currentImageIndex + 1) % bgImages.length;
    document.getElementById("bg-image").src = bgImages[currentImageIndex];
}
setInterval(changeBackground, 5000);


// ============================
// MENU
// ============================

document.getElementById("menu-icon").onclick = () => {
    document.getElementById("menu-overlay").style.display = "flex";
};

document.getElementById("close-menu").onclick = () => {
    document.getElementById("menu-overlay").style.display = "none";
};


// ============================
// AUDIO AUTOPLAY FIX
// ============================

const audio = document.getElementById("background-audio");

audio.muted = true;
audio.play().then(() => {
    audio.muted = false;
});

document.getElementById("audio-toggle").onclick = () => {
    if (audio.paused) audio.play();
    else audio.pause();
};


// ============================
// CHAT SYSTEM
// ============================

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send-btn");
const loading = document.getElementById("loading");

function addMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = sender === "user" ? "user-message" : "ai-message";
    msg.innerHTML = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addImage(src) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "generated-img";

    const msg = document.createElement("div");
    msg.className = "ai-message";
    msg.appendChild(img);

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}


// ============================
// TEXT → IMAGE (PUTER AI)
// ============================

async function generateImage(prompt) {
    loading.style.display = "block";

    try {
        const el = await puter.ai.txt2img(prompt, {
            model: "gemini-2.5-flash-image-preview"
        });

        loading.style.display = "none";
        addMessage("ai", "Here is your image ❤️");
        addImage(el.src);

    } catch (error) {
        loading.style.display = "none";
        addMessage("ai", "❌ Failed to generate image.");
    }
}


// ============================
// TEXT → AI (YOUR OLD API)
// ============================

async function sendTextToAI(text) {
    loading.style.display = "block";

    try {
        const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer a7f22572-4f0f-4bc5-b137-782a90e50c5e`
            },
            body: JSON.stringify({
                model: "meta-llama/Llama-3.3-70B-Instruct",
                messages: [{ role: "user", content: text }]
            })
        });

        const data = await response.json();
        const reply = data.choices[0].message.content;

        loading.style.display = "none";
        addMessage("ai", reply);

    } catch (error) {
        loading.style.display = "none";
        addMessage("ai", "❌ Error contacting AI.");
    }
}


// ============================
// SEND MESSAGE
// ============================

sendBtn.onclick = () => {
    const text = messageInput.value.trim();
    if (!text) return;

    addMessage("user", text);
    messageInput.value = "";

    // IMAGE GENERATION COMMAND
    if (text.startsWith("/img")) {
        const prompt = text.replace("/img", "").trim();
        generateImage(prompt);
        return;
    }

    // NORMAL CHAT
    sendTextToAI(text);
};
