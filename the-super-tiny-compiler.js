// *
//  *                  LISP                      C
//  *
//  *   2 + 2          (add 2 2)                 add(2, 2)
//  *   4 - 2          (subtract 4 2)            subtract(4, 2)
//  *   2 + (4 - 2)    (add 2 (subtract 4 2))    add(2, subtract(4, 2))
//  *

// NOTE: Lexical Analysis tokenizer
// NOTE: Syntactic Analysis
// NOTE: Parsing Tokens => Abstract Syntax Tree
// NOTE: Transformation AST => AST
// NOTE: Code Generation AST => code

// 2 + (4 - 2)
// (add 2 (subtract 4 2))   =>   [{ type: 'paren', value: '(' }, ...]

// 1. input  => tokenizer   => tokens

function tokenizer(input) {
  let current = 0;
  let tokens = [];

  while (current < input.length) {
    let char = input[current];

    if (char === "(") {
      tokens.push({ type: "paren", value: "(" });
      current++;
      continue;
    }

    if (char === ")") {
      tokens.push({ type: "paren", value: ")" });
      current++;
      continue;
    }

    let REG_WHITE_SPACE = /\s/;
    if (REG_WHITE_SPACE.test(char)) {
      current++;
      continue;
    }

    let REG_NUMBERS = /[0-9]/;
    if (REG_NUMBERS.test(char)) {
      let value = "";
      while (REG_NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: "number", value });
      continue;
    }

    if (char === '"') {
      let value = "";
      char = input[++current]; // skip the first  quotes (")
      while (char !== '"') {
        value += char;
        char = input[++current];
      }
      char = input[++current];
      tokens.push({ type: "string", value });
      continue;
    }

    // if (char === "+") {
    //   tokens.push({ type: "name", value: "add" });
    //   current++;
    //   continue;
    // }

    // if (char === "-") {
    //   tokens.push({ type: "name", value: "subtract" });
    //   current++;
    //   continue;
    // }

    // if (char === ";") {
    //   current++;
    //   continue;
    // }

    let REG_LETTERS = /[a-z]/i;
    if (REG_LETTERS.test(char)) {
      let value = "";
      while (REG_LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: "name", value });
      continue;
    }

    throw new TypeError("I dont know what this character is: " + char);
  }
  return tokens;
}

// 2. tokens => parser  => ast
function parser(tokens) {
  let current = 0;
  function walk() {
    let token = tokens[current]; // 获取当前token

    if (token.type === "number") {
      current++;
      return {
        type: "NumberLiteral",
        value: token.value,
      };
    }

    if (token.type === "string") {
      current++;
      return {
        type: "StringLiteral",
        value: token.value,
      };
    }

    if (token.type === "paren" && token.value === "(") {
      token = tokens[++current]; // 获取下一个非括号内容token(操作符)

      let node = {
        type: "CallExpression",
        name: token.value, // 保存token的值(操作符)
        params: [],
      };

      token = tokens[++current]; // 再继续获取下一个非括号内容token
      // 1. 如果不是括号，那么把值继续往params塞
      // 2. 如果是括号，并且不是右括号，继续塞值
      while (
        token.type !== "paren" ||
        (token.type === "paren" && token.value !== ")")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }

    throw new TypeError(token.type);
  }

  let ast = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

// 3. ast => transformer => newAst
function traverser(ast, visitor) {}

function transformer(ast) {}

// 4. newAst => generator   => output
function codeGenerator(node) {}

/**
 * FINALLY! We'll create our `compiler` function. Here we will link together
 * every part of the pipeline.
 *
 *   1. input  => tokenizer   => tokens
 *   2. tokens => parser      => ast
 *   3. ast    => transformer => newAst
 *   4. newAst => generator   => output
 */
function compiler(input) {}

module.exports = {
  tokenizer,
  parser,
  traverser,
  transformer,
  codeGenerator,
  compiler,
};
