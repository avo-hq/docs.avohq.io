---
license: addon
addon_link: https://avohq.io/addons/mcp-server
addon: avo-mcp_server
betaStatus: "Not yet released"
outline: [2, 3]
guide: ./mcp.html
prev:
  text: "MCP Server"
  link: "./mcp.html"
next: false
---

# MCP Server reference

Per-item reference for the `avo-mcp_server` add-on's public surface. For task-oriented documentation and worked examples, see the [MCP Server guide](./mcp.html).

The add-on has three initializer options, all under `config.mcp_server` inside `Avo.configure`. There is **no** `Avo::McpServer.configure` block.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.mcp_server.enabled = true
  config.mcp_server.resource_identifier = "https://app.example.com/avo/mcp"
  config.mcp_server.tool_calls_per_minute = 300
end
```

## Configuration

<Option name="`enabled`" headingSize="3">

Master switch for the whole server. While it is `false`, every protocol endpoint and the consent screen answer `404`, and no new connection can be authorized.

```ruby
config.mcp_server.enabled = true
```

The MCP connections resource belongs to the panel rather than to the server, so it stays available while the server is off — existing connections can still be reviewed and revoked during an incident.

- **Type:** `Boolean`
- **Default:** `false`

</Option>

<Option name="`resource_identifier`" headingSize="3">

The canonical, externally reachable URL of the MCP server — the same string an admin pastes into their AI client.

```ruby
config.mcp_server.resource_identifier = "https://app.example.com/avo/mcp"
```

Left unset, the address is derived per request: the origin the request arrived on, plus the mount path. Set it when the panel answers at more than one origin, or when a proxy hides the public origin from the app. Once set, it is the single value read by the Protected Resource Metadata document's `resource` field, the audience recorded on every issued token, and the audience validated on every incoming token — and a request arriving at any other origin is answered `421`.

- **Type:** `String`
- **Default:** `nil` (derived from the request origin plus the mount path)
- **Validation:**
  - Raises `Avo::McpServer::ConfigurationError` at boot when its path disagrees with the path passed to [`mount_avo_mcp_server`](#mount_avo_mcp_server).
  - Raises at boot for a non-loopback `http://` URL. `localhost` and `127.0.0.1` keep `http` for development; everything else must be `https`.

:::warning Changing this is a migration
Tokens are bound to the address they were minted under. After a change, every live connection's next call is answered `421` by design, and admins reconnect through the authorize page.
:::

</Option>

<Option name="`tool_calls_per_minute`" headingSize="3">

How many JSON-RPC requests one connection may make in a minute before the endpoint answers `429` with a `Retry-After` header.

```ruby
config.mcp_server.tool_calls_per_minute = 600
```

This is the one configurable ceiling — the registration, token, and authorization endpoints have fixed per-IP limits, because those bound what an unauthenticated stranger can do to a URL anyone can find. This one bounds your own authenticated agent doing your own work, so raise it for a heavy agent.

- **Type:** `Integer`
- **Default:** `300`

:::info It bounds anything only on a shared, incrementing cache
The limit runs through `Rails.cache`. On `:null_store` nothing is counted and there is no limit; on a per-process store such as `:memory_store` each worker keeps its own counter, so the real ceiling is this value times the worker count. Redis or Memcached is what makes the number mean what it says.
:::

</Option>

## Mounting

<Option name="`mount_avo_mcp_server`">

Route helper that draws every machine-facing endpoint. Available inside `Rails.application.routes.draw`.

```ruby
# config/routes.rb

# Default: JSON-RPC endpoint at /avo/mcp
mount_avo_mcp_server

# Move only the JSON-RPC endpoint
mount_avo_mcp_server at: "/admin/mcp"
```

It draws five things:

| Endpoint                            | Path                                                          | Authenticated |
| ----------------------------------- | ------------------------------------------------------------- | ------------- |
| Protected Resource Metadata         | `/.well-known/oauth-protected-resource` (origin root, bare and path-inserted) | No            |
| Authorization Server Metadata       | `/.well-known/oauth-authorization-server` (origin root)       | No            |
| Token endpoint                      | `<mount path>/token`                                          | No            |
| Client registration (RFC 7591)      | `<mount path>/register`                                       | No            |
| JSON-RPC endpoint                   | `<mount path>`                                                | Bearer token  |

The two discovery documents are always drawn at the **origin root** — the protocol requires them there, and `at:` does not move them. The consent screen and the MCP connections resource are not drawn here at all: they are mounted with the panel and inherit the app's own sign-in.

- **Type:** Route helper
- **Values:** `at:` — a `String` path for the JSON-RPC endpoint. Default `"/avo/mcp"`.
- **Validation:** raises `Avo::McpServer::ConfigurationError` at boot when
  - it is drawn inside an `authenticate` or `constraints` block;
  - it is drawn after `mount_avo` at a path under Avo's own mount prefix;
  - `at:` disagrees with the path in a pinned [`resource_identifier`](#resource_identifier).

:::danger Both refused placements look healthy in production
Behind an `authenticate` block, every MCP request — discovery included — is answered by the sign-in failure, because a connected client holds a bearer token and no browser session. Drawn after `mount_avo` under its prefix, Avo's engine mount swallows the endpoint and answers `404` while discovery keeps advertising it.

Each was shipped to production before these checks existed, and each fails only where the deploy can no longer see it. That is why they raise at boot rather than at request time.
:::

</Option>

## Generators

<Option name="`avo:mcp_server install`">

Creates the migration and appends the configuration block to `config/initializers/avo.rb`.

```bash
bin/rails generate avo:mcp_server install
bin/rails db:migrate
```

The migration creates four tables: `avo_mcp_server_connections` (one per authorized client), `avo_mcp_server_access_grants` (single-use authorization codes), `avo_mcp_server_access_tokens` (access and refresh token digests), and `avo_mcp_server_clients` (dynamically registered clients only). Codes and tokens are stored as SHA-256 digests, never in the clear.

Appending the configuration is idempotent: a second run detects `config.mcp_server.enabled` anywhere in the initializer and leaves the file alone, so a value typed by hand is never buried under a commented block.

- **Values:** `--skip-avo-version` — skip printing the installed Avo version.

:::warning UUID admin models
`t.references :user` is polymorphic and carries no foreign key, so a UUID-keyed admin model needs `type: :uuid` added **before** migrating. Nothing fails at migration time; the mismatch surfaces later as owning-admin lookups that quietly find nothing.
:::

</Option>

## Tools

The nine tools a connection can call, each gated by the capability it declares. Tool names are what a client prints in its own transcript, and are never translated.

| Tool              | Capability    | Does                                            |
| ----------------- | ------------- | ----------------------------------------------- |
| `list_resources`  | `avo:read`    | Lists which resources this panel serves         |
| `list_records`    | `avo:read`    | Pages through a resource's records              |
| `show_record`     | `avo:read`    | Opens one record in full, with its associations |
| `search_records`  | `avo:read`    | Searches records by text                        |
| `list_actions`    | `avo:read`    | Lists the actions a resource registers          |
| `create_record`   | `avo:write`   | Creates a record                                |
| `update_record`   | `avo:write`   | Changes a record's fields                       |
| `delete_record`   | `avo:write`   | Deletes a record                                |
| `run_action`      | `avo:actions` | Runs one of this app's actions on records       |

`list_actions` sits under read rather than under `avo:actions`: discovering that an operation exists is a read, and putting it behind the capability an admin is least likely to grant would leave an agent unable to learn what it may *not* run — and unable to tell the admin what to re-authorize.

:::info Behavior worth knowing before you grant
- **`search_records` never falls back to listing.** A resource with no `self.search` is an error when named directly, and is reported under `unsearchable` in an all-resource search. Returning the resource's records instead would turn *"this cannot be searched"* into *"here is all of it"*.
- **Associations are followable, not nested.** `show_record` returns a `belongs_to` as an id plus a title, and a `has_many` as a count plus up to 25 ids — already narrowed by the associated model's own policy scope, since an association is otherwise a way around `list_records` on the child.
- **The MCP connections resource is excluded from every tool**, so a client cannot list connections or revoke one through `run_action`.
:::

## Capabilities

The scope strings a grant is stored as. Write carries read; a per-resource grant appends the resource's class name.

| Capability      | Scope string             | Per-resource form            | Selected at consent |
| --------------- | ------------------------ | ---------------------------- | ------------------- |
| Read            | `avo:read`               | `avo:read:Post`              | Yes                 |
| Read & write    | `avo:write`              | `avo:write:Post`             | No                  |
| Run actions     | `avo:actions`            | — (global toggle only)       | No                  |

Run actions has no per-resource form of its own: over a narrowed read it applies to exactly the resources the read grant names.

A connection cannot be widened in place. Re-authorizing through the consent screen is the only way to add a capability or a resource to an existing client.

## Error codes

Refusals come back as JSON-RPC errors carrying a numeric `code`, a message, and a `data` object.

| Code     | Constant                    | Means                                                             | `data` carries                                            |
| -------- | --------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `-32000` | `CAPABILITY_REQUIRED`       | The connection was never granted the capability the tool requires | What was withheld (`requiredCapability`) and what is held  |
| `-32001` | `UNAUTHORIZED`              | Capability held; the owning admin's own policy said no            | —                                                          |
| `-32002` | `AUTHORIZATION_UNAVAILABLE` | Authorization cannot be enforced, so nothing was attempted        | —                                                          |
| `-32003` | `VALIDATION_FAILED`         | The model refused a create, update, or destroy                    | `fieldErrors`, `missingRequiredAttributes`                  |
| `-32004` | `SEARCH_UNAVAILABLE`        | The resource has no `self.search` configured                      | —                                                          |
| `-32005` | `UNSUPPORTED_RESOURCE`      | The resource is not backed by Active Record (an array resource)   | —                                                          |
| `-32602` | `INVALID_PARAMS`            | Unknown tool, resource, record, or argument                       | `writableFields`, `availableActions`, `availableInputs`, `sortableColumns` |
| `-32020` | —                           | A header disagrees with the request body                          | —                                                          |
| `-32022` | —                           | Unimplemented protocol revision                                   | —                                                          |

`-32002` almost always means the license, not the code: `avo-authorization` must be **licensed**, not merely bundled, or the server refuses to serve rather than run tool calls with no policy checks. See [Requirements](./mcp.html#requirements).

A record outside the admin's policy scope reports as `-32602` **not found**, identical to an id that never existed, so a read tool cannot be used to probe for hidden records. A resource they may not list reports as `-32001` **unauthorized** and says so, because the caller already sees the sidebar. The asymmetry is deliberate.

## Panel classes

| Class                                       | What it is                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `Avo::Resources::McpConnection`             | The MCP connections resource, at `<avo-root>/resources/mcp_connections` |
| `Avo::Actions::McpRevokeConnection`         | The Revoke action                                                       |
| `Avo::McpServer::Connection`                | The model behind the resource                                           |
| `Avo::McpServer::ConnectionPolicy`          | The policy **you** write; the gem ships none                            |

Connections are never created, edited, or deleted from the panel — the model refuses all three. A host with an explicit `config.resources` array must add `"Avo::Resources::McpConnection"` to it. To keep the resource off the sidebar, set `Avo::Resources::McpConnection.visible_on_sidebar = false` in a `to_prepare` block.

Every string on the resource is translatable, in each of the nineteen languages Avo ships: field names under `avo.resource_translations.mcp_connection.fields.<field id>`, everything else under `avo.mcp_server.connections` — including the per-tool lines (`.tools.summaries.<tool name>`) and the capability titles (`.capabilities.read|write|actions`). Tool names and tool descriptions are never translated: a client reads the first and a model reads the second. The consent screen is English throughout.

## Protocol

| Item                     | Value                                                                    |
| ------------------------ | ------------------------------------------------------------------------ |
| Target MCP revision      | `2026-07-28` (stateless lifecycle, `server/discover`)                    |
| Also served              | The classic `initialize` lifecycle, for clients on `2025-11-25` and earlier |
| Transport                | Remote only — Streamable HTTP. No stdio, no pasteable shared token       |
| Client authentication    | Public clients only (`token_endpoint_auth_methods_supported: ["none"]`), PKCE required |
| Client registration      | Client ID Metadata Document, or RFC 7591 Dynamic Client Registration     |
| Token binding            | Audience-bound to [`resource_identifier`](#resource_identifier) or the derived address |
| Refresh tokens           | Rotated, with family-wide revocation on reuse detection                  |
