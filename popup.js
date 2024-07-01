document.addEventListener('DOMContentLoaded', function () {
    loadBookmarks();
    document.getElementById('createFolderButton').addEventListener('click', createFolder);
});

// Function to load bookmarks
function loadBookmarks() {
    chrome.bookmarks.getTree(function (bookmarksTree) {
        var bookmarks = findBookmarks(bookmarksTree);
        displayBookmarks(bookmarks);
    });
}

// Recursive function to find all bookmarks and folders
function findBookmarks(bookmarksTree) {
    var bookmarks = [];
    bookmarksTree.forEach(function (node) {
        if (node.children) {
            bookmarks.push({ id: node.id, title: node.title, children: true });
            bookmarks = bookmarks.concat(findBookmarks(node.children));
        } else if (node.url) {
            bookmarks.push({ id: node.id, title: node.title, url: node.url, parentId: node.parentId });
        }
    });
    return bookmarks;
}

// Function to display bookmarks and folders in the popup
function displayBookmarks(bookmarks) {
    var bookmarkList = document.getElementById('bookmarkList');
    bookmarkList.innerHTML = '';

    bookmarks.forEach(function (bookmark) {
        var li = document.createElement('li');
        li.textContent = bookmark.title;

        if (bookmark.children) {
            li.style.fontWeight = 'bold';
        } else {
            var moveButton = document.createElement('button');
            moveButton.textContent = 'Move';
            moveButton.addEventListener('click', function () {
                openFolderModal(bookmark.id);
            });

            var deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function () {
                openDeleteFolderModal(bookmark.id);
            });

            li.appendChild(moveButton);
            li.appendChild(deleteButton);
        }

        bookmarkList.appendChild(li);
    });
}

// Function to open the folder selection modal for move operation
function openFolderModal(bookmarkId) {
    // Retrieve all folders and populate the modal
    chrome.bookmarks.getTree(function (bookmarksTree) {
        var folders = findFolders(bookmarksTree);
        populateFolderOptions(folders, bookmarkId);
    });

    var modal = document.getElementById('folderModal');
    modal.style.display = 'block';

    // Close modal when clicking on the close button
    var closeBtn = document.getElementsByClassName('close')[0];
    closeBtn.onclick = function () {
        modal.style.display = 'none';
    };

    // Move bookmark when clicking on the move button in the modal
    var moveBookmarkBtn = document.getElementById('moveBookmarkBtn');
    moveBookmarkBtn.onclick = function () {
        var folderId = document.querySelector('input[name="folderOption"]:checked').value;
        moveBookmark(bookmarkId, folderId);
        modal.style.display = 'none';
    };
}

// Function to open the delete folder confirmation modal
function openDeleteFolderModal(folderId) {
    var modal = document.getElementById('deleteFolderModal');
    modal.style.display = 'block';

    // Close modal when clicking on the close button
    var closeBtn = document.getElementsByClassName('close')[1];
    closeBtn.onclick = function () {
        modal.style.display = 'none';
    };

    // Delete folder when clicking on the delete button in the modal
    var deleteFolderBtn = document.getElementById('deleteFolderBtn');
    deleteFolderBtn.onclick = function () {
        deleteFolder(folderId);
        modal.style.display = 'none';
    };
}

// Function to find all folders recursively
function findFolders(bookmarksTree) {
    var folders = [];
    bookmarksTree.forEach(function (node) {
        if (node.children) {
            folders.push({ id: node.id, title: node.title });
            folders = folders.concat(findFolders(node.children));
        }
    });
    return folders;
}

// Function to populate the folder options in the move modal
function populateFolderOptions(folders, currentBookmarkId) {
    var folderOptions = document.getElementById('folderOptions');
    folderOptions.innerHTML = '';

    folders.forEach(function (folder) {
        var li = document.createElement('li');
        var label = document.createElement('label');
        label.textContent = folder.title;
        var radioButton = document.createElement('input');
        radioButton.type = 'radio';
        radioButton.name = 'folderOption';
        radioButton.value = folder.id;
        radioButton.required = true;

        label.appendChild(radioButton);
        li.appendChild(label);
        folderOptions.appendChild(li);
    });

    // Preselect the folder containing the current bookmark
    var currentBookmark = folders.find(function (folder) {
        return folder.id === currentBookmarkId;
    });

    if (currentBookmark) {
        var radioBtn = document.querySelector('input[value="' + currentBookmark.id + '"]');
        if (radioBtn) {
            radioBtn.checked = true;
        }
    }
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

// Function to delete a folder and move all bookmarks inside it to their original location
function deleteFolder(folderId) {
    chrome.bookmarks.getChildren(folderId, function (children) {
        var promises = [];
        children.forEach(function (child) {
            promises.push(new Promise(function (resolve, reject) {
                chrome.bookmarks.move(child.id, { 'parentId': child.parentId }, function () {
                    console.log('Moved bookmark:', child.id);
                    resolve();
                });
            }));
        });

        Promise.all(promises).then(function () {
            chrome.bookmarks.removeTree(folderId, function () {
                console.log('Folder deleted:', folderId);
                loadBookmarks();
            });
        });
    });
}

// Function to move a bookmark to a specified folder
function moveBookmark(bookmarkId, folderId) {
    chrome.bookmarks.move(bookmarkId, { 'parentId': folderId }, function (movedBookmark) {
        console.log('Bookmark moved:', movedBookmark);
        loadBookmarks();
    });
}