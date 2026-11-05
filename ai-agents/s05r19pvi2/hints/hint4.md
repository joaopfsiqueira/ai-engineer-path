Your loop needs two outcomes:

- `message`: print the final text and leave `runAgent`
- `function_call`: log the tool name, then continue

When this works, expect the model to keep requesting
`get_open_source_news` until `maxTurns` is hit.

That is expected for now. The next lesson closes
the gap by actually dispatching the tool.
