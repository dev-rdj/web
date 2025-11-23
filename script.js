/* ------------------------------------------------
   NEW IMAGE GENERATOR USING BYTEZ (Client-Side)
   - Uses the Dreamlike-Photoreal-2.0 model endpoint.
   - Uses 'text' for the prompt field instead of 'input'.
------------------------------------------------ */

// !! WARNING: This key is visible in the browser source code !!
const BYTEZ_API_KEY = "dfb37a549a0651d78812dd2e1748103f"; 
// UPDATED ENDPOINT based on your successful curl test structure:
const BYTEZ_ENDPOINT = "https://api.bytez.ai/models/v2/dreamlike-art/dreamlike-photoreal-2.0"; 

async function generateImage(prompt) {
  loading.style.display = "block";
  loading.textContent = "Generating image using Dreamlike Soul... 🎨⏳";

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
        text: prompt, // Using 'text' as per the curl command structure
        // You can include optional parameters here if needed (e.g., negative prompt)
      })
    });

    if (!res.ok) {
        // Attempt to read the error message from the API response
        const errorData = await res.json().catch(() => ({}));
        console.error("Bytez API Error:", errorData);
        throw new Error(`API failed: ${errorData.message || res.statusText}`);
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
    appendMessage("Error generating image: " + err.message, "assistant");
  } finally {
    loading.style.display = "none";
  }
}
