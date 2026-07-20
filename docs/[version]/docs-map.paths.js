// Warning, those md files don't update on vitepress build in development mode.
// You need to restart the server to see the changes.
//
// Renders the generated docs/public/<version>/docs-map.md as an HTML page at
// /<version>/docs-map.html. Run `yarn generate-docs-map all` first.

import fs from 'fs'
import path from 'path'

export default {
  paths() {
    const __dirname = path.dirname(new URL(import.meta.url).pathname)
    const publicDir = path.resolve(__dirname, '../public')

    return fs.readdirSync(publicDir)
      .filter(version => fs.existsSync(path.join(publicDir, version, 'docs-map.md')))
      .map(version => ({
        params: { version },
        content: fs.readFileSync(path.join(publicDir, version, 'docs-map.md'), 'utf-8')
      }))
  }
}
