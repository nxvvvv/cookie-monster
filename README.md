# Cookie Monster

A cross-platform browser extension for securely transferring cookies between different browsers.

![Cookie Monster logo](chromium/icons/icon128.png)

## 🍪 Overview

Cookie Monster allows you to securely export cookies from one browser and import them into another. It's designed to work across multiple browser platforms including Chrome, Firefox, Edge, Opera, and other Chromium-based browsers.

## ✨ Features

- **Cross-Browser Compatibility**: Transfer cookies between Chrome, Firefox, and other browsers
- **End-to-End Encryption**: All exported cookies are encrypted with AES-256 using your provided password
- **Multiple Export Options**: Save as file or copy to clipboard
- **Multiple Import Options**: Import from file or paste encrypted data
- **Detailed Import Reports**: See exactly which cookies were imported successfully or failed
- **User-Friendly Interface**: Simple and intuitive design for easy use

## 📋 How to Use

### Exporting Cookies
1. Click the Cookie Monster icon in your browser toolbar
2. Click "Export Cookies"
3. Enter an encryption password when prompted
4. Choose whether to save as a file or copy to clipboard

### Importing Cookies
1. Click the Cookie Monster icon in your browser toolbar
2. Click "Import Cookies"
3. Choose to import from file or paste the encrypted data
4. Enter the encryption password you used when exporting
5. Review the import results

> **Note:** Due to [Firefox security limitations](https://bugzilla.mozilla.org/show_bug.cgi?id=1292701), importing cookies from a file is not supported in Firefox. This is because Firefox doesn't allow extensions direct access to the file system. Instead, please use the clipboard method for importing cookies in Firefox.

## 🔒 Privacy & Security

- All cookie data is encrypted using AES-256 encryption before leaving your browser
- Your encryption password is never stored or transmitted
- The extension works entirely offline and doesn't send any data to remote servers

### Building from Source
1. Clone this repository
2. Make any desired changes
3. Load the extension in your browser using the installation instructions above

## 📄 License

This project is licensed under the [AGPL-3.0 License](https://github.com/nxvvvv/cookie-monster/blob/main/LICENSE).

## 🙏 Acknowledgements

- Cookie Monster icon from [Clipart Library](https://clipart-library.com/clipart/cookie-monster-clipart-5.htm)
- This project was created to fill the gap in cross-browser cookie transfer tools

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request