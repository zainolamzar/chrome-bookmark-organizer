// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'getBookmarks') {
        chrome.bookmarks.getTree(function (bookmarks) {
            sendResponse(bookmarks);
        });
    }
    return true; // Needed to keep the message channel open for async response
});

// Example function to listen for extension installation or update
chrome.runtime.onInstalled.addListener(function () {
    console.log('Extension installed or updated!');
});