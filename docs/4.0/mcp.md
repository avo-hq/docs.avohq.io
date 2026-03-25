---
license: add_on
betaStatus: Not yet released
outline: [2, 3]
---

# MCP (Model Context Protocol)

The `avo-mcp` gem exposes your Avo admin panel as an MCP server, allowing LLM-powered tools like Claude Desktop, Claude Code, or any MCP-compatible client to browse and manage your admin data through natural language.

## Requirements

- Avo `>= 4.0`
- Ruby `>= 3.0`
- Rails `>= 6.1`

## Installation

### 1. Add the gem

```ruby
gem "avo-mcp", source: "https://packager.dev/avo-hq/"
```

### 2. Install dependencies

```bash
bundle install
```

### 3. Configure

Add the following to your `config/initializers/avo.rb`:

```ruby
Avo::Mcp.configure do |config|
  config.enabled = true # [!code focus]
  config.token = ENV["AVO_MCP_TOKEN"] # [!code focus]
  config.mount_path = "/avo-mcp"
  config.transport = :both # :stdio, :http, or :both
  config.current_user = ->(token) { User.find_by(mcp_token: token) } # [!code focus]
end
```

## Configuration

| Option         | Default      | Description                                                                                                |
| -------------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| `enabled`      | `true`       | Enable or disable the MCP server                                                                           |
| `token`        | `nil`        | Authentication token. Falls back to `ENV["AVO_MCP_TOKEN"]` if not set. Can be a `Proc` for lazy evaluation |
| `mount_path`   | `"/avo-mcp"` | The HTTP endpoint path where the MCP server is mounted                                                     |
| `transport`    | `:both`      | Transport mode: `:stdio`, `:http`, or `:both`                                                              |
| `current_user` | `nil`        | A `Proc` that receives the token and returns a user object for authorization                               |

## Transport modes

Avo MCP supports two transport modes that can be used independently or together.

### Stdio

The stdio transport is ideal for local development with tools like Claude Desktop or Claude Code. It communicates over stdin/stdout using JSON-RPC.

Run it from your Rails app root:

```bash
bundle exec avo-mcp
```

### HTTP

The HTTP transport mounts an endpoint in your Rails app that accepts JSON-RPC requests. It supports both single JSON responses and SSE streaming.

Requests must include the authentication token:

```bash
curl -X POST http://localhost:3000/avo-mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

## Connecting to Claude Desktop

Add the following to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "avo": {
      "command": "bundle",
      "args": ["exec", "avo-mcp"],
      "cwd": "/path/to/your/rails/app"
    }
  }
}
```

## Connecting to Claude Code

Add the MCP server to your Claude Code configuration:

```json
{
  "mcpServers": {
    "avo": {
      "command": "bundle",
      "args": ["exec", "avo-mcp"],
      "cwd": "/path/to/your/rails/app"
    }
  }
}
```

Once connected, you can ask Claude questions like:

- "List all users"
- "Show me the last 10 orders sorted by created_at"
- "Search for users named John"
- "Create a new post with title 'Hello World'"
- "Run the 'Archive' action on post 42"

## Available tools

Avo MCP exposes 9 tools that cover the full range of admin operations.

### Read-only tools

| Tool             | Description                                                                   |
| ---------------- | ----------------------------------------------------------------------------- |
| `list_resources` | Discover all available Avo resources with field definitions and record counts |
| `list_records`   | List records from a resource with pagination, sorting, and filtering          |
| `show_record`    | Show a single record's full details including associations                    |
| `search_records` | Search across one or all resources using the configured search query          |
| `list_actions`   | Discover available actions for a resource                                     |

### Write tools

| Tool            | Description                                   |
| --------------- | --------------------------------------------- |
| `create_record` | Create a new record with attribute validation |
| `update_record` | Update an existing record's attributes        |
| `delete_record` | Delete a record                               |
| `run_action`    | Execute an Avo action on one or more records  |

## Authorization

Avo MCP respects your existing Avo authorization setup. Every tool checks permissions before executing:

- **Token authentication** — Requests are validated using constant-time comparison against the configured token.
- **User resolution** — The `current_user` proc maps a token to a user object. If no proc is configured, tools run without a user context.
- **Policy checks** — Each tool invokes `Avo::Services::AuthorizationService.authorize` with the resolved user, so your existing Pundit (or other) policies apply.

If a user is not authorized for an operation, the tool returns a structured error:

```json
{
  "error_type": "not_authorized",
  "action": "index",
  "message": "You are not authorized to perform this action."
}
```

## Error handling

All tools return structured error responses when something goes wrong:

| Error type         | When it occurs                                   |
| ------------------ | ------------------------------------------------ |
| `invalid_params`   | Required parameters are missing or invalid       |
| `not_found`        | The requested resource or record doesn't exist   |
| `not_authorized`   | The current user lacks permission for the action |
| `validation_error` | Record validation failed (includes field errors) |
| `internal_error`   | An unexpected error occurred                     |
