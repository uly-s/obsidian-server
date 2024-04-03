import { type } from "os";

export type Link = {
    url: string;
    title: string;
    note: string | undefined;
};

export type bookmark = {
  children: Array<bookmark>;
  dateAdded: number;
  id: string;
  index: number;
  parentId: string;
  title: string;
  url: string;
};

// history entry
export type entry = {
  id: string;
  lastVisitTime: number;
  title: string;
  typedCount: number;
  url: string;
  visitCount: number;
};

enum op {
  insert = "insert",
  remove = "remove",
  move = "move",
}

export type data = {
  op: op 
  bookmarks: Array<bookmark>;
  history: Array<entry>;
};