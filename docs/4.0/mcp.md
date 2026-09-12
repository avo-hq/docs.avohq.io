---
license: addon
addon_link: https://avohq.io/addons/mcp-server
addon: avo-mcp_server
betaStatus: "Beta"
outline: [2, 3]
api_docs: ./mcp-api.html
---

# MCP Server

The `avo-mcp_server` add-on turns your Avo panel into a remote [MCP](https://modelcontextprotocol.io) server, so an AI client such as Claude, ChatGPT, or Cursor can browse and manage your admin data in natural language. An admin pastes your app's MCP URL into their client, approves a consent screen served by your own panel, and from then on the client acts **as that admin** — through the same resources, policies, and field visibility the panel already enforces.

```ruby
# config/routes.rb
Rails.application.routes.draw do
  mount_avo_mcp_server

  authenticate :user do
    mount_avo
  end
end
```

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.mcp_server.enabled = true
end
```

The server is **off by default**: adding the gem changes nothing until you mount it and enable it. With nothing else configured, its address is your panel's origin plus `/avo/mcp`, each connection may make 300 tool calls a minute, and every request a connection makes is kept in a log on its page.

## Requirements

- Avo 4.2 or newer
- A license with **both** this add-on and [Authorization](./authorization.html) enabled
- The panel reachable over HTTPS at a public URL. Consent and token exchange happen in the admin's browser.
- A client that supports **remote** MCP servers with OAuth. There is no stdio transport and no token to paste into a config file.

:::warning Authorization must be licensed, not just installed
Policy enforcement lives in the Authorization add-on, and it skips every policy check when it isn't licensed. Rather than run tool calls with no policies at all, the server refuses to serve until both add-ons are on the license. If clients connect but every call answers [`-32002`](./mcp-api.html#error-codes), check the license first.
:::

## Install

### 1. Add the gem

```ruby
# Gemfile
gem "avo-mcp_server", source: "https://packager.dev/avo-hq/"
```

```bash
bundle install
```

### 2. Run the installer

```bash
bin/rails generate avo:mcp_server install
bin/rails db:migrate
```

The [installer](./mcp-api.html#generators) writes two migrations — the connections, codes, and tokens admins authorize, and the connection log — and appends a commented configuration block to `config/initializers/avo.rb`. It's additive: run it again after an upgrade and it adds only what your app is missing.

If your admin model uses UUID primary keys, add `type: :uuid` to the migration's `t.references :user` line before migrating. The reference carries no foreign key, so a mismatch doesn't fail at migration time — it shows up later as connections whose owner can't be found.

### 3. Mount the endpoints

```ruby
# config/routes.rb
Rails.application.routes.draw do
  mount_avo_mcp_server # [!code highlight]

  authenticate :user do
    mount_avo
  end
end
```

[`mount_avo_mcp_server`](./mcp-api.html#mount_avo_mcp_server) draws the endpoints AI clients talk to: the two OAuth discovery documents at your origin root, the token and client registration endpoints, and the JSON-RPC endpoint at `/avo/mcp`. Pass `at:` to move the JSON-RPC endpoint. The consent screen and the connections resource aren't part of this — they're mounted with the panel and use your existing sign-in.

:::warning Mount it outside your authentication block, and before `mount_avo`
A connected client calls these endpoints with a bearer token and no browser session, so inside `authenticate :user do … end` every call would be answered with the sign-in redirect. And because `/avo/mcp` sits under Avo's own `/avo`, it must come before `mount_avo`, or Avo's engine swallows it. Both placements are refused at boot with a message naming the fix.
:::

### 4. Turn it on

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.mcp_server.enabled = true # [!code highlight]
end
```

Your server's address is the panel's origin plus the mount path — `https://app.example.com/avo/mcp` for a panel at `https://app.example.com`. That's the URL admins paste into their clients. If your panel answers at more than one origin, or a proxy hides the public one, [pin the address](#pin-the-server-address).

## Connect a client

1. Copy the server URL. **Connect a client** on the MCP connections resource shows it with a recipe per client, and so does opening the URL in a browser.
2. Add it to the AI client as a remote MCP server.
3. The client sends the admin to the authorize page, served by your panel. If they aren't signed in, they sign in first.
4. They review who is asking, choose what the client may do, and approve.

Nothing is copied by hand. The client obtains a short-lived token through the redirect and refreshes it on its own; declining creates nothing. The recipes, with `https://app.example.com/avo/mcp` standing in for your URL:

::: code-group

```bash [Claude Code]
claude mcp add --transport http acme-admin https://app.example.com/avo/mcp
# then, inside Claude Code: /mcp → acme-admin → Authenticate
```

```json [Cursor]
// ~/.cursor/mcp.json — or use "Install in Cursor" on the connect page
{
  "mcpServers": {
    "acme-admin": {
      "url": "https://app.example.com/avo/mcp"
    }
  }
}
```

```toml [Codex CLI]
# ~/.codex/config.toml
[mcp_servers.acme-admin]
url = "https://app.example.com/avo/mcp"

# then: codex mcp login acme-admin
```

```json [VS Code]
// .vscode/mcp.json — or use "Install in VS Code" on the connect page
{
  "servers": {
    "acme-admin": {
      "type": "http",
      "url": "https://app.example.com/avo/mcp"
    }
  }
}
```

:::

**ChatGPT** has no config file: open Settings → Connectors → Create, name it, paste the server URL, and sign in when asked (this needs developer mode, under Settings → Apps & Connectors → Advanced). Any other client works the same way: follow its setup for a remote server and use the URL.

### What the admin sees on the authorize page

- The client's name and logo next to your panel's own logomark, and the client's **verified domain** — the origin of its identifier — underneath.
- Where the browser goes back to afterwards. A loopback address is named as what it is: a program on the admin's own machine.
- The admin they're signed in as — the person the connection will act as.
- What the client may do: **Read**, **Read & write**, or **Choose per resource** for records, and **Run actions** as a separate toggle.

A client that registered itself instead of publishing a metadata document has no verifiable identity. Its mark is ringed in amber, only read is preselected, and the admin has to tick *I started this connection myself, from a client I recognize* before the page will approve anything.

:::warning The name is the client's claim; the domain is the evidence
A client names itself, so anything can call itself "Claude Code" and ask for write access. The verified domain is the one thing an attacker would have to control to forge. Read both before approving a request for write or run actions.
:::

## Choose what a connection can do

Three capabilities cover the whole surface. Write means create, update, **and** delete, as in the [REST API](./rest-api.html).

| Capability       | Scope                                  | Tools it unlocks                                                                  | At consent       |
| ---------------- | -------------------------------------- | --------------------------------------------------------------------------------- | ---------------- |
| **Read**         | `avo:read`, or `avo:read:<Resource>`   | `list_resources`, `list_records`, `show_record`, `search_records`, `list_actions` | Selected         |
| **Read & write** | `avo:write`, or `avo:write:<Resource>` | `create_record`, `update_record`, `delete_record`                                 | **Not** selected |
| **Run actions**  | `avo:actions`                          | `run_action`                                                                      | **Not** selected |

**Choose per resource** on the authorize page lists every resource the admin can see and lets them pick *none*, *read*, or *read & write* for each. A narrowed grant holds everywhere: `list_resources` lists only the granted resources, a tool naming any other one is refused before a record is loaded, `search_records` with no resource searches only the granted ones, an association to an ungranted resource is left out of `show_record`'s payload, and run actions over a narrowed read means "on those resources". Write carries read.

A capability is fixed when the connection is created. To widen one, the admin authorizes the client again.

:::warning Write and run actions are unselected on purpose
An agent can't reliably tell your data apart from instructions aimed at it, so text in a record it reads — a signup name, a ticket body — can steer it. `delete_record` and `run_action` act immediately, with no confirmation step: granting the capability at consent **is** the confirmation. Grant them to clients you trust, on data you control, and keep everything else read-only.
:::

## Every call stays inside the admin's own permissions

Every tool call passes two gates, in this order:

1. **The capability gate.** A tool the connection wasn't granted — globally, or for the resource the call names — is refused before any data is touched, and the error names the missing capability.
2. **Your authorization.** The owning admin is re-resolved from your app on every request, and the call runs through the same policies the panel uses for them.

So a connection can never do anything its admin couldn't do by hand. Granting a capability is permission to *try*; the policy decides. And because the admin is re-resolved every time, a permission change takes effect on the next call — demote an admin to read-only and their connected client stops writing, with nothing to revoke.

### Keep a field out of a client's reach

The [`visible:`](./field-options-api.html#visible) blocks on your fields apply to reads *and* writes. A field the panel hides from this admin isn't returned by any read tool, isn't listed by `list_resources`, and can't be written even on a record they may otherwise edit. Read-only fields are refused the same way, and so are `id`, `created_at`, `updated_at`, and any column whose name looks like a credential (`password`, `token`, `secret`, `digest`). A refused attribute fails the call rather than being silently dropped.

The converse is the rule too: a field the panel **does** render this admin is returned, credentials included. There is no MCP-only redaction list — to keep something out of an AI client's reach, hide it with `visible:`, the same block that hides it from a person.

## Review and revoke connections

Connections are an Avo resource: **MCP connections** in the sidebar, at `<your-avo-path>/resources/mcp_connections`. Each row is one client acting as one admin — the client's name and id, the **Owner**, when it was authorized, and when it was **last used**. A connection's page adds the status as chips by the title, an **Entitlements** card showing what the grant reaches, a **Tools** card listing the calls it unlocks (and the ones it withholds), and the **Log** card described below.

**Revoke** is an action on the resource, from the actions menu or a connection's page; with [Custom controls](./custom-controls.html) it's also a button on the toolbar, on each live row, and on the page. It takes effect on the client's next call and notifies nothing. The connection stays listed as revoked, so you can still see that it existed and when it last ran. Connections are never edited or deleted from the panel, and the resource is excluded from the MCP tools themselves — a client can't list connections or revoke one through `run_action`.

If your initializer lists resources explicitly in `config.resources`, add `"Avo::Resources::McpConnection"` to it. To link the resource into the profile menu (needs the [Menu editor](./menu-editor.html) add-on):

```ruby
# config/initializers/avo.rb
config.profile_menu = -> do
  link_to "MCP connections",
    path: Avo::Engine.routes.url_helpers.resources_mcp_connections_path,
    icon: "plug-connected"
end
```

### See what a connection may reach

The **Entitlements** card is the consent screen's decision read back in the shape it was made in: one row per resource, at **None**, **Read** or **Read & write**, with a search over them and a count underneath — `4 of 14 granted — everything else is refused`.

Rows are the resources the connection's **owner** can list, not the reader's. A grant that names a resource the panel no longer registers keeps its row, marked *no longer listed*, so the card never under-reports what is held. A grant that names no resources at all collapses to one line — *Every resource*, at the level it holds — with the list behind a **Show resources** control.

It is read-only, and not for want of a form. A connection's capabilities are fixed when it is authorized: to change what a client may do, revoke it and authorize it again, so the client is told rather than having its reach changed underneath it.

Running actions is not a per-resource question, so it sits above the grid as its own line rather than as a row that could not hold it.

:::info
This is the same grid the [REST API](./rest-api.html) shows for an API token's entitlements. A panel running both add-ons asks "what may this credential reach?" in one form on both screens.
:::

The **Tools** card below it is the same grant read as the calls it turns into — `list_records`, `run_action` — grouped by the capability that unlocks each group. A narrowed grant is **counted** there (*on 3 resources*) rather than named, since the names are rows on the Entitlements card above. The write group says what it stands on, above its tools: *Everything in Read, plus:* — "Read & write" heads three calls only because the group carries read's five as well.

### Watch what a connection is doing

A connection's page carries a **Log** card: every request the client made, newest first, kept current while the page is open. Each row shows the tool and resource it named (or the method, for `initialize` and `tools/list`), the time, how long it took, and how it went:

| Outcome        | What happened                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------- |
| green dot      | Served.                                                                                           |
| Error          | A JSON-RPC error — a withheld capability, a policy that said no, a missing record. The message is the one the client got. |
| Tool error     | The tool ran and reported a failure.                                                              |
| Refused        | A malformed request, refused before any tool ran.                                                 |
| Rate limited   | Over `tool_calls_per_minute`.                                                                     |
| Token rejected | An expired or revoked token, or a revoked connection. A client still retrying after you revoked it shows up here. |

A tool call's arguments sit behind a disclosure on its row, after your app's `filter_parameters` and capped at 4 KB. Filter the list to tool calls or errors, or pause it while you read.

Each connection keeps its newest 500 rows and drops older ones as new ones arrive. Both are options — [`connection_log`](./mcp-api.html#connection_log) switches the log off, [`connection_log_size`](./mcp-api.html#connection_log_size) changes the size:

```ruby
# config/initializers/avo.rb
config.mcp_server.connection_log_size = 2_000
```

Who may read the log is who may open the page, unless your policy defines `view_log?` — then the card and the endpoint it polls ask that instead.

Upgrading from a version without the log? The log has its own table: run `bin/rails generate avo:mcp_server install` again, then `bin/rails db:migrate`. Until then the card names the migration and nothing is recorded.

### Decide who sees and revokes what

This add-on ships no policy for the resource. Without one, Avo's defaults apply as for any other resource: with `explicit_authorization = false` every admin sees and may revoke every connection; with `explicit_authorization = true` the resource stays hidden until a policy answers `index?`. A policy goes where every other policy goes:

```ruby
# app/policies/avo/mcp_server/connection_policy.rb
class Avo::McpServer::ConnectionPolicy < ApplicationPolicy
  def index? = true

  def show? = user.owner? || record.user == user

  # Revoke. Avo asks once for the action itself (record is the class), then per selected connection.
  def act_on? = record.is_a?(Class) || user.owner? || record.user == user

  # The three cards below the fields. Each is optional: without it, show? decides.
  def view_log? = user.owner?

  def view_entitlements? = user.owner?

  def view_tools? = true

  # Connections are created by authorizing a client and ended by revoking it.
  def create? = false

  def edit? = false

  def destroy? = false

  class Scope < ApplicationPolicy::Scope
    def resolve = user.owner? ? scope.all : scope.where(user: user)
  end
end
```

The `Scope` decides the list, `show?` the page, `act_on?` the Revoke action. To keep the resource off the sidebar, set `Avo::Resources::McpConnection.visible_on_sidebar = false` in a `to_prepare` block.

Each card below the fields has an optional method of its own, and all three fall back to `show?`, so a policy that defines none gives the whole page to anyone who may open it. They are separate because the cards disclose different things:

| Method               | Card                                          | What it discloses                                                                                                     |
| -------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `view_log?`          | **Log**, *and* the endpoint the page polls    | Data about your own records — tool arguments, record ids, search terms.                                                 |
| `view_entitlements?` | **Entitlements**                              | The connection **owner's** reach. On another admin's connection it names resources the reader's own policies may hide. |
| `view_tools?`        | **Tools**                                     | Tool names, derived from the registry and the grant. Nothing beyond them.                                               |

Refusing one leaves the rest of the page intact.

## Run it in production

### Pin the server address

By default the server's address is whatever origin each request arrives on, plus the mount path. If your panel answers at more than one origin, or a proxy hides the public one from the app, pin [`resource_identifier`](./mcp-api.html#resource_identifier) to the one public URL every surface should read:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.mcp_server.enabled = true
  config.mcp_server.resource_identifier = "https://app.example.com/avo/mcp" # [!code highlight]
end
```

Its path must match the path you mount at, or boot raises. Once pinned, a request arriving at any other origin is answered `421`.

Every issued token is bound to the address it was minted under, so **changing the address is a migration**: every live connection's next call is refused with `421`, and admins reconnect through the authorize page. Announce it.

### Behind a proxy or load balancer

A TLS-terminating proxy that doesn't pass the original scheme and host through leaves the app seeing `http` and an internal hostname — and plain `http` is refused outside `localhost`, because tokens would travel in the clear. Forward `X-Forwarded-Proto` and `X-Forwarded-Host`, allow the public hostname in `config.hosts`, or pin the address.

### Rate limits

The JSON-RPC endpoint allows each connection 300 calls a minute, answering `429` with `Retry-After` over it. Raise [`tool_calls_per_minute`](./mcp-api.html#tool_calls_per_minute) for a heavy agent:

```ruby
# config/initializers/avo.rb
config.mcp_server.tool_calls_per_minute = 600
```

The authorize, token, and registration endpoints have fixed per-IP limits. All of them count through `Rails.cache`: on `:null_store` nothing is counted, and on a per-process store each worker counts on its own. Use a shared store such as Redis or Memcached in production.

### Turn it off without losing the connections resource

`config.mcp_server.enabled = false` answers `404` on every protocol endpoint and the consent screen, but the connections resource stays — it's part of the panel, not the server — so you can still revoke during an incident. If `enabled` is `true` but the routes aren't mounted, the server logs a warning at boot and the connections resource says so.

### Keep credentials out of your logs

The engine filters the OAuth parameters (`code`, `code_verifier`, `refresh_token`, `access_token`, `client_secret`) from your request logs on its own. The `_meta` object some clients attach to each call is left in, and ChatGPT puts the end user's coarse location in it. To drop it:

```ruby
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [:_meta]
```

## Trace changes back to an admin

With [Audit Logging](./audit-logging.html) installed, a change made through a connection is recorded against the admin who authorized it, indistinguishable from the same change made by hand. The audit log tells you *who* a change belongs to; the Log card tells you *what* the client asked for.

## Triage errors a client reports

Refusals come back as JSON-RPC errors with a numeric `code`, a message, and a `data` object. The [full table is in the reference](./mcp-api.html#error-codes); these three cover most reports:

| Code     | Means                                              | First thing to check                                         |
| -------- | -------------------------------------------------- | ------------------------------------------------------------ |
| `-32000` | Capability not granted                             | The consent selection — authorize again with the capability  |
| `-32001` | Capability granted, the admin's policy said no     | Your policy for that admin                                   |
| `-32002` | Authorization isn't being enforced, nothing ran    | The license — both add-ons must be enabled                   |

A record outside the admin's policy scope reports as **not found** (`-32602`), identical to an id that never existed, so a read tool can't be used to probe for hidden records. A resource they may not list reports as **unauthorized** (`-32001`) and says so, because the caller already sees the sidebar.

## Full example

```ruby
# config/routes.rb
Rails.application.routes.draw do
  mount_avo_mcp_server at: "/avo/mcp"

  authenticate :user do
    mount_avo
  end
end
```

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.mcp_server.enabled = true
  config.mcp_server.resource_identifier = "https://app.example.com/avo/mcp"
  config.mcp_server.tool_calls_per_minute = 300
  config.mcp_server.connection_log = true
  config.mcp_server.connection_log_size = 500
end
```

## Options reference

| Option                                                          | Type      | Default |
| --------------------------------------------------------------- | --------- | ------- |
| [`enabled`](./mcp-api.html#enabled)                             | `Boolean` | `false` |
| [`resource_identifier`](./mcp-api.html#resource_identifier)     | `String`  | `nil`   |
| [`tool_calls_per_minute`](./mcp-api.html#tool_calls_per_minute) | `Integer` | `300`   |
| [`connection_log`](./mcp-api.html#connection_log)               | `Boolean` | `true`  |
| [`connection_log_size`](./mcp-api.html#connection_log_size)     | `Integer` | `500`   |

The route helper, the installer, the nine tools and their arguments, the capabilities, every error code, and the policy methods are in the [MCP Server reference](./mcp-api.html).
