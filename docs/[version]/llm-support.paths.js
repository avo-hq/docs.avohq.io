// Warning, those md files don't update on vitepress build in development mode.
// You need to restart the server to see the changes.

export default {
  paths() {
    return [
      // 4.0 moved to /4.0/agentic-engineering.html#code-editors-and-llm-setup
      { params: { version: '2.0' }},
      { params: { version: '3.0' }}
    ]
  }
}