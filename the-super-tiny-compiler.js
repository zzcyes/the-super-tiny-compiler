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

      token = tokens[++current]; // 再继续获取下一个token（操作的对象参数）
      // 1. 如果不是括号，那么把值继续往params塞（参数）
      // 2. 如果是括号，并且不是右括号，继续塞值（又是一个表达式，这里会递归调用walk）
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
function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach((child) => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    // 获取到visitor的方法，然后遍历子节点的内容
    let methods = visitor[node.type];

    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;
      case "CallExpression":
        traverseArray(node.params, node);
        break;
      case "NumberLiteral":
      case "StringLiteral":
        break;
      default:
        throw new TypeError(node.type);
    }

    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  traverseNode(ast, null);
}
// (add 2 (subtract 4 2))
// (add 2 (subtract 4 2))
function transformer(ast) {
  let newAst = {
    type: "Program",
    body: [],
  };
  ast._context = newAst.body;

  traverser(ast, {
    NumberLiteral: {
      // We'll visit them on enter.
      enter(node, parent) {
        // We'll create a new node also named `NumberLiteral` that we will push to
        // the parent context.
        // parent._context 其实就是与外层 CallExpression 的属性
        /**
         * {
         *  "type":"CallExpression",
         *  "callee":"...",
         *  "arguments":"...",
         *  "_context": []
         * }
         */
        parent._context.push({
          type: "NumberLiteral",
          value: node.value,
        });
      },
    },
    // This is the same as the NumberLiteral
    // Next we have `StringLiteral`
    StringLiteral: {
      enter(node, parent) {
        // parent._context 其实就是与外层 CallExpression 的属性
        /**
         * {
         *  "type":"CallExpression",
         *  "callee":"...",
         *  "arguments":"...",
         *  "_context": []
         * }
         */
        parent._context.push({
          type: "StringLiteral",
          value: node.value,
        });
      },
    },
    CallExpression: {
      enter(node, parent) {
        // We start creating a new node `CallExpression` with a nested
        // `Identifier`.
        let expression = {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: node.name,
          },
          arguments: [],
        };

        // Next we're going to define a new context on the original
        // `CallExpression` node that will reference the `expression`'s arguments
        // so that we can push arguments.
        // 这里相当于把 ast 当前 CallExpression 节点 node 中 把当前表达式存起来
        // 方便后续使用
        console.debug("expppp", node);
        node._context = expression.arguments;

        // 这里区分是否为第一个 CallExpression
        // 如果父节点的type 不等于 CallExpression 那么，则为第一个，匹配命中
        if (parent.type !== "CallExpression") {
          // We're going to wrap our `CallExpression` node with an
          // `ExpressionStatement`. We do this because the top level
          // `CallExpression` in JavaScript are actually statements.
          // 这里就是直接创建目标 ast 中新增的节点（body 中第一个节点）
          expression = {
            type: "ExpressionStatement",
            expression: expression,
          };
        }

        // Last, we push our (possibly wrapped) `CallExpression` to the `parent`'s
        // `context`.
        // parent._context 这里就是与 body 同层的 _context,也是就是 newAst.body
        parent._context.push(expression);
      },
    },
  });
  console.debug(ast);
  return newAst;
}

// 4. newAst => generator   => output
function codeGenerator(node) {
  switch (node.type) {
    // If we have a `Program` node. We will map through each node in the `body`
    // and run them through the code generator and join them with a newline.
    case "Program":
      return node.body.map(codeGenerator).join("\n");

    // For `ExpressionStatement` we'll call the code generator on the nested
    // expression and we'll add a semicolon...
    case "ExpressionStatement":
      return (
        codeGenerator(node.expression) + ";" // << (...because we like to code the *correct* way)
      );

    // For `CallExpression` we will print the `callee`, add an open
    // parenthesis, we'll map through each node in the `arguments` array and run
    // them through the code generator, joining them with a comma, and then
    // we'll add a closing parenthesis.
    case "CallExpression":
      return (
        codeGenerator(node.callee) +
        "(" +
        node.arguments.map(codeGenerator).join(", ") +
        ")"
      );

    // For `Identifier` we'll just return the `node`'s name.
    case "Identifier":
      return node.name;

    // For `NumberLiteral` we'll just return the `node`'s value.
    case "NumberLiteral":
      return node.value;

    // For `StringLiteral` we'll add quotations around the `node`'s value.
    case "StringLiteral":
      return '"' + node.value + '"';

    // And if we haven't recognized the node, we'll throw an error.
    default:
      throw new TypeError(node.type);
  }
}

/**
 * FINALLY! We'll create our `compiler` function. Here we will link together
 * every part of the pipeline.
 *
 *   1. input  => tokenizer   => tokens
 *   2. tokens => parser      => ast
 *   3. ast    => transformer => newAst
 *   4. newAst => generator   => output
 */

function compiler(input) {
  let tokens = tokenizer(input);
  let ast = parser(tokens);
  let newAst = transformer(ast);
  let output = codeGenerator(newAst);

  // and simply return the output!
  return output;
}

module.exports = {
  tokenizer,
  parser,
  traverser,
  transformer,
  codeGenerator,
  compiler,
};
