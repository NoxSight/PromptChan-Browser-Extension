// Chat.qwen.ai content script - simplified config loader
(function() {
  // Set config for injector
  window.INJECTOR_CONFIG = {
    siteName: 'Qwen.AI',
    hostname: 'chat.qwen.ai',
    targetSelector: '#chat-input'
  };
  
  console.log('Qwen.AI config loaded:', window.INJECTOR_CONFIG);
})();