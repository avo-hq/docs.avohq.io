---
license: addon
addon_link: https://avohq.io/addons/mcp-server
addon: avo-mcp_server
betaStatus: "Not yet released"
outline: [2, 3]
---

# MCP server

The `avo-mcp_server` add-on turns your Avo panel into a **remote** [MCP](https://modelcontextprotocol.io) server. An admin pastes the panel's MCP URL into an AI client — Claude Code, Cursor, ChatGPT, VS Code — approves a consent screen served by the panel itself, and everything the client does afterwards runs **as that admin, under the policies they already have**.

There is no token to copy and no service account. The client obtains a short-lived token through an OAuth redirect and refreshes it itself, and the admin can revoke the whole connection from the panel at any time.

:::info Add-on
The MCP server ships as the separate `avo-mcp_server` gem. [See the add-on page →](https://avohq.io/addons/mcp-server)
:::

## Requirements

- Avo `>= 4.0`
- A licensed `avo-mcp_server`
- A licensed **`avo-authorization`** — not merely bundled. Every tool call runs the connected admin's policies through it, and the server refuses to serve at all rather than run with authorization skipped.

## Installation

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

This creates the `avo_mcp_server_*` tables — connections, single-use authorization codes, access tokens, and the connection log — and appends the configuration block to `config/initializers/avo.rb`.

### 3. Mount the endpoints

```ruby
# config/routes.rb
Rails.application.routes.draw do
  mount_avo_mcp_server # [!code focus]

  authenticate :user do
    mount_avo
  end
end
```

:::warning Mount it outside your authentication block
`mount_avo_mcp_server` must sit **outside and before** any `authenticate` block. The discovery, registration and token endpoints are called by the AI client, which has no session — wrapping them in your app's sign-in makes every client fail at a step that looks like a routing bug.
:::

It draws the two OAuth discovery documents (always at the origin root, where the protocol requires them), the client registration endpoint, the token endpoint, and the JSON-RPC endpoint at `/avo/mcp`. Pass `at:` to move the JSON-RPC endpoint alone:

```ruby
mount_avo_mcp_server at: "/agents/mcp"
```

The consent screen and the connections resource are **not** part of this. They are mounted with the panel and inherit your existing sign-in.

### 4. Enable it

Installing the gem never starts answering protocol requests on its own — you have to say so:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.mcp_server.enabled = true # [!code focus]
end
```

## Configuration

All options live under `config.mcp_server` inside `Avo.configure`. There is no `Avo::McpServer.configure` block.

```ruby
Avo.configure do |config|
  # Master switch. Installing the gem never starts serving on its own.
  config.mcp_server.enabled = true

  # Optional. By default the server's address is the origin each request arrives on plus the
  # mount path. Pin the full public URL here when the panel answers at more than one origin,
  # or when a proxy hides the public origin from the app.
  config.mcp_server.resource_identifier = "https://app.example.com/avo/mcp"

  # Per-connection ceiling on JSON-RPC tool calls per minute. Over it, the endpoint answers
  # 429 with Retry-After. This bounds your own authenticated agent doing your own work —
  # raise it for a heavy one.
  config.mcp_server.tool_calls_per_minute = 300

  # Whether the endpoint records what each connection asked for, for the Log card.
  config.mcp_server.connection_log = true

  # How many log rows each connection keeps. Older rows are dropped as newer ones arrive.
  # nil keeps every row.
  config.mcp_server.connection_log_size = 500
end
```

| Option                  | Type      | Default | Notes                                                                            |
| ----------------------- | --------- | ------- | -------------------------------------------------------------------------------- |
| `enabled`               | `Boolean` | `false` | Master switch.                                                                    |
| `resource_identifier`   | `String`  | `nil`   | Pins the server's public address. Only needed behind a proxy or multiple origins. |
| `tool_calls_per_minute` | `Integer` | `300`   | Per-connection rate limit on tool calls.                                          |
| `connection_log`        | `Boolean` | `true`  | `false` records nothing; the Log card says so.                               |
| `connection_log_size`   | `Integer` | `500`   | Rows kept per connection. `nil` keeps all.                                        |

## Connecting a client

The admin copies the server URL — the panel's origin plus the mount path — and adds it to their client as a remote MCP server. Opening that URL in a browser shows a connect page with a setup recipe for each client.

The client sends them to the panel's own consent screen, where they choose what it may do and approve. Nothing is copied by hand.

:::warning The name is the client's claim; the domain is the evidence
The consent screen leads with the client's own product name, because that is the string an admin can match against the thing they just launched — and says in the same breath that the panel has not verified it, printing the origin of the client identifier. A name is whatever a client puts in its own metadata. The origin is the one attribute an attacker would have to control a domain to forge.
:::

## Capabilities

Three capabilities cover the whole surface. **Write includes delete**, as it does in the REST API.

| Capability       | Scope string                               | What it unlocks                                                             |
| ---------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| **Read**         | `avo:read`, or `avo:read:<Resource>`       | `list_resources`, `list_records`, `show_record`, `search_records`, `list_actions` |
| **Read & write** | `avo:write`, or `avo:write:<Resource>`     | Everything in Read, plus `create_record`, `update_record`, `delete_record`   |
| **Run actions**  | `avo:actions`                              | `run_action`                                                                  |

Read and write are granted across every resource the admin can see, or **narrowed to named resources** through the consent screen's "Choose per resource" option. Run actions is a global toggle — there is no per-resource or per-action selection — and over a narrowed read it reaches exactly the resources those reads allow.

A capability never widens what the admin can already do. It only narrows the result of your own authorization further.

## Managing connections

Connections are an ordinary Avo resource — **MCP connections**, at `<avo-root>/resources/mcp_connections` — so they get the same table, filters, actions menu and policy as everything else in your panel.

A connection is created by authorizing a client and ended by revoking one. Nothing edits one in between: the model refuses it, because widening a client's reach underneath it is exactly what an admin would not expect. To change what a client may do, revoke it and authorize it again.

**Revoke** is an action on the resource. It takes effect on the client's next call, notifies nothing, and the connection stays listed as revoked so the record survives.

A connection's page carries three cards below its fields.

### Entitlements

What the grant reaches, resource by resource: one row per resource at **None / Read / Read & write**, with a search over them and a count underneath. It is the consent screen's decision read back in the same shape the admin made it in.

Rows are the resources the connection's **owner** can list — not the reader's. A grant naming a resource the panel no longer registers keeps its row, marked *no longer listed*, so the card never under-reports what is held.

A grant that names no resources collapses to a single line — *Every resource*, at the level it holds — with the list behind a **Show resources** control.

### Tools

The same grant read back as the calls it turns into on the wire, by the name a client prints in its own transcript: `list_records`, `run_action`. It is grouped by the capability that unlocks each group, and **capabilities the grant withholds keep their group**, muted and headed "not granted" — because "why can it not do X?" is what this screen gets opened for.

### Log

Every request the client made, newest first, kept current while the page is open: the tool and the resource it named, the time, the duration, and the outcome. A tool call's arguments sit behind a disclosure on its row, filtered through your app's `filter_parameters` and capped at 4 KB.

In an app without `avo-audit_logging`, this and the **Last used** column are the only record anywhere that a connection ever ran — which is the first thing asked after a suspected token theft.

Switch it off with `config.mcp_server.connection_log = false`.

:::info Not the same thing as audit logging
This log is one connection's own requests — what an AI client asked this server for. It is unrelated to [Audit Logging](./audit-logging.html), which records who changed which records across your whole panel. A panel can run both; they answer different questions.
:::

## Authorization

**The gem ships no policy and no scoping for the connections resource.** Who sees which connections, and who may revoke them, is your decision — made in `Avo::McpServer::ConnectionPolicy` exactly as for any other resource.

Without a policy, Avo's defaults apply: with `explicit_authorization = false` every admin sees, opens and may revoke every connection; with `explicit_authorization = true` the resource stays hidden until a policy answers `index?`.

```ruby
# app/policies/avo/mcp_server/connection_policy.rb
class Avo::McpServer::ConnectionPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      user.owner? ? scope.all : scope.where(user: user)
    end
  end

  def index? = true

  def show? = true

  # Asked once with the class, then per selected record.
  def act_on? = user.owner? || record.user == user

  # The model refuses all three anyway; returning false hides the controls too.
  def create? = false
  def edit? = false
  def destroy? = false
end
```

### Per-card visibility

Each card below the fields has an **optional** policy method of its own. All three fall back to `show?` when your policy does not define them, so a policy that defines none gives the whole page to anyone who may open it.

| Method               | Decides                                                        |
| -------------------- | -------------------------------------------------------------- |
| `view_entitlements?` | The **Entitlements** card                                       |
| `view_tools?`        | The **Tools** card                                              |
| `view_log?`          | The **Log** card *and* the endpoint it polls                    |

They are separate because the cards disclose different things:

- **Log** is the only card carrying data about your own records — tool arguments, record ids, search terms.
- **Entitlements** is computed against the connection **owner's** reach. On somebody else's connection it therefore names resources the reader's own policies may hide from them.
- **Tools** is derived from the tool registry and the grant, and discloses nothing beyond them.

Refusing one leaves the rest of the page intact:

```ruby
class Avo::McpServer::ConnectionPolicy < ApplicationPolicy
  def show? = true

  # Everyone may see that a connection exists and revoke it...
  # ...but only its owner reads what it actually did.
  def view_log? = user.owner? || record.user == user # [!code focus]

  # ...and only owners see which resources another admin's grant reaches.
  def view_entitlements? = user.owner? || record.user == user # [!code focus]
end
```

:::info
`view_log?` is asked by the card *and* by the endpoint the page polls, so the two can never disagree. The other two cards render whole with the page and have no endpoint of their own.
:::

### What the tools themselves check

A capability is permission to *try*, never permission to succeed. Every tool call still runs the connected admin's own policies, so a record their policies hide stays hidden, a field your resource does not render is not returned, and an action they may not run is refused.

The converse holds too: **a field your panel does render that admin is returned**, credentials included. To keep something out of an AI client's reach, put a `visible:` block on that field — the same one that hides it from a person. There is no MCP-only redaction list.

### Keeping the resource off the sidebar

```ruby
# config/initializers/avo.rb
Rails.application.config.to_prepare do
  Avo::Resources::McpConnection.visible_on_sidebar = false
end
```

A host with an explicit `config.resources` array must add `"Avo::Resources::McpConnection"` to it.

## Troubleshooting

| Symptom                                                       | Cause                                                                                                            |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Every client fails at discovery or token exchange              | `mount_avo_mcp_server` is inside an `authenticate` block, or missing from `config/routes.rb`.                     |
| Clients refused with a mismatch error                          | The panel is served from an address other than `resource_identifier`. Behind a TLS proxy, forward `X-Forwarded-Proto` and `X-Forwarded-Host` and allow the public host in `config.hosts`. |
| Endpoints answer 404                                           | `config.mcp_server.enabled` is still `false`, or `avo-mcp_server` / `avo-authorization` is not licensed.          |
| A client connects but lists no tools                           | The client rejected the `tools/list` schema — every request returned 200. Ask the client what it rejected (`claude mcp list` prints the validation error); the server's logs show nothing wrong. |
| The Log card names a migration                            | The app was installed before the log existed. Run the installer again — it adds only the missing migration — then migrate. |
