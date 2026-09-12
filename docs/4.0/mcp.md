---
license: addon
addon_link: https://avohq.io/addons/mcp-server
addon: avo-mcp_server
betaStatus: "Not yet released"
outline: [2, 3]
api_docs: ./mcp-api.html
---

# MCP Server

The `avo-mcp_server` add-on turns your Avo panel into a **remote** [MCP](https://modelcontextprotocol.io) server, so an MCP client — Claude, ChatGPT, or an agent you wrote yourself — can read and act on your app's records through the resources, fields, and policies you already defined.

An admin pastes your app's MCP server URL into their AI client, approves a consent screen served by the panel itself, and picks what the client is allowed to do. From then on the client acts **as that admin**: every tool call runs through the same Avo authorization policies and field visibility the panel enforces.

:::info Add-on
The MCP server ships as the separate `avo-mcp_server` gem. [See the add-on page →](https://avohq.io/addons/mcp-server)
:::

This page covers installation, mounting, connecting a client, capabilities, how permissions are enforced, managing connections, and triaging errors. Every option, route helper, tool, and error code is in the [API reference](./mcp-api.html).

## Requirements

- Avo `>= 4.0`
- A license with **both** this add-on **and** [Authorization](./authorization.html) enabled
- The panel reachable over **HTTPS at a stable public URL** — consent and token exchange happen in a browser, from the client's side of the internet
- A client that supports **remote** MCP servers with OAuth

:::warning `avo-authorization` must be licensed, not merely installed
Policy enforcement lives in the `avo-authorization` add-on, and its service checks the license *before* it checks a policy — unlicensed, it skips authorization and returns `true` for everything. Serving MCP without it would run every tool call with no policy checks at all, so the server refuses to serve rather than degrade.

If clients connect fine but **every call returns [`-32002`](./mcp-api.html#error-codes)**, check the license first — not the tool, not the record.
:::

There is no stdio transport and no shared token to paste into a config file, so a client that can only launch a local command cannot connect.

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

The installer creates the `avo_mcp_server_*` tables (connections, single-use authorization codes, tokens, and registered clients) and appends the configuration block — commented out, at its defaults — to the end of `config/initializers/avo.rb`.

:::warning UUID primary keys
The connections table references your admin model polymorphically and without a foreign key, like every other Avo add-on. If that model uses UUID primary keys, add `type: :uuid` to the migration's `t.references :user` line **before** migrating. Nothing fails at migration time — the mismatch surfaces later, as owning-admin lookups that quietly find nothing.
:::

### 3. Mount the protocol endpoints

```ruby
# config/routes.rb
Rails.application.routes.draw do
  mount_avo_mcp_server # OUTSIDE and BEFORE any authenticate block # [!code focus]

  authenticate :user do
    mount_avo
  end
end
```

[`mount_avo_mcp_server`](./mcp-api.html#mount_avo_mcp_server) draws the two OAuth discovery documents (always at the origin root — the protocol requires them there), the client registration endpoint, the token endpoint, and the JSON-RPC endpoint at `/avo/mcp`. Pass `at:` to move only the JSON-RPC endpoint.

:::danger Mount it outside the authentication block, and before `mount_avo`
A connected client calls the token and JSON-RPC endpoints with a bearer token and **no browser session**. Inside `authenticate :user do … end`, Devise's constraint answers every MCP request — discovery included — with the sign-in failure, which the client cannot act on.

It must also come **before** `mount_avo`: with its default path `/avo/mcp` sitting under the panel's `/avo`, Avo's engine mount swallows everything below its prefix and answers 404, while the discovery documents at the origin root keep advertising the endpoint.

Both placements are refused at boot with a message naming the fix.
:::

The consent screen and the connections resource are **not** part of this mount — they belong to the panel and inherit your app's existing sign-in.

### 4. Turn it on

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.mcp_server.enabled = true # [!code focus]
end
```

The server is **off by default**: adding the gem never starts answering protocol requests on its own. These options live under `config.mcp_server` inside `Avo.configure` — there is no `Avo::McpServer.configure` block.

With nothing else configured, the server's address is the origin each request arrives on plus the mount path. See [Pin the server address](#pin-the-server-address) for when to set [`resource_identifier`](./mcp-api.html#resource_identifier) instead.

## Connect a client

The admin copies the server URL — your panel's origin plus the mount path, for example `https://app.example.com/avo/mcp` — adds it to their client as a remote MCP server, and is sent to the panel's own authorize page. They pick capabilities and approve. Nothing is copied by hand: the client obtains a short-lived token through the redirect and refreshes it itself.

Opening that same URL in a browser shows a connect page with a setup recipe for each client — Cursor, Claude Code, ChatGPT and Codex, VS Code, and any other MCP client. The panel shows the same recipes: the **MCP connections** resource replaces "Create new" with a **Connect a client** link, since a connection is only ever created by a client arriving at the authorize page.

:::info The name is the client's claim; the domain is the evidence
The consent screen leads with the client's own product name, because that is the string a person can match against the thing they just launched — and then says, in the same sentence, that the panel has not reviewed or verified it, and prints the origin of the client identifier.

A name is whatever a client puts in its own metadata, so an attacker can publish one calling itself Claude Code. The origin is the one attribute they would have to control a domain to forge. Read the sentence under the heading, not only the heading.
:::

A client that published no verifiable identity — one that registered itself rather than serving a metadata document — has to be attested to (*"I started this connection myself"*) before the page will approve anything. Declining never requires that.

Only **public clients** connect. A client offering only confidential authentication methods is refused on the authorize page with `invalid_client`, naming what it offered.

## Choose what a connection may do

Three capabilities cover the whole surface. Write means create, update **and** delete, as in the [REST API](./rest-api.html). Read and write are granted for every resource the admin can see, or narrowed to named resources through the authorize page's **Choose per resource** option; run actions is a global toggle.

| Capability                     | Scope                              | Tools it unlocks                                                     | At consent      |
| ------------------------------ | ---------------------------------- | -------------------------------------------------------------------- | --------------- |
| Read                           | `avo:read`, or `avo:read:<Resource>`   | `list_resources`, `list_records`, `show_record`, `search_records`, `list_actions` | Selected        |
| Read & write                   | `avo:write`, or `avo:write:<Resource>` | `create_record`, `update_record`, `delete_record`                     | **Not** selected |
| Run actions                    | `avo:actions`                      | `run_action`                                                          | **Not** selected |

A narrowed grant stores one scope per resource and level (`avo:read:Post`, `avo:write:Post`; write carries read) and holds everywhere:

- `list_resources` lists only the granted resources, each with its access level.
- A tool naming an ungranted resource is refused before any record loads, with a `requiredCapability` like `"avo:read:Order"`.
- `search_records` without a resource searches only the granted ones.
- An association pointing at an ungranted resource is **absent** from `show_record`'s payload, not null.
- Run actions over a narrowed read means "on those resources".

A connection cannot be widened in place: when a client is refused with a scoped `requiredCapability`, the fix is re-authorizing with that resource included.

:::warning Write and run actions are unselected on purpose
An agent cannot reliably tell data apart from instructions aimed at it, so any text reaching a record the admin can read — a signup name, a ticket body, a customer note — can steer it.

Neither tool pauses: `run_action` runs immediately and `delete_record` deletes immediately, with no proposal step and nothing for a human to click. **Granting the capability at consent is the confirmation**, collected once, in advance, for every call that connection will ever make. There is no live feed of what a connected agent is doing.
:::

## Every call stays inside the admin's own permissions

Two gates, in this order:

1. **Capability gate** — not granted (globally, or for the resource the call names), refused before any data is touched, and the error names the missing capability.
2. **Avo's authorization** — the owning admin is re-resolved from your app on every request, and the operation runs through your own policies.

A connection can therefore never do anything its owning admin couldn't do by hand. Granting a capability is permission to *try*; the policy still decides. Because the admin is re-resolved per request, a permission change takes effect on the next tool call — demote an admin to read-only and their connected client stops writing, with nobody revoking anything.

### Keep a field out of a client's reach

[Field `visible:` blocks](./field-options-api.html#visible) apply to reads *and* writes. A field hidden from this admin is not returned by `show_record`, `list_records`, or `search_records`, is not named by `list_resources`, and **cannot be written** even on a record they may otherwise edit. Read-only fields are refused the same way.

Two more sets are never writable whatever the policy says: `id` / `created_at` / `updated_at`, and any column whose name looks credential-shaped (`password`, `token`, `secret`, `digest`). A refused attribute fails the call rather than being quietly dropped.

The converse is the rule too: a field the panel **does** render this admin is returned, credentials included. If a resource renders `api_token`, `show_record` returns it.

:::info There is no MCP-only redaction list
To keep something out of an AI client's reach, put a `visible:` block on that field — the same one that hides it from a person. That is deliberate: a second, MCP-specific list of hidden fields would be one more thing to keep in sync with the first, and the one people forget.
:::

## Review and revoke connections

Connections appear in the panel as the **MCP connections** resource (`Avo::Resources::McpConnection`), at `<avo-root>/resources/mcp_connections` and in the sidebar. It shows the client name and id, the **Owner** the connection acts as, when it was authorized, and when it was **last used** — that last one is what answers *"was this connection ever actually used?"* after a suspected token theft.

A connection's page carries its status as chips by the title, and below the fields a **Tools** card listing every registered tool by the name a client's own transcript prints — `list_records`, `run_action` — **grouped by capability**, so a grant can be read as the calls it turns into. A capability the grant withholds keeps its group, muted and headed *not granted*, because *"why can it not do X?"* is what the screen gets opened for.

**Revoke** is an action on the resource, run from the actions menu on the index or on a connection's page. It takes effect on the next tool call and notifies nothing. Connections are never edited or deleted from the panel, and the resource is excluded from the MCP tools, so a client cannot list connections or run Revoke through `run_action`.

Optionally link it into your profile menu — this renders only if you have the [avo-menu](./menu-editor.html) add-on installed:

```ruby
# config/initializers/avo.rb
config.profile_menu = -> do
  link_to "MCP connections",
    path: Avo::Engine.routes.url_helpers.resources_mcp_connections_path,
    icon: "plug-connected"
end
```

Without avo-menu, the sidebar entry and `<avo-root>/resources/mcp_connections` both reach it. To keep it off the sidebar, set `Avo::Resources::McpConnection.visible_on_sidebar = false` in a `to_prepare` block. A host with an explicit `config.resources` array must add `"Avo::Resources::McpConnection"` to it.

### Authorize who can manage connections

**The gem ships no policy and no scoping for the resource** — authorization is yours, exactly as for any other resource. Without a policy, Avo's defaults apply: with `explicit_authorization = false` every admin sees, opens, and may revoke every connection; with `explicit_authorization = true` the resource is hidden until a policy answers `index?`.

Write `Avo::McpServer::ConnectionPolicy` to decide. Owners see everything, everyone else sees their own:

```ruby
# app/policies/avo/mcp_server/connection_policy.rb
class Avo::McpServer::ConnectionPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      user.admin? ? scope.all : scope.where(user: user)
    end
  end

  def show? = record.user == user || user.admin?

  def act_on? = show?

  # The model refuses all three anyway; this hides the controls.
  def create? = false

  def edit? = false

  def destroy? = false
end
```

`Scope#resolve` decides the list, `show?` and `act_on?` decide the record and the Revoke action — `act_on?` is asked once with the class and then per selected record.

## Pin the server address

By default every document, the audience stamped on issued tokens, and the audience checked on incoming calls read the origin the request arrived on plus the mount path. Pin [`resource_identifier`](./mcp-api.html#resource_identifier) to one fixed public URL when the panel answers at more than one origin, or a proxy hides the public origin from the app:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.mcp_server.enabled = true
  config.mcp_server.resource_identifier = "https://app.example.com/avo/mcp" # [!code focus]
end
```

Once pinned it is a constant every surface reads, and a request arriving at any other origin is answered `421`.

:::warning `at:` and a pinned `resource_identifier` must agree
With `resource_identifier` set, the path you mount at must match the path inside it, or boot raises. That is the good outcome: the alternative is discovery happily advertising endpoints that 404, which looks from the client's side like the connection dying at token exchange with no error text.
:::

A few sharp edges worth knowing before you deploy:

- **Plain `http` is refused outside development.** A non-loopback `http://` identifier is refused at boot, and a derived `http://` address on a non-loopback host is refused per request — bearer tokens and codes would be in the clear. `localhost` and `127.0.0.1` keep `http` for development.
- **Behind a TLS-terminating proxy, forward scheme and host.** A proxy that hides the original leaves the app seeing `http` and an internal host. Forward `X-Forwarded-Proto` / `X-Forwarded-Host` and allow the public host in `config.hosts`, or pin `resource_identifier`.
- **Changing the address is a migration.** Existing tokens are bound to the address they were minted under, so after a change every live connection's next call is `421` by design and admins reconnect through the authorize page. Announce it.
- **Disabling keeps the connections resource.** `enabled = false` returns 404 from every protocol endpoint and the consent screen, but the MCP connections resource belongs to the panel, not the server — so you can still revoke during an incident. Only new connections are blocked.

## Rate limiting

The authorize, token, and registration endpoints are rate-limited per IP with fixed ceilings. The JSON-RPC tool endpoint is rate-limited **per connection**, through [`tool_calls_per_minute`](./mcp-api.html#tool_calls_per_minute) (default `300`), and answers `429` with a `Retry-After` header over it:

```ruby
# config/initializers/avo.rb
config.mcp_server.tool_calls_per_minute = 600
```

All of it runs through `Rails.cache`, which is worth checking before you rely on the numbers: on `:null_store` there is effectively **no limit** on any of them; on a per-process store such as `:memory_store` each worker keeps its own counter, so the real ceiling is the configured value times the worker count; and behind a proxy that collapses client IPs the per-IP limits share one bucket. A shared, incrementing store (Redis or Memcached) is what makes the numbers mean what they say.

## Audit logging

With [Audit Logging](./audit-logging.html) installed and enabled, a change made through a connection is recorded against the admin who authorized it — and is deliberately **indistinguishable** from the same change made by hand in the panel. The log tells you *who* a change belongs to, not *what* made it.

Audit logging is optional; without it the tools still work and nothing is recorded.

## Triage errors a client reports

Refusals come back as JSON-RPC errors with a numeric `code`, a message, and a `data` object. The [full table is in the reference](./mcp-api.html#error-codes); these are the ones worth knowing by heart:

| Code     | Means                                              | First thing to check                                     |
| -------- | -------------------------------------------------- | -------------------------------------------------------- |
| `-32000` | Capability not granted                             | The consent selection — re-authorize with the capability |
| `-32001` | Capability granted, the admin's policy said no     | Your policy for that admin                               |
| `-32002` | Authorization isn't being enforced, nothing tried  | **The license** — both add-ons must be enabled           |

A record outside the admin's policy scope reports as **not found** (`-32602`), identical to an id that never existed — a row's existence is worth keeping secret, and a different error would turn every read tool into a probe for hidden records. A resource they may not list reports as **unauthorized** (`-32001`) and says so, because the caller already sees the sidebar and a fixable answer beats a wild goose chase. The asymmetry is deliberate.

A client that **connects but lists no tools** is a different failure. The connection and the OAuth exchange both succeeded; what failed is the client's schema check on the `tools/list` result, and from the server's side every request returned 200. Ask the client what it rejected — `claude mcp list` prints the validation error — rather than reading the server's logs, which show nothing wrong.

:::info Credentials are filtered from logs; `_meta` is not
The engine filters `code`, `code_verifier`, `refresh_token`, `access_token`, and `client_secret` by default. The filter is name-anchored, so `country_code` stays readable.

The client `_meta` object — which some clients fill with end-user geolocation — is left in, because it also carries protocol-debugging data. To drop it, add `config.filter_parameters += [:_meta]`.
:::

## Protocol support

The server is written to MCP revision `2026-07-28` (the stateless lifecycle, `server/discover`) and serves the classic `initialize` lifecycle as well, so clients on `2025-11-25` and earlier — Claude Code and Cursor today — connect too.

A classic client negotiates a revision through `initialize` and sends `Mcp-Protocol-Version` afterwards; a modern client sends the `_meta` envelope and the routing headers on every request, and is refused for a version outside `2026-07-28`.

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
end
```

## Options reference

| Option                                                          | Type      | Default |
| --------------------------------------------------------------- | --------- | ------- |
| [`enabled`](./mcp-api.html#enabled)                             | `Boolean` | `false` |
| [`resource_identifier`](./mcp-api.html#resource_identifier)     | `String`  | `nil`   |
| [`tool_calls_per_minute`](./mcp-api.html#tool_calls_per_minute) | `Integer` | `300`   |

Every option, the route helper, the generator, the nine tools, and every error code are described in the [MCP Server reference](./mcp-api.html).
