const fileInput = document.getElementById("fileInput");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let originalImageData = null; // Will store the raw image data after channel swap
let currentImageData = null;  // For manipulations (white balance, etc.)

// Helper: clamp a value between 0 and 255
function clamp(value) {
  return Math.max(0, Math.min(255, value));
}

// Load image from file input
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      // Resize canvas
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);

      // Get the image data
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imageData.data;

      // Swap red and blue channels (data format: [R,G,B,A, R,G,B,A, ...])
      for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        // Swap red & blue
        data[i]     = blue;  // new R
        data[i + 1] = green; // new G
        data[i + 2] = red;   // new B
      }

      // Put swapped data back, draw it, and store it
      ctx.putImageData(imageData, 0, 0);

      // Keep a copy of the swapped data as the "original"
      originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

// On canvas click, set that pixel as “white” and do a simple white balance
canvas.addEventListener("click", (event) => {
  if (!currentImageData) return;

  // Get click position on the canvas
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Calculate index in the data array (row-major, 4 bytes per pixel)
  const idx = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
  let data = currentImageData.data;

  // The pixel’s current R, G, B
  const r0 = data[idx + 0];
  const g0 = data[idx + 1];
  const b0 = data[idx + 2];

  // We'll make that pixel become gray (white).
  // Simple approach: find average, scale R, G, B so that they become (avg, avg, avg).
  const avg = (r0 + g0 + b0) / 3;
  const scaleR = r0 ? avg / r0 : 1;
  const scaleG = g0 ? avg / g0 : 1;
  const scaleB = b0 ? avg / b0 : 1;

  // Reset current data to the original swapped version each time
  ctx.putImageData(originalImageData, 0, 0);
  currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  data = currentImageData.data;

  // Scale entire image by those factors
  for (let i = 0; i < data.length; i += 4) {
    data[i]   = clamp(data[i]   * scaleR); // R
    data[i+1] = clamp(data[i+1] * scaleG); // G
    data[i+2] = clamp(data[i+2] * scaleB); // B
  }

  ctx.putImageData(currentImageData, 0, 0);
});
