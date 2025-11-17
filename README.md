# Text Injector Sidebar 🚀

**This is for Hackathon Blibli 2025**

**Team**
- Ghany
- Irvine

Universal Chrome Extension for AI Chat Platforms - Inject custom text with a beautiful right sidebar!

## ✨ Features

- **4 AI Platforms Supported** - One extension, multiple sites
- **`/promptchan` Modal Trigger** - Type slash command to open
- **Beautiful Centered Modal** - Glassmorphism design with animations
- **Universal Injection** - Works with textareas AND contenteditable divs
- **Keyboard Shortcut** - `Shift + Enter` to inject
- **Auto-clear** - Input clears after injection
- **SPA Aware** - Handles dynamic content loading
- **Single Source of Truth** - Update [`injector.js`](injector.js) or [`styles.css`](styles.css) → affects ALL sites

## 🌐 Supported Sites

| Platform | Target Element | Type |
|----------|----------------|------|
| [chat.z.ai](https://chat.z.ai/) | `#chat-input` | textarea |
| [chat.qwen.ai](https://chat.qwen.ai/) | `#chat-input` | textarea |
| [chatgpt.com](https://chatgpt.com/) | `#prompt-textarea p` | contenteditable |
| [gemini.google.com](https://gemini.google.com/) | `.ql-editor` | contenteditable |

## 📁 File Structure

```
📁 ChromeExt/
├── [`manifest.json`](manifest.json) - Multi-site configuration
├── [`injector.js`](injector.js) ← SINGLE LOGIC FILE
├── [`content-zai.js`](content-zai.js) ← Z.ai config (3 lines)
├── [`content-qwenai.js`](content-qwenai.js) ← Qwen.ai config (3 lines)
├── [`content-chatgpt.js`](content-chatgpt.js) ← ChatGPT config (3 lines)
├── [`content-gemini.js`](content-gemini.js) ← Gemini config (3 lines)
└── [`styles.css`](styles.css) ← Single styling file
```

## 🚀 Quick Start

1. **Download** this folder
2. Open `chrome://extensions/`
3. **Enable Developer mode** (top right)
4. Click **"Load unpacked"**
5. Select this `ChromeExt` folder
6. **Done!** Visit any supported site

## 🎮 Usage

1. **Type `/promptchan`** in any chat input field
2. **Promptchan Modal** appears automatically (centered)
3. Type your text in the modal textarea
4. Click **"Inject Text"** or press `Shift + Enter`
5. Text appears in chat input + modal closes! ✨

## 🛠 Adding New Sites

**Just 3 lines + manifest update:**

```js
// content-newsite.js
window.INJECTOR_CONFIG = {
  siteName: 'NewSite',
  hostname: 'newsite.com',
  targetSelector: '#input-selector',
  isContentEditable: true // or false
};
```

**Scalable architecture** - No code duplication!

## 🔧 Customization

- **Colors/Design**: Edit [`styles.css`](styles.css)
- **Logic/Features**: Edit [`injector.js`](injector.js)
- **New Sites**: Add config file + manifest entry

**Changes apply to ALL sites instantly!**

## 🎨 Design

- **Glassmorphism** - Backdrop blur + transparency
- **Gradient header** - Purple theme
- **Explicit colors** - `#1a1a1a` dark text
- **Hover animations** - Smooth transitions
- **Responsive** - Mobile friendly

## 🐛 Troubleshooting

1. **No sidebar?** Reload extension + check Console (F12)
2. **Console logs** show config loading + injection status
3. **Hard refresh** site (`Ctrl+F5`) if SPA issues

## 📄 License

MIT License - Use freely!

---
**Made with ❤️ for AI power users**