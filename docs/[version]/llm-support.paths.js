// Warning, those md files don't update on vitepress build in development mode.
// You need to restart the server to see the changes.

export default {
  paths() {
    return [
      { params: { version: '2.0' }},
      { params: { version: '3.0' }},
      { params: { version: '4.0' }}
    ]
  }
}