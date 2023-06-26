const fs = require("fs");
const path = require("path");

const {
  tokenizer,
  parser,
  traverser,
  transformer,
  codeGenerator,
} = require(path.resolve(__dirname, "../core/the-super-tiny-compiler.js"));

const input = fs.readFileSync(
  path.resolve(__dirname, "./input/code.input"),
  "utf-8"
);

console.debug(">>>>>>【0. input 】>>>>>>", input);

const tokens = tokenizer(input);

console.debug(">>>>>>【1. input  => tokenizer   => tokens】>>>>>>", tokens);

const ast = parser(tokens);

fs.writeFileSync(
  path.resolve(__dirname, "./output/ast.old.json"),
  JSON.stringify(ast, null, 4)
);

console.debug(
  ">>>>>>【2. tokens => parser => ast 】>>>>>>",
  JSON.stringify(ast, null, 4)
);

traverser(ast, {
  CallExpression: {
    enter: (node, parent) => {
      console.debug(
        "【log】【traverser =》CallExpressionenter】"
        // node, parent
      );
    },
  },
  NumberLiteral: {
    enter: (node, parent) => {
      console.debug(
        "【log】【traverser =》NumberLiteral】"
        // node,
        // parent
      );
    },
  },
});

let newAst = transformer(ast);

console.debug(">>>>>>【3. ast => transformer => newAst】>>>>>>", newAst);

fs.writeFileSync(
  path.resolve(__dirname, "./output/ast.new.json"),
  JSON.stringify(newAst, null, 4)
);

const output = codeGenerator(newAst);

console.debug(">>>>>>【4. newAst => generator => output】>>>>>>", output);

console.debug("产物输出成功～");
