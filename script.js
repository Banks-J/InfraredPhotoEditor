/* Globally ensure box-sizing applies to all elements */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  background: #f1f2f3; /* Light gray background */
}

.container {
  background: #ffffff;
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

h1 {
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
}

#fileInput {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 2px dashed #888;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  text-align: center;
  transition: background 0.3s ease;
}

#fileInput:hover {
  background: #f0f0f0;
}

/* Center the canvas and add some nice styling */
canvas {
  display: block;
  margin: 0 auto;
  cursor: crosshair;
  border-radius: 10px;
  margin-top: 10px;
  max-width: 100%;
  border: 2px solid #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Save button styling */
#saveBtn {
  display: block;
  margin: 20px auto;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  background-color: #0078d4;
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

#saveBtn:hover {
  background-color: #005fa3;
}

.note {
  margin-top: 20px;
  font-size: 0.9em;
  color: #555;
}

.note ol {
  margin-left: 1.5em;
}

.note strong {
  font-weight: 600;
}
