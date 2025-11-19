// Background service worker for context menu handling
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item
  chrome.contextMenus.create({
    id: 'show-promptchan-sidebar',
    title: 'Show Promptchan Sidebar',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'show-promptchan-sidebar' && tab) {
    // Check if tab is on supported site
    const supportedHosts = [
      'chat.z.ai',
      'chat.qwen.ai',
      'chatgpt.com',
      'gemini.google.com'
    ];
    
    if (supportedHosts.some(host => tab.url && tab.url.includes(host))) {
      // Send message to content script
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_SIDEBAR'
      });
    } else {
      // Show notification for unsupported site
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png', // Add icon later if needed
        title: 'Promptchan Sidebar',
        message: 'Please use on supported AI chat sites (chat.z.ai, chat.qwen.ai, chatgpt.com, gemini.google.com)'
      });
    }
  }
});