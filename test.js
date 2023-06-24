const fs = require("fs");
const { tokenizer, parser } = require("./the-super-tiny-compiler.js");

const sourceCode = fs.readFileSync("./source.code", "utf-8");

console.debug("sourceCode:", sourceCode);

const tokens = tokenizer(sourceCode);

console.debug("tokens:", tokens);

const ast = parser(tokens);

console.debug("ast:", JSON.stringify(ast, null, 4));
