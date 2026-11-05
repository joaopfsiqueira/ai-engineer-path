Check the item's `type` property. It tells you what kind of output this is.

Two values matter here: `"message"` and `"function_call"`. One means the model is done and has an answer for the user. The other means it wants something from your app before it can finish.

What should each case do with the loop: return, or keep going?
