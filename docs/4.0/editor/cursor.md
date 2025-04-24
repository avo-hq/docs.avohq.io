# Cursor

Setup Cursor to correctly generate Avo code based on your prompt.

## Quick use

In chat window type this and Cursor will use Avo's llms.txt file to generate code.

```bash
@web https://avohq.io/llms.txt
```

## Permanent setup

1. Press ⌘ CMD+⇧ Shift+P. Or if it's Windows, press⌃ Ctrl+⇧ Shift+P.
2. Type `Add new custom docs`
3. Add this: `https://avohq.io/llms.txt`
4. Now in chat window you can type `@docs` and choose `Avo` to provide Avo's docs to Cursor.

## Project-level permanent setup

You can setup Avo's llms.txt file to your repo so Cursor can use it by default. (Read more at Cursor docs)

Run this command to save the llms.txt file to `.cursor/rules/avohq.mdc`

```bash
curl -L https://avohq.io/llms.txt --create-dirs -o .cursor/rules/avo.mdc
```
