The message branch:

```js
if (latestOutputItem?.type === "message") {
  console.log(turnResponse.output_text);
  return;
}
```

Use `return` (not `break`) because `runAgent` is an async function. Returning exits the whole function cleanly.
