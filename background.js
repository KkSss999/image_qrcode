// Initialize context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scanQRCode",
    title: "Scan QR Code",
    contexts: ["image"]
  });
});

// Handle context menu click events
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('[QR Reader] Menu clicked, image:', info.srcUrl);
  
  if (info.menuItemId === "scanQRCode") {
    // Fetch the image as a blob
    fetch(info.srcUrl)
      .then(response => response.blob())
      .then(blob => {
        // Convert blob to data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          // Send image data to content script for scanning
          chrome.tabs.sendMessage(tab.id, {
            action: "scanQRCode",
            imageDataUrl: reader.result
          });
        };
        reader.onerror = () => {
          // Handle file read error
          chrome.tabs.sendMessage(tab.id, {
            action: "scanQRCode",
            error: "Failed to read image"
          });
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => {
        // Handle fetch error
        chrome.tabs.sendMessage(tab.id, {
          action: "scanQRCode",
          error: err.message
        });
      });
  }
});
