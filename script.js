document.addEventListener("DOMContentLoaded", () => {
  console.log("Welcome to Developer Jeff's website 🚀");
});

async function generateImage() {
  const prompt = document.getElementById("prompt").value;
  const imageUpload = document.getElementById("imageUpload").files[0];
  const resultDiv = document.getElementById("result");

  if (!prompt) {
    resultDiv.innerHTML = "<p>Please enter a prompt.</p>";
    return;
  }

  resultDiv.innerHTML = "<p>⏳ Generating... please wait</p>";

  const formData = new FormData();
  formData.append("text", prompt);
  if (imageUpload) {
    formData.append("image", imageUpload);
  }

  try {
    const res = await fetch("https://api.deepai.org/api/text2img", {
      method: "POST",
      headers: {
        "Api-Key": "e4e7b194-f102-4660-ad88-7e46e1f75334"
      },
      body: formData
    });

    const data = await res.json();
    if (data.output_url) {
      resultDiv.innerHTML = `
        <img src="${data.output_url}" alt="Generated Image" class="generated-img"/>
        <a href="${data.output_url}" download="jeff-ai-image.png" class="download-btn">⬇ Download Image</a>
      `;
    } else {
      resultDiv.innerHTML = `<p>⚠️ Error: ${JSON.stringify(data)}</p>`;
    }
  } catch (err) {
    resultDiv.innerHTML = `<p>❌ Error: ${err.message}</p>`;
  }
}
