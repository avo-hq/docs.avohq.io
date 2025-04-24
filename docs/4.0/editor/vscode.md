# VSCode

Setup VSCode to correctly generate Avo code based on your prompt.

## Quick use

In chat window type this and VSCode will use Avo's llms.txt file to generate code.

```bash
#fetch https://avohq.io/llms.txt
```

## Project-level permanent setup

You can setup Avo's llms.txt file to your repo so Copilot can use it by default. (Read more at VSCode docs)

1. Run this command to save the llms.txt file to `.vscode/avo.md`

```bash
curl -L https://avohq.io/llms.txt --create-dirs -o .vscode/avo.md
```

2. Add this to `.vscode/settings.json`

```json
.vscode/settings.json
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "file": "./.vscode/avo.md"
    }
  ]
}
```