folderList = [
  "67ce286b-7075-4e9d-b4aa-062205e14bad/1-500/",
  "67ce286b-7075-4e9d-b4aa-062205e14bad/1001-1200/",
  "67ce286b-7075-4e9d-b4aa-062205e14bad/501-1000/",
];

const newlist = folderList.map((folder) => folder.split("/"));
console.log(newlist);
console.log(newlist[0].length);
console.log(newlist[0]);
