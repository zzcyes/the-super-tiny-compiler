const fs = require("fs");
const {
  tokenizer,
  parser,
  traverser,
  transformer,
  compiler,
} = require("./the-super-tiny-compiler.js");
const path = require("path");

const sourceCode = fs.readFileSync("./source.code", "utf-8");

console.debug("sourceCode:", sourceCode);

const tokens = tokenizer(sourceCode);

console.debug("tokens:", tokens);

const ast = parser(tokens);

fs.writeFileSync(
  path.resolve(__dirname, "./output/ast.json"),
  JSON.stringify(ast, null, 4)
);

console.debug("ast:", JSON.stringify(ast, null, 4));

traverser(ast, {
  CallExpression: {
    enter: (node, parent) => {
      console.debug("CallExpressionenter", node, parent);
    },
  },
  NumberLiteral: {
    enter: (node, parent) => {
      console.debug("NumberLiteral>>>>>", node, parent);
    },
  },
});

let newAst = transformer(ast);

fs.writeFileSync(
  path.resolve(__dirname, "./output/ast.new.json"),
  JSON.stringify(newAst, null, 4)
);

const newSourceCode = compiler(sourceCode);
console.debug("newSourceCode", newSourceCode);

fs.writeFileSync(
  path.resolve(__dirname, "./output/new.code.js"),
  newSourceCode,
  "utf-8"
);
