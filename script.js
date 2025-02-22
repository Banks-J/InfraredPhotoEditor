const fileInput = document.getElementById("fileInput");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const saveBtn = document.getElementById("saveBtn");

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
      // Resize canvas to match the image
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

  // Get bounding box of the canvas in page coordinates
  const rect = canvas.getBoundingClientRect();

  // Correct for possible CSS scaling by determining how many
  // real canvas pixels correspond to each displayed pixel
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  // Convert the browser event (clientX/clientY) to actual canvas coordinates
  const x = Math.floor((event.clientX - rect.left) * scaleX);
  const y = Math.floor((event.clientY - rect.top) * scaleY);

  // Calculate index in the data array (row-major, 4 bytes per pixel)
  const idx = (y * canvas.width + x) * 4;

  // Using the *original* swapped data to do the white balance from scratch each time
  // so repeated clicks on the same pixel produce the exact same result.
  ctx.putImageData(originalImageData, 0, 0);
  currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = currentImageData.data;

  // Get the pixel’s R, G, B
  const r0 = data[idx];
  const g0 = data[idx + 1];
  const b0 = data[idx + 2];

  // We'll make that pixel become gray (white).
  // Simple approach: find average, scale R, G, B so that they become (avg, avg, avg).
  const avg = (r0 + g0 + b0) / 3;
  const scaleR = r0 ? avg / r0 : 1;
  const scaleG = g0 ? avg / g0 : 1;
  const scaleB = b0 ? avg / b0 : 1;

  // Scale entire image by these factors
  for (let i = 0; i < data.length; i += 4) {
    data[i]   = clamp(data[i]   * scaleR); // R
    data[i+1] = clamp(data[i+1] * scaleG); // G
    data[i+2] = clamp(data[i+2] * scaleB); // B
  }

  // Display the newly white-balanced image
  ctx.putImageData(currentImageData, 0, 0);
});

// Save button to download the edited image as a PNG
saveBtn.addEventListener("click", () => {
  if (!currentImageData) return; // No image to save

  // Create a temporary link and trigger download
  const link = document.createElement("a");
  link.download = "edited_infrared.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
