/**
 * FINALLY! We'll create our `compiler` function. Here we will link together
 * every part of the pipeline.
 *
 *   1. input  => tokenizer   => tokens
 *   2. tokens => parser      => ast
 *   3. ast    => transformer => newAst
 *   4. newAst => generator   => output
 */


## 说明

```js
const input  =  `(add 2 (subtract 4 2))`;
const output = compiler(input); // (add 2 (subtract 4 2))
```

## 命令

- 运行测试代码：

```shell
yarn test
# or
npm test 
 ```

- 输出产物至 `/src/test/output`：
  - `ast.old.json` 代码转换前的 ast
  - `ast.new.json` 代码转化后的 ast 
  - `code.output`  转化后的代码

```shell
yarn build
# or
npm build 
```