const fs = require("fs");
const path = require("path");
const { compiler } = require("./the-super-tiny-compiler.js");

/**
 * FINALLY! We'll create our `compiler` function. Here we will link together
 * every part of the pipeline.
 *
 *   1. input  => tokenizer   => tokens
 *   2. tokens => parser      => ast
 *   3. ast    => transformer => newAst
 *   4. newAst => generator   => output
 */

const sourceCode = fs.readFileSync(
  path.resolve(__dirname, "./source.code"),
  "utf-8"
);

const newSourceCode = compiler(sourceCode);

console.debug("sourceCode:   ", sourceCode);
console.debug("~~~ 代码转换成功 ⬇️ ⬇️ ⬇️  ~~~");
console.debug("newSourceCode:", newSourceCode);

fs.writeFileSync(
  path.resolve(__dirname, "./source.code.new"),
  newSourceCode,
  "utf-8"
);
