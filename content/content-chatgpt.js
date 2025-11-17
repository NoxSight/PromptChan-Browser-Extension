// ChatGPT content script - simplified config loader
(function() {
  // Set config for injector
  window.INJECTOR_CONFIG = {
    siteName: 'ChatGPT',
    hostname: 'chatgpt.com',
    targetSelector: '#prompt-textarea',
    isContentEditable: true
  };
  
  console.log('ChatGPT config loaded:', window.INJECTOR_CONFIG);
})();