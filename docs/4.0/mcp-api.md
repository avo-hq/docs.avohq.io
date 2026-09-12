---
license: addon
addon_link: https://avohq.io/addons/mcp-server
addon: avo-mcp_server
betaStatus: "Beta"
outline: [2, 3]
guide: ./mcp.html
prev:
  text: "MCP Server"
  link: "./mcp.html"
next: false
---

# MCP Server reference

Per-item reference for the `avo-mcp_server` add-on. For installation, connecting a client, and worked examples, see the [MCP Server guide](./mcp.html).

All options live under `config.mcp_server` inside `Avo.configure`, in `config/initializers/avo.rb`:

```ruby
Avo.configure do |config|
  config.mcp_server.enabled = true
  config.mcp_server.resource_identifier = "https://app.example.com/avo/mcp"
  config.mcp_server.tool_calls_per_minute = 300
  config.mcp_server.connection_log = true
  config.mcp_server.connection_log_size = 500
end
```

## Configuration

<Option name="`enabled`" headingSize="3">

Turns the server on. While `false`, every protocol endpoint and the consent screen answer `404` and no new connection can be authorized. The MCP connections resource belongs to the panel rather than to the server, so it stays available — existing connections can be reviewed and revoked while the server is off.

```ruby
config.mcp_server.enabled = true
```

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`resource_identifier`" headingSize="3">

The public URL of the MCP server — the string an admin pastes into their AI client. Left unset, the address is derived per request from the origin the request arrived on plus the mount path. Once set, it is the single value read by the discovery document's `resource` field, the audience stamped on every issued token, and the audience checked on every incoming call; a request arriving at any other scheme, host, or port is answered `421 Misdirected Request`.

```ruby
config.mcp_server.resource_identifier = "https://app.example.com/avo/mcp"
```

- **Type:** `String`
- **Default:** `nil` — derived from the request origin plus the mount path
- **Validation:** raises `Avo::McpServer::ConfigurationError` at boot when its path differs from the path passed to [`mount_avo_mcp_server`](#mount_avo_mcp_server), or when it uses `http://` on a host other than `localhost` or `127.0.0.1`.

:::warning Changing it is a migration
Tokens are bound to the address they were minted under. After a change, every live connection's next call is answered `421`, and admins reconnect through the authorize page.
:::

</Option>

<Option name="`tool_calls_per_minute`" headingSize="3">

How many JSON-RPC requests one connection may make in a minute before the endpoint answers `429` with a `Retry-After` header. The counter runs through `Rails.cache`: on `:null_store` nothing is counted, and on a per-process store each worker keeps its own count.

```ruby
config.mcp_server.tool_calls_per_minute = 600
```

- **Type:** `Integer`
- **Default:** `300`
- **Values:** `nil` turns the ceiling off

</Option>

<Option name="`connection_log`" headingSize="3">

Whether the JSON-RPC endpoint records every request a connection makes — tool calls, list requests, the handshake, and the ones it refused — for the Activity card on the connection's page. Rows are written after the endpoint has rendered its answer and never fail a request.

```ruby
config.mcp_server.connection_log = false
```

- **Type:** `Boolean`
- **Default:** `true`

</Option>

<Option name="`connection_log_size`" headingSize="3">

How many log rows each connection keeps. Older rows are dropped as new ones arrive.

```ruby
config.mcp_server.connection_log_size = 2_000
```

- **Type:** `Integer`
- **Default:** `500`
- **Values:** `nil` keeps every row

</Option>

## Routing

<Option name="`mount_avo_mcp_server`">

The routing method that draws every endpoint an AI client calls. Available inside `Rails.application.routes.draw`.

```ruby
# config/routes.rb
mount_avo_mcp_server                    # JSON-RPC endpoint at /avo/mcp
mount_avo_mcp_server at: "/admin/mcp"   # moved
```

| Endpoint                       | Path                                                      | Authentication |
| ------------------------------ | --------------------------------------------------------- | -------------- |
| Protected resource metadata    | `/.well-known/oauth-protected-resource` (origin root)     | None           |
| Authorization server metadata  | `/.well-known/oauth-authorization-server` (origin root)   | None           |
| Token endpoint                 | `<mount path>/token`                                      | None           |
| Client registration (RFC 7591) | `<mount path>/register`                                   | None           |
| JSON-RPC endpoint              | `<mount path>`                                            | Bearer token   |

The discovery documents are always at the origin root, where the protocol requires them; `at:` moves only the endpoints under the mount path. The consent screen and the MCP connections resource are mounted with the panel, not here.

- **Type:** routing method
- **Values:** `at:` — the JSON-RPC endpoint's path. Default `"/avo/mcp"`.
- **Validation:** raises `Avo::McpServer::ConfigurationError` at boot when drawn inside an `authenticate` or `constraints` block, when drawn after `mount_avo` at a path under Avo's mount prefix, or when `at:` differs from the path in a pinned [`resource_identifier`](#resource_identifier).

</Option>

## Generators

<Option name="`avo:mcp_server install`">

Writes the migrations and appends the configuration block to `config/initializers/avo.rb`.

```bash
bin/rails generate avo:mcp_server install
bin/rails db:migrate
```

| Migration                         | Tables                                                                                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `create_avo_mcp_server`           | `avo_mcp_server_connections`, `avo_mcp_server_access_grants` (single-use codes), `avo_mcp_server_access_tokens` (digests), `avo_mcp_server_clients` (registered clients) |
| `create_avo_mcp_server_events`    | `avo_mcp_server_events` — the connection log                                                                                                 |

The installer is additive. A migration the app already has is skipped, and the configuration block is appended only when `config.mcp_server.enabled` appears nowhere in the initializer.

- **Values:** `--skip-avo-version` — don't print the installed Avo version

</Option>

## Tools

The nine tools a connection can call, each gated by the capability it declares. Tool names are what a client prints in its transcript and are never translated.

| Tool             | Capability    | Does                                            |
| ---------------- | ------------- | ----------------------------------------------- |
| `list_resources` | `avo:read`    | Lists the resources this panel serves           |
| `list_records`   | `avo:read`    | Pages through a resource's records              |
| `show_record`    | `avo:read`    | Opens one record in full, with its associations |
| `search_records` | `avo:read`    | Searches records by text                        |
| `list_actions`   | `avo:read`    | Lists the actions a resource registers          |
| `create_record`  | `avo:write`   | Creates a record                                |
| `update_record`  | `avo:write`   | Changes a record's fields                       |
| `delete_record`  | `avo:write`   | Deletes a record                                |
| `run_action`     | `avo:actions` | Runs one of this app's actions on records       |

### Arguments

| Tool             | Required                       | Optional                                        |
| ---------------- | ------------------------------ | ----------------------------------------------- |
| `list_resources` | —                              | —                                               |
| `list_records`   | `resource`                     | `page`, `per_page`, `sort_by`, `sort_direction` |
| `show_record`    | `resource`, `id`               | —                                               |
| `search_records` | `query`                        | `resource`, `limit`                             |
| `list_actions`   | `resource`                     | —                                               |
| `create_record`  | `resource`, `attributes`       | —                                               |
| `update_record`  | `resource`, `id`, `attributes` | —                                               |
| `delete_record`  | `resource`, `id`               | —                                               |
| `run_action`     | `resource`, `action`           | `record_ids`, `fields`                          |

- `resource` is a resource name as `list_resources` reports it (`"Post"`), never a table name. `id` is the record's primary key, as a string or an integer.
- Paging is 1-based. `per_page` defaults to `25` and is capped at `100`; `search_records`' `limit` behaves the same way, per resource searched.
- `sort_by` must name a column on the model; an unknown name is refused with `sortableColumns`. `sort_direction` is `asc` or `desc`. Left out, the resource's default sorting applies.
- `attributes` maps field names (as `list_resources` reports them) or column names to values; a `belongs_to` is written as `user` or `user_id`. Only columns a declared, visible, writable field claims are accepted; `id`, `created_at`, `updated_at`, and columns matching `password`, `token`, `secret`, or `digest` never are. A refused attribute fails the call with `fields` naming it. `update_record` changes only the attributes passed.
- `run_action` takes the `action` id from `list_actions` (the class name) and `fields` keyed by the input names it reports. A standalone action takes no `record_ids` and is refused if given any; every other action needs at least one. Every id is authorized individually, so a partly-allowed batch is refused rather than partly run.
- `show_record` returns a `belongs_to` as the record's id and title, and a `has_many` as a count plus up to 25 ids, already narrowed by the associated model's policy scope.
- `search_records` runs each resource's own `self.search` block. A resource without one is an error when named directly and is listed under `unsearchable` in an all-resource search; it never falls back to listing the resource's records.
- The MCP connections resource is excluded from every tool.

## Capabilities

The scope strings a grant is stored as. Write carries read; a per-resource grant appends the resource's name.

| Capability   | Scope string  | Per-resource form | Selected at consent |
| ------------ | ------------- | ----------------- | ------------------- |
| Read         | `avo:read`    | `avo:read:Post`   | Yes                 |
| Read & write | `avo:write`   | `avo:write:Post`  | No                  |
| Run actions  | `avo:actions` | —                 | No                  |

Run actions has no per-resource form: over a narrowed read it applies to the resources the read grant names. A connection's capabilities are fixed when it is created; authorizing the client again is the only way to widen them.

## Error codes

Refusals are JSON-RPC errors carrying a numeric `code`, a message, and a `data` object.

| Code     | Constant                    | Means                                                             | `data` carries                                                              |
| -------- | --------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `-32000` | `CAPABILITY_REQUIRED`       | The connection was never granted the capability the tool requires | `requiredCapability`, `grantedCapabilities`                                 |
| `-32001` | `UNAUTHORIZED`              | Capability held; the owning admin's policy said no                | `action`, `subject`                                                         |
| `-32002` | `AUTHORIZATION_UNAVAILABLE` | Authorization isn't licensed, so nothing was attempted            | —                                                                           |
| `-32003` | `VALIDATION_FAILED`         | The model refused a create, update, or destroy                    | `validationErrors`, `fieldErrors`, `requiredAttributes`, `optionalAttributes`, `missingRequiredAttributes` |
| `-32004` | `SEARCH_UNAVAILABLE`        | The resource has no `self.search` configured                      | `resource`                                                                  |
| `-32005` | `UNSUPPORTED_RESOURCE`      | The resource is not backed by Active Record                       | `resource`                                                                  |
| `-32602` | `INVALID_PARAMS`            | Unknown tool, resource, record, or argument                       | `writableFields`, `availableActions`, `availableInputs`, or `sortableColumns`, depending on the argument |
| `-32020` | —                           | An `Mcp-Method`, `Mcp-Name`, or `Mcp-Protocol-Version` header disagrees with the body | —                                                       |
| `-32022` | —                           | A protocol revision this server doesn't implement                 | —                                                                           |

The first six are the add-on's own, in the `-32000` to `-32019` band the MCP specification leaves to implementations; the rest are the specification's.

`-32000` names what was withheld and what the connection holds, so a client can tell the admin what to re-authorize:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "This connection was not granted avo:write, which is required by delete_record.",
    "data": {
      "requiredCapability": "avo:write",
      "grantedCapabilities": ["avo:read"]
    }
  }
}
```

`-32003` is shaped for an agent that should correct its own call. `requiredAttributes` is read from the schema and the model — `NOT NULL` columns without a default, presence validators, non-optional `belongs_to` — which is what makes `missingRequiredAttributes` worth acting on:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32003,
    "message": "Post could not be saved: Title can't be blank",
    "data": {
      "validationErrors": ["Title can't be blank"],
      "fieldErrors": { "title": ["can't be blank"] },
      "requiredAttributes": ["title", "user_id"],
      "optionalAttributes": ["body", "published_at"],
      "missingRequiredAttributes": ["title"]
    }
  }
}
```

