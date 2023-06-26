const fs = require("fs");
const path = require("path");
const { compiler } = require(path.resolve(
  __dirname,
  "../core/the-super-tiny-compiler.js"
));

/**
 * FINALLY! We'll create our `compiler` function. Here we will link together
 * every part of the pipeline.
 *
 *   1. input  => tokenizer   => tokens
 *   2. tokens => parser      => ast
 *   3. ast    => transformer => newAst
 *   4. newAst => generator   => output
 */

const input = fs.readFileSync(
  path.resolve(__dirname, "./input/code.input"),
  "utf-8"
);

const output = compiler(input);

console.debug("【input:】 ", input);
console.debug("【output】", output);
console.debug("代码转换成功～");

fs.writeFileSync(
  path.resolve(__dirname, "./output/code.output"),
  output,
  "utf-8"
);
