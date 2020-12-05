const efrt = require("efrt");
const fs = require("fs");
const path = require("path");
const wordListPath = require("word-list");
const wordArray = fs.readFileSync(wordListPath, "utf8").split("\n");
const compressed = efrt.pack(wordArray);
fs.writeFileSync(path.join(__dirname, "../src/words.txt"), compressed);