A record outside the admin's policy scope reports as `-32602`, identical to an id that never existed. A resource they may not list reports as `-32001`. A successful result carries `"resultType": "complete"`.

## Connection log

One row per request a connection makes, shown on the connection's page as the Activity card and polled from `<your-avo-path>/mcp_server/connections/:id/events`. Rows are written by the JSON-RPC endpoint after it has answered, and pruned per connection to [`connection_log_size`](#connection_log_size).

| Outcome        | Recorded when                                                                              |
| -------------- | ------------------------------------------------------------------------------------------ |
| `ok`           | The request was served                                                                     |
| `error`        | The answer was a JSON-RPC error; the row keeps its `code` and message                      |
| `tool_error`   | The tool's result carried `isError`; the row keeps its text                                |
| `refused`      | The request was refused for a malformed header before any tool ran                         |
| `rate_limited` | The connection was over [`tool_calls_per_minute`](#tool_calls_per_minute)                  |
| `rejected`     | The token no longer authenticates — expired, revoked, or on a revoked connection           |

A tool call's arguments are stored after the app's `filter_parameters` and capped at 4 KB; over that, only the keys and the size are kept. Requests that resolve to no connection — `server/discover`, or a token that names nothing — are not recorded.

## Panel classes

| Class                               | What it is                                                              |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `Avo::Resources::McpConnection`     | The MCP connections resource, at `<your-avo-path>/resources/mcp_connections` |
| `Avo::Actions::McpRevokeConnection` | The Revoke action                                                       |
| `Avo::McpServer::Connection`        | The model behind the resource. Refuses `update` and `destroy`.          |
| `Avo::McpServer::Event`             | One row of the connection log                                           |
| `Avo::McpServer::ConnectionPolicy`  | The policy **you** write; the gem ships none                            |

### Policy methods

| Method           | Decides                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `Scope#resolve`  | Which connections are listed and findable                                                                 |
| `index?`         | Whether the resource appears at all under `explicit_authorization`                                        |
| `show?`          | A connection's page — and, unless `view_activity?` is defined, its Activity card and poll endpoint        |
| `act_on?`        | The Revoke action. Asked once with the class, then per selected connection                                |
| `view_activity?` | Optional. The Activity card and its poll endpoint, in place of `show?`                                    |
| `create?`, `edit?`, `destroy?` | The corresponding controls. The model refuses edits and deletes regardless                  |

A host with an explicit `config.resources` array must add `"Avo::Resources::McpConnection"` to it. `Avo::Resources::McpConnection.visible_on_sidebar = false` in a `to_prepare` block keeps it off the sidebar.

### Translations

Every string the resource shows is translatable, in each of the nineteen languages Avo ships: field names under `avo.resource_translations.mcp_connection.fields.<field id>`, everything else under `avo.mcp_server.connections` — the Revoke action's copy, the Tools card (`.tools.*`), the Activity card (`.log.*`), and the capability titles (`.capabilities.read|write|actions`). Tool names and descriptions are never translated, and the consent screen is English throughout.

## Rate limits

| Endpoint                              | Ceiling                      | Keyed by   |
| ------------------------------------- | ---------------------------- | ---------- |
| JSON-RPC                              | [`tool_calls_per_minute`](#tool_calls_per_minute), `300` by default | Connection |
| Token                                 | `60` a minute                | IP         |
| Authorize (consent screen)            | `30` a minute                | IP         |
| Client registration                   | `10` a minute                | IP         |

Over a limit the endpoint answers `429` with a `Retry-After` header. Every counter runs through `Rails.cache`.

## Protocol

| Item                  | Value                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------- |
| MCP revision          | `2026-07-28` (the stateless lifecycle and `server/discover`), and the classic `initialize` lifecycle for clients on `2025-11-25` and earlier |
| Transport             | Streamable HTTP, JSON responses. No stdio, no event stream, no shared token             |
| Client authentication | Public clients only (`token_endpoint_auth_methods_supported: ["none"]`), PKCE required |
| Client identity       | Client ID Metadata Document, or RFC 7591 dynamic registration                          |
| Tokens                | Audience-bound to [`resource_identifier`](#resource_identifier) or the derived address; access tokens live an hour, refresh tokens rotate with family-wide revocation on reuse |
| Log filtering         | `code`, `code_verifier`, `refresh_token`, `access_token`, and `client_secret` are filtered from request logs. `_meta` is not |
