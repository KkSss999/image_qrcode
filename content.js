// Content script for QR code scanning functionality
console.log('[QR Reader] Content script loaded');
console.log('[QR Reader] jsQR available:', typeof jsQR !== 'undefined');

// Reference to the result popup element
let resultPopup = null;

/**
 * Creates a popup dialog to display QR code scan results
 * @returns {HTMLDivElement} The content div of the popup
 */
function createPopup() {
  // Remove existing popup if present
  if (resultPopup) {
    resultPopup.remove();
  }

  // Create popup container
  const popupContainer = document.createElement('div');
  popupContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999998;
  `;

  // Create semi-transparent overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
  `;

  // Create result popup dialog
  resultPopup = document.createElement('div');
  resultPopup.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 2px solid #333;
    border-radius: 8px;
    padding: 20px;
    min-width: 300px;
    max-width: 500px;
    max-height: 300px;
    overflow: auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 999999;
    font-family: Arial, sans-serif;
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
  `;

  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 5px;
    right: 10px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  `;

  // Create content display area
  const contentDiv = document.createElement('div');
  contentDiv.style.cssText = `
    margin-top: 10px;
    word-wrap: break-word;
    user-select: text;
    -webkit-user-select: text;
    cursor: text;
  `;

  // Assemble popup elements
  resultPopup.appendChild(closeBtn);
  resultPopup.appendChild(contentDiv);
  popupContainer.appendChild(overlay);
  popupContainer.appendChild(resultPopup);

  // Close popup handler
  const closeAll = () => {
    if (popupContainer && popupContainer.parentNode) {
      popupContainer.parentNode.removeChild(popupContainer);
    }
    resultPopup = null;
  };

  // Attach close handlers
  closeBtn.onclick = closeAll;
  overlay.onclick = closeAll;

  // Add popup to page
  document.body.appendChild(popupContainer);

  return contentDiv;
}

/**
 * Displays the QR code scan result in a popup
 * @param {Object} result - The scan result object with success flag and data/error message
 */
function showResult(result) {
  console.log('[QR Reader] Showing result:', result);
  const contentDiv = createPopup();
  
  if (result.success) {
    contentDiv.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #333;">QR Code Content</h3>
      <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.5;">${escapeHtml(result.data)}</p>
    `;
  } else {
    contentDiv.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #e74c3c;">Scan Failed</h3>
      <p style="color: #666; margin: 0;">${escapeHtml(result.error)}</p>
    `;
  }
}

/**
 * Scans a QR code from an image data URL
 * @param {string} imageDataUrl - Base64 encoded image data
 * @returns {Promise<Object>} Scan result with success flag and data/error message
 */
async function scanQRCodeFromDataUrl(imageDataUrl) {
  console.log('[QR Reader] Starting scan from data URL...');
  try {
    // Load image from data URL
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        console.log('[QR Reader] Image loaded, size:', image.naturalWidth, 'x', image.naturalHeight);
        resolve(image);
      };
      image.onerror = () => reject(new Error("Failed to load image"));
      image.src = imageDataUrl;
    });

    // Draw image to canvas for pixel data extraction
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    // Extract image data for QR scanning
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log('[QR Reader] Image data size:', imageData.data.length);
    
    // Check if jsQR library is available
    if (typeof jsQR === 'undefined') {
      return { success: false, error: "QR code recognition library not loaded" };
    }
    
    // Perform QR code scanning
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    console.log('[QR Reader] QR scan result:', code);
    
    if (code) {
      return { success: true, data: code.data };
    } else {
      return { success: false, error: "No QR code detected. Ensure the image is clear and complete" };
    }
  } catch (error) {
    console.error('[QR Reader] Scan error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} The escaped HTML string
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[QR Reader] Message received:', request);
  
  if (request.action === "scanQRCode") {
    // Handle error from background script
    if (request.error) {
      showResult({ success: false, error: request.error });
      return;
    }
    
    console.log('[QR Reader] Scanning image data...');
    scanQRCodeFromDataUrl(request.imageDataUrl)
      .then(result => {
        console.log('[QR Reader] Scan complete:', result);
        showResult(result);
      })
      .catch(err => {
        console.error('[QR Reader] Scan failed:', err);
        showResult({ success: false, error: err.message });
      });
  }
});
