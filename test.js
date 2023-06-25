const fs = require("fs");
const {
  tokenizer,
  parser,
  traverser,
} = require("./the-super-tiny-compiler.js");

const sourceCode = fs.readFileSync("./source.code", "utf-8");

console.debug("sourceCode:", sourceCode);

const tokens = tokenizer(sourceCode);

console.debug("tokens:", tokens);

const ast = parser(tokens);

console.debug("ast:", JSON.stringify(ast, null, 4));

traverser(ast, {
  Program: {
    enter: (node, parent) => {
      console.debug("enter", node, parent);
    },
    exit: (node, parent) => {
      console.debug("exit", node, parent);
    },
  },
  CallExpression: {
    enter: (node, parent) => {
      console.debug("CallExpressionenter", node, parent);
    },
    exit: (node, parent) => {
      console.debug("CallExpressionexit", node, parent);
    },
  },
});
