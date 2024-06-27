document.addEventListener('DOMContentLoaded', function () {
    loadBookmarks();
});

// Function to load bookmarks
function loadBookmarks() {
    chrome.bookmarks.getTree(function (bookmarksTree) {
        var bookmarks = findBookmarks(bookmarksTree);
        displayBookmarks(bookmarks);
    });
}

// Recursive function to find all bookmarks
function findBookmarks(bookmarksTree) {
    var bookmarks = [];
    bookmarksTree.forEach(function (node) {
        if (node.children) {
            bookmarks = bookmarks.concat(findBookmarks(node.children));
        } else if (node.url) {
            bookmarks.push({ id: node.id, title: node.title, url: node.url });
        }
    });
    return bookmarks;
}

// Function to display bookmarks in the popup
function displayBookmarks(bookmarks) {
    var bookmarkList = document.getElementById('bookmarkList');
    bookmarkList.innerHTML = '';
    bookmarks.forEach(function (bookmark) {
        var li = document.createElement('li');
        li.textContent = bookmark.title;
        
        var deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function () {
            deleteBookmark(bookmark.id);
        };

        li.appendChild(deleteButton);
        bookmarkList.appendChild(li);
    });
}

// Function to create a new folder
function createFolder() {
    var folderName = document.getElementById('folderName').value;
    if (folderName.trim() === '') {
        alert('Please enter a folder name.');
        return;
    }

    chrome.bookmarks.create({ 'title': folderName }, function (folder) {
        console.log('Folder created:', folder);
        loadBookmarks();
    });
}

// Function to delete a bookmark
function deleteBookmark(bookmarkId) {
    chrome.bookmarks.remove(bookmarkId, function () {
        console.log('Bookmark deleted:', bookmarkId);
        loadBookmarks();
    });
}