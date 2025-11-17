// Chat.z.ai content script - simplified config loader
(function() {
  // Set config for injector
  window.INJECTOR_CONFIG = {
    siteName: 'Z.AI',
    hostname: 'chat.z.ai',
    targetSelector: '#chat-input'
  };
  
  console.log('Z.AI config loaded:', window.INJECTOR_CONFIG);
})();