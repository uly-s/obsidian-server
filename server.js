import express, { json} from 'express';
import cors from 'cors';
import * as fs from 'fs';
//
// DEAD SIMPLE VERIFY FILE - OPEN, WRITE, SAVE
//
// HAVE A COUPLE CONVENIENT FUNCTIONS FOR IT
// IN FUTURE WILL HAVE TO HAVE SYNC/ASYNC CORRECTLY
//

// FILES
const loadBookmarks = () => {
  return JSON.parse(fs.readFileSync("bookmarks.json"));
}

const saveBookMarks = () => {
  fs.writeFileSync("bookmarks.json", JSON.stringify(bookmarks));
}

let bookmarks = loadBookmarks();
let history = JSON.parse(fs.readFileSync("history.json", 'utf8'));

// SERVER
const app = express();
app.use(json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: 'chrome-extension://cddgpmkekjdnlghjcfhjpciifnjioceb',
  methods: ['POST'],
}));

app.post('/sync', (req, res) => {
  const data = req.body;
  handle(data);
  res.sendStatus(200);
  console.log(data);
});


app.listen(3000, async () => {
    console.log('Server listening on port 3000');
}); 

export async function listen() {
  return new Promise((resolve, reject) => {
    app.listen(3000, async () => {
    console.log('Server listening on port 3000');
    resolve();
    }); 
  });
}

// HANDLE
function handle(data) {
  // COUNT
  const count = (object) => {
    return Object.keys(object).length;
  }
  console.log(data);
  if(count(data.bookmarks) >= 1) {
    bookmarks = loadBookmarks();
    if (data.op === 'insert') {
      insertBookmark(bookmarks, data.bookmarks.bookmark);
    }
    else if(data.op === 'remove') {
      removeBookmark(bookmarks, data.bookmarks.bookmark);
    }
    else { // === move
      moveBookmark(bookmarks, data.bookmarks.id, data.bookmarks.moveInfo)
    }
    saveBookMarks();
  }
  else if(count(data.history) >= 1) {
    history = JSON.parse(fs.readFileSync("history.json", 'utf8'));
    if (data.op === 'append') {
      history.push(data.history.entry)
    }
    fs.writeFileSync("history.json", JSON.stringify(history));
  }
  else {
    console.log('wut');
  }
      
}


/*
function insertBookmark(newBookmark)
{
  const _insert = (root, newBookmark) => {
    if (root.id === newBookmark.parentId) {
      root.children = root.children || [];
      root.children.splice(newBookmark.index, 1, newBookmark);
      return true;
    }
    
    
    if (Array.isArray(root.children)) {
      for (let child of root.children) {
        if (_insert(child, newBookmark)) {
          return true;
        }
      }
    }
    
    return false;
  }

  let i = 0;
  while(_insert(bookmarks[i], newBookmark)) { i = i+1 }
}*/

//
// BADLY NEED A 'CONTAINS' METHOD TO VERIFY OPS
// 
// ALSO MIGHT JUST BE WORTH A SHOT TURNING OVER THE FILE
// TO THE OPEN AI PYTHON INTERPRETER, YOU NEVER KNOW.

// OPS

// INSERT
/*
function insertBookmark(root, newBookmark) {
  if (root.id === newBookmark.parentId) {
    root.children = root.children || [];
    root.children.splice(newBookmark.index, 0, newBookmark);
    return true;
  }
  
  if (Array.isArray(root.children)) {
    for (let child of root.children) {
      if (insertBookmark(child, newBookmark)) {
        return true;
      }
    }
  }
  
  return false;
}*/

// REMOVE
function removeBookmark(root, bookmarkToRemove) {
  if (Array.isArray(root.children)) {
    for (let i = 0; i < root.children.length; i++) {
      if (root.children[i].id === bookmarkToRemove.id) {
        root.children.splice(i, 1);
        return true;
      }
    }
    for (let child of root.children) {
      if (removeBookmark(child, bookmarkToRemove)) {
        return true;
      }
    }
  }
  return false;
}

// MOVE
function moveBookmark(root, id, moveInfo) {
  // TODO
}

// for history append / delete is fine, itll be 99% append anyway
// would evantually need (sooner maybe) delete oldest history, would almost certainly be fine to keep only the last year or month etc.


function insertBookmark(tree, bookmark, i) {
  if (tree.id == bookmark.parentId) {
    tree.children.push(bookmark);
  }
  else if (tree.hasOwnProperty('children') && i < tree.children.length) {
    insertBookmark(tree.children[i], bookmark, i+1)
  }
  else {
    return;
  }

}

/*
let newmark = {
  "dateAdded": 1697212339515,
  "id": "2147",
  "index": 544,
  "parentId": "1",
  "title": "Executing shell commands from Node.js",
  "url": "https://2ality.com/2022/07/nodejs-child-process.html"
};*/

//
// Would really like to refactor as bookmarks.insert()... history.append etc
//

