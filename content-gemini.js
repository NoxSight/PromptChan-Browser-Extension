// Gemini content script - simplified config loader
(function() {
  // Set config for injector
  window.INJECTOR_CONFIG = {
    siteName: 'Gemini',
    hostname: 'gemini.google.com',
    targetSelector: '.ql-editor',
    isContentEditable: true
  };
  
  console.log('Gemini config loaded:', window.INJECTOR_CONFIG);
})();