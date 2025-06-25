// Warning, those md files don't update on vitepress build in development mode.
// You need to restart the server to see the changes.

import fs from 'fs'
import path from 'path'

export default {
  paths() {
    const editors = ["vscode", "cursor", "zed", "windsurf", "claude", "chatgpt", "gemini", "grok"]
    const versions = ["2.0", "3.0", "4.0"]

    // Get the path to the common directory
    const __dirname = path.dirname(new URL(import.meta.url).pathname)
    const commonDir = path.resolve(__dirname, '../../common/llm-support')

    const paths = []

    // Generate paths for each editor and version combination
    editors.forEach(editor => {
      const markdownPath = path.join(commonDir, `${editor}-common.md`)

      // Read the raw markdown content for this editor
      let content = ''

      try {
        content = fs.readFileSync(markdownPath, 'utf-8')
      } catch (error) {
        console.error(`Error reading ${editor}-common.md:`, error)
        content = 'Error loading content'
      }

      // Add entries for all versions for this editor
      versions.forEach(version => {
        paths.push({
          params: { version, editor },
          content
        })
      })
    })

    return paths
  }
}
