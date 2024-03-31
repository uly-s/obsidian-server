## Modularity
- Keep and make explicit the server/file sync as a module seperate from the obsidian plugin
- this will entail a third repo
- borrow from https://github.com/joelseq/obsidian-linkstowr

## Plugin
### Specific
- INITIALIZE command, downloads the two (so far) initial files and sets their location

### Front End

- THE PLAN -> ADAPT LINKSTOWR CODE TO SET BOOKMARKS AS HEADERS IN ONE NOTE, LETTING THEM BE LINKED TO INDIVIDUALLY IN OTHER NOTES.

- need place in vault to store .json files (with setting in panel)
- need views for bookmarks / history
- ability to reference / link bookmarks in notes
- same with folder of bookmarks (treat like another tree / natural obsidian structure?)
- embed / download bookmarks / links
- have as collapsible/modal? Like a 'works cited' or 'references' panel.
- I would personally really like to be able to not just assign a folder to a note/folder but tie that together with projects/workspaces
    not as a full project management thing but it would be really nice to filter history according to what 'project'/note/folder was open at the 
    time etc. The idea is to tie the browser data and obsidian data together into one package
    add in workspaces later and you have a comprehensive obsidian/browser solution

### Back End
- need initial sync / resync buttons (or just a command)
- need better setting of paths/file locations
- fix that janky spawn command so it can work without node.js (express async)
- redo interfaces to use bookmark.operation pattern
- WHEN OPENING FILE IN PLUGIN DIR OBSIDIAN CAN'T FIND BOOKMARKS FILE, DIFFERENT CONTEXT OR SOMETHING.
- Possibly copies of each file, 1 in plugin 1 in vault, with 1 in vault being sanitized and ready for searching etc

## Bookmarks
- interface
- move operation
- update
- display in ui as {title - date added - url}

## History
- delete entry
- reference by range?

## Tabs/Workspaces

## (Distant) Browser Actions

