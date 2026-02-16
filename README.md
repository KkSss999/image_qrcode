# QR Code Reader Browser Extension

A browser extension that allows users to scan QR codes from images on any webpage by right-clicking.

## Features

- Right-click on any image to scan QR codes
- Popup displays the decoded QR code content
- Works on all websites including local files
- Clean and minimal UI design
- No data collection or external requests

## Installation

### Microsoft Edge

1. Open Edge browser and navigate to `edge://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the project folder `xxx\image_qrcode`
5. Installation complete!

### Google Chrome

1. Open Chrome browser and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the project folder
5. Installation complete!

## Usage

1. Find an image containing a QR code on any webpage
2. Right-click on the image
3. Select "Scan QR Code" from the context menu
4. A popup will display the decoded content
5. Click anywhere outside the popup or press the close button to dismiss

## Project Structure

```
image_qrcode/
├── manifest.json      # Extension configuration file
├── background.js      # Background service worker for context menu
├── content.js         # Content script for QR code scanning
├── popup.html         # Extension popup page
├── test.html          # Test page for development
├── test-server.py     # Local test server script
├── qrtest.png         # Test QR code image (Please bring your own)
├── lib/
│   └── jsQR.min.js   # QR code recognition library
└── icons/
    └── icon.svg       # Extension icon
```

## Technical Stack

- **jsQR**: Pure JavaScript QR code recognition library
- **Manifest V3**: Latest Chrome extension API
- **Vanilla JavaScript**: No framework dependencies

## Development

### Running the Test Server

```bash
python test-server.py
```

This will start a local server at `http://localhost:8000/test.html` for testing the extension.

### Debugging

1. Open the extension popup to view popup console logs
2. Right-click on any webpage and select "Inspect" to view content script logs
3. Navigate to `chrome://extensions/` or `edge://extensions/` and click "Inspect views: background page" for background script logs

## Browser Compatibility

- Chrome 88+
- Edge 88+
- Other Chromium-based browsers

## License

MIT License

## Credits

- [jsQR](https://github.com/cozmo/jsQR) - QR code reading library
