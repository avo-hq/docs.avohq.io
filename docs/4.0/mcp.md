---
license: addon
addon_link: https://avohq.io/addons/mcp-server
betaStatus: "Beta"
outline: [2, 3]
---

# MCP Server

The `avo-mcp_server` add-on turns your Avo panel into a remote [MCP](https://modelcontextprotocol.io) server, so an AI client like Claude or ChatGPT can browse and manage your admin data in natural language. An admin connects by pasting your app's MCP server URL into their client and approving a consent screen served by your own panel — no credential is ever copied by hand — and everything the client does afterwards runs as that admin, under the policies they already have.

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.mcp_server.enabled = true
  config.mcp_server.resource_identifier = "https://app.example.com/avo/mcp"
end
```

The server is **off by default**. Adding the gem to your `Gemfile` changes nothing until you enable it, mount it, and hold a license for both this add-on and [Authorization](./authorization.html).

## Requirements

- Avo `>= 4.0`
- A license for this add-on **and** for the [Authorization](./authorization.html) add-on. Both must be enabled on the license — see [Authorization has to be licensed](#authorization-has-to-be-licensed).
- The panel reachable over HTTPS at a stable public URL. Consent and token exchange happen in the admin's browser, from the client's side of the internet.
- An MCP client that supports **remote** servers with OAuth authorization. Verified at launch against Claude and ChatGPT.

:::info Remote clients only
There is no local (stdio) transport and no shared token to paste into a client's config file. A local process can't be redirected to a consent page, so every connection is made over the network and goes through the panel's authorize page in a browser. A client that can only launch a local command cannot connect.
:::

:::warning Protocol revision `2026-07-28`
The server implements MCP revision **`2026-07-28`**, and only that revision. That revision removed protocol sessions and the `initialize` handshake, added the mandatory `server/discover` call, and made `resultType` required on every result — so a client still speaking `2025-11-25` or earlier has no version to negotiate and the connection fails before the first tool call.

If a client refuses to connect and you've ruled out the URL, check which revision it speaks before anything else.
:::

## Installation

### 1. Install the gem

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

This creates the `avo_mcp_server_*` tables — the connections admins authorize, the single-use codes they're created through, and the tokens issued against them — and appends the configuration block to `config/initializers/avo.rb`.

### 3. Mount the protocol endpoints

```ruby
# config/routes.rb
Rails.application.routes.draw do
  mount_avo_mcp_server # [!code ++]

  authenticate :user do
    mount_avo
  end
end
```

`mount_avo_mcp_server` draws four things: the two OAuth discovery documents, always at the origin root because the protocol requires them there; the client registration endpoint, which is unauthenticated by design so clients that don't support metadata documents can still register; the token endpoint; and the JSON-RPC endpoint clients call, at `/avo/mcp` by default. Pass `at:` to serve the JSON-RPC endpoint somewhere else.

:::warning `at:` and `resource_identifier` must agree
If you pass `at:`, the path must match the path in `resource_identifier`. Booting with the two out of step raises a configuration error rather than starting, because the alternative is worse: discovery keeps answering while the endpoints it advertises return 404, which looks from the client side like the connection dying at token exchange with no error text.
:::

The authorize page and the connections screen are not part of this — they're mounted with the panel, so they inherit your existing sign-in. The connections screen sits in Avo's chrome with the rest of your admin; the authorize page gets a dedicated full-page layout with no sidebar or navbar, because it's a decision about something outside your app and a panel full of links is both the wrong context and a way to abandon a flow the client is still waiting on.

:::danger Mount it outside your authentication block
If `mount_avo` lives inside an `authenticate :user do … end` block, `mount_avo_mcp_server` **must** be mounted outside and before it. A connected client calls the token and JSON-RPC endpoints with a bearer token and no browser session, so putting them behind your web session guard makes every call fail.

This doesn't leave anything unauthenticated. Those endpoints authenticate themselves against the token the client holds, and an unauthenticated call is answered with a `401` that points the client at the consent flow.
:::

### 4. Enable the server

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.mcp_server.enabled = true # [!code ++]
  config.mcp_server.resource_identifier = "https://app.example.com/avo/mcp" # [!code ++]
end
```

:::warning `resource_identifier` is a constant, not something derived from the request
It must be the full public URL of your JSON-RPC endpoint — the same URL an admin pastes into their client. The `resource` field of the discovery document, the audience stamped on every token issued, and the audience checked on every incoming call all read from this one value, and they have to agree byte for byte.

That's why it isn't derived from the request. Host, scheme, and forwarding headers drift behind a proxy, differ between the discovery hit and the token hit, and let a caller influence the audience it's then checked against. A request arriving on a host that doesn't match is refused with a clear error rather than failing discovery silently, which is the failure mode you want here — a discovery mismatch surfaces client-side as nothing at all.
:::

## Connect an AI client

1. Copy your app's MCP server URL — the value of `resource_identifier`, also shown on the connections screen in the panel.
2. Add it to the AI client as a remote MCP server.
3. The client sends the admin to an authorize page served by your own panel. If they aren't signed in, they go through your normal Avo sign-in and come back.
4. They review who is asking, pick the capabilities to grant, and approve.
5. The client is connected.

Nothing is copied by hand at any point. The client obtains a short-lived token through that redirect and refreshes it on its own, and declining creates nothing at all.

### Which clients can connect

The server authenticates clients as **public clients**: no shared secret, identity established by the metadata document the `client_id` URL serves, and the code protected by PKCE. Its authorization server metadata says so, advertising `token_endpoint_auth_methods_supported: ["none"]`.

A client's own document names a *preferred* method in `token_endpoint_auth_method` and may list everything it can do in `token_endpoint_auth_methods_supported`. A client that can be public is accepted even when it would rather be something stronger — ChatGPT, for instance, prefers `private_key_jwt` and lists `["none", "private_key_jwt"]`, so it connects as a public client. A client offering nothing but confidential methods is refused on the authorize page, before anything is created, rather than at the token endpoint: accepting the declaration and then ignoring it would issue a token to a client that believes it authenticated with an assertion nobody checked.

### What the authorize page shows

- **A pair of marks** — the client on the left, your panel's own logomark on the right. The right one is `Avo.configuration.appearance.logomark` (and `logomark_dark` when you set one), so it's your branding, not Avo's, wherever you've configured it.

  The client's mark is, in order: the logo its metadata document publishes as `logo_uri`; failing that, the favicon of its **verified domain**; failing that, the client's initial. That middle step is deliberately derived from the verified origin rather than from any field the document supplies — a document served from `evil.example` can only ever put `evil.example`'s icon on the screen, next to a verified domain that reads `evil.example`. Taking it from a document field would let an attacker pair someone else's mark with a name they also chose, which is a far more convincing forgery than a name alone.

  Whichever it is, **your app fetches it and serves it back** — the browser is never pointed at the client's domain. Pointing it there fails invisibly behind a content blocker or an extension, and once the page has committed to an `<img>` there is no falling back to the initial. It also means the admin's browser makes no request to a third party at all while it's deciding whether to trust that third party. Only raster types are accepted (an `image/svg+xml` favicon served back from your own origin would be script on your domain), the result is cached for 12 hours including misses, and a favicon host being down can never take the consent screen with it.

:::info The client mark needs a cache store
Icons are held in `Rails.cache`. On `:null_store` — which is what `bin/rails dev:cache` leaves you with in development — nothing can be stored, so the mark falls back to the client's initial and no icon is fetched at all. That's deliberate: handing the browser a URL your app can't serve would be a permanent broken image.
:::
- **The client's own product name**, in the heading: "Claude Code would like access to your admin panel". It's the string an admin can match against the thing they just launched.
- **Two facts, as labelled values rather than prose** — the **verified domain** (the origin of the client's identifier), and where the browser **redirects to** afterwards. A loopback callback is named as what it is: a program running on the machine you're sitting at. If the callback is on a domain other than the one the client was verified against, the page says so — a metadata document may list a redirect URI on any origin, so the origin can be telling the truth about who published the document while saying nothing about where the code goes.
- The admin identity currently signed in — the person the connection will act as.
- The four capabilities, as checkboxes. Delete and run actions are marked destructive, and ticking either reveals a line explaining what that specific grant means.

A client that registered itself rather than publishing a metadata document has no verifiable identity at all. The page still names it in the heading — that's what the admin recognizes — but there is no domain to print beside it, and its mark is ringed in amber. That variant also arrives with **read** ticked and nothing else, and adds one checkbox — *I started this connection myself, from a client I recognize* — which must be ticked before the page will approve anything. Declining never requires it.

:::warning The name is the client's claim; the domain is the evidence
A client's display name is whatever it puts in its own metadata, so an attacker can publish a document that calls itself Claude Code and ask for delete access. The page names it anyway, because a name is what a person can match against the thing they just launched — and prints the **verified domain** directly underneath. That domain is the one attribute they'd have to control to forge.

A heading reading *Claude Code* over a verified domain reading `totally-not-evil.example` is the whole check. Read both, especially on a request that asks for delete or run actions.
:::

## Choose what a connection can do

Four capabilities cover the whole surface. They're global: a capability applies across every resource, and there's no per-resource or per-action selection.

| Capability            | Scope         | Tools it unlocks                                                                  | At consent     |
| --------------------- | ------------- | --------------------------------------------------------------------------------- | -------------- |
| **Read**              | `avo:read`    | `list_resources`, `list_records`, `show_record`, `search_records`, `list_actions` | Selected       |
| **Create and update** | `avo:write`   | `create_record`, `update_record`                                                  | Selected       |
| **Delete**            | `avo:delete`  | `delete_record`                                                                   | *Not* selected |
| **Run actions**       | `avo:actions` | `run_action`                                                                      | *Not* selected |

A capability can only ever narrow what a connection may do. Granting delete doesn't let the connection delete anything its owning admin couldn't delete by hand — see [Every call stays inside the admin's own permissions](#every-call-stays-inside-the-admin-s-own-permissions).

:::danger Granting delete or run actions accepts a prompt-injection risk
An AI agent can't reliably tell your data apart from instructions aimed at it. Any text that reaches a record the connected admin can read — a signup name, a support ticket body, a customer note — is read by the agent as part of its input, and text written to look like an instruction can steer it. With delete or run actions granted, that steering can end in destructive tool calls made under the admin's own identity and permissions.

Nothing in this release detects or prevents that:

- there is no live feed showing what a connected agent is doing while it does it;
- the audit entry is deliberately indistinguishable from the admin's own panel activity, so it can't be attributed to the agent afterwards either.

Nor does the tool itself pause. `run_action` runs the action immediately, and `delete_record` deletes immediately — there is no proposal step, no second confirmation, and nothing for a human to click. Granting the capability at consent **is** the confirmation, collected once, in advance, for every call the connection will ever make. That is precisely why those two are unselected by default.

This is a documented, accepted limitation rather than an oversight, and the mitigation is the consent screen itself: delete and run actions are unselected by default, so granting them is always a deliberate act. Grant them to clients you trust, on data you control, and keep everything else read-only.
:::

## Available tools

The server exposes nine tools covering the full range of admin operations.

### Read-only tools

| Tool             | Description                                                                   |
| ---------------- | ----------------------------------------------------------------------------- |
| `list_resources` | Discover all available Avo resources with field definitions and record counts |
| `list_records`   | List records from a resource with pagination, sorting, and filtering          |
| `show_record`    | Show a single record's full details including associations                    |
| `search_records` | Search across one or all resources using the configured search query          |
| `list_actions`   | Discover available actions for a resource                                     |

### Mutating tools

| Tool            | Description                                   |
| --------------- | --------------------------------------------- |
| `create_record` | Create a new record with attribute validation |
| `update_record` | Update an existing record's attributes        |
| `delete_record` | Delete a record                               |
| `run_action`    | Execute an Avo action on one or more records  |

### Arguments each tool takes

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

`resource` is always a resource name as `list_resources` reports it — `"Post"`, not a table name — and `id` is the record's primary key, accepted as a string or an integer.

Paging is 1-based. `per_page` defaults to 25 and is capped at 100, and `search_records`' `limit` behaves the same way, per resource searched. `sort_by` has to name a real column on the model; it's checked against the model's columns rather than passed through to SQL, and a name that isn't one is refused with the list of columns that are. `sort_direction` is `asc` or `desc`. Leave either out and the resource's own default sorting stands.

`attributes` on `create_record` and `update_record` is an object mapping field names to values. Use the field names `list_resources` reports or the raw column names — a `belongs_to` can be written either way, as `user` or as `user_id`. `update_record` changes only the attributes you pass and leaves the rest alone.

`run_action` takes the `action` id from `list_actions` (the class name, e.g. `"Avo::Actions::TogglePublished"`), and `fields` is the same object shape for that action's inputs, keyed by the input names `list_actions` reports. An input you leave out falls back to the action's own default. `record_ids` is the set of records to act on: a standalone action takes none and is refused if given any, and every other action needs at least one. Every id is authorized individually, so a partly-allowed batch is refused rather than partly run.

### What a record's associations look like

`show_record` returns associations as something an agent can follow, not as nested records. A `belongs_to` comes back as the record it points at — its id and a human title — so naming it doesn't cost a second call. A `has_many` comes back as a count plus up to 25 ids.

Those ids are already narrowed by the associated model's own policy scope. An association is a second read path into a different resource, and without that scoping, `show_record` on a parent would be the way around `list_records` on the child.

### Searching a resource that has no search configured

`search_records` runs each resource's own `self.search` block — the same search the panel's search box runs — and has nothing else to fall back on.

Naming such a resource directly is an error. In an all-resource search it's skipped and reported under `unsearchable` in the result, so a client can tell "no matches" apart from "not searchable" and reach for `list_records` instead.

It never falls back to returning the resource's records. That fallback is the tempting one, and it would turn "this resource can't be searched" into "here is everything in it" — silently widening the widest read surface the add-on has.

## Every call stays inside the admin's own permissions

Every tool call passes two gates, in this order:

1. **The capability gate.** If the connection wasn't granted the capability the tool needs, the call is refused before any data is touched, and the error names the missing capability.
2. **Avo's authorization.** The owning admin is re-resolved from your app on every request, and the operation runs through your Avo authorization for that admin — the same policies the panel uses.

A connection therefore can never do anything its owning admin couldn't do by hand in the panel. Granting a capability is permission to *try*; the policy still decides.

Because the admin is re-resolved on every request, a change to their permissions takes effect on the connection's next tool call. Demote an admin to read-only and their connected client stops being able to write, with nobody revoking or re-authorizing anything.

### Field visibility applies to reads *and* writes

Those two gates decide whether an admin may touch a **record**. Which of its **fields** they may touch is a separate decision, made by the same `visible:` blocks your resources already declare — and it applies in both directions.

A field the panel hides from this admin is not returned by `show_record`, `list_records`, or `search_records`, and `list_resources` doesn't name it among the resource's fields either. Naming a field the admin can't see would hand an agent a column it's about to be refused on, which reads as a bug rather than as a permission.

The converse holds too, and it is worth stating because it looks like an oversight when you first meet it: a field the panel **does** show this admin is returned, whatever it holds. If a resource renders an API token, `show_record` returns that token. The connection can do no more than the account can — and no less, because a read tool that quietly withheld fields the panel displays would be lying about what the admin can see.

:::warning A field a person can read, an AI client can read
That includes credentials. If a resource renders `api_token` and an admin can see it in the panel, a connection acting as that admin can read it too, and an AI client acts on the text it reads.

The lever is the one you already have: hide it with a `visible:` block, and it disappears from both at once. There is no MCP-only redaction list to maintain, deliberately — a second place to declare what is secret is a second place to forget.
:::

The same field also **cannot be written**, even on a record they may otherwise edit. An admin can pass `update?` on a record and still be refused a column their own panel doesn't render for them — that is what a `visible:` block on a field means, and a tool that checked only the record-level policy would let an agent write straight past it. A field the panel renders read-only is refused for the same reason.

Writes are deliberately **stricter** than reads on one point: an attribute whose name looks like a credential (`password`, `token`, `secret`, `digest`) is refused even when the panel renders it and the admin may edit it. Reading one is the admin's own visibility decision; rewriting one through a connection is not something a `visible:` block was ever asked to authorize.

Two more sets of columns are never writable, whatever the policy says: the system-managed `id`, `created_at`, and `updated_at`, and any column whose name looks like it holds a credential (`password`, `token`, `secret`, `digest`).

A refused attribute is never quietly dropped. The call fails, and the error names both what was refused and what this admin can actually write — an ignored attribute reads to an agent as a write that happened, and the next thing it does is report success.

### Authorization has to be licensed

:::danger `avo-authorization` must be licensed, not merely installed
Policy enforcement lives in the [Authorization](./authorization.html) add-on. Its service checks your license before it checks a policy: when `avo-authorization` isn't among the license's enabled features, it skips authorization entirely and returns `true` for every check. (Avo core ships a same-named service that also returns `true` unconditionally — it's a stub, and it is not what enforces anything.)

`avo-mcp_server` depends on the authorization gem, but a gemspec dependency only puts code on the load path. **It grants no entitlement.** A panel licensed for MCP but not for Authorization would authorize every tool call unconditionally — failing open in exactly the deployment where an admin believes their policies still apply.

Rather than degrade quietly, the server refuses to serve tool calls at all unless **both** features are licensed, and answers with a configuration error. If clients connect successfully but every call comes back as a configuration error, check the license first.
:::

## Review and revoke connections

The panel lists an admin's connections with the client name, the capabilities granted, when it was authorized, and when it was last used. That last-used timestamp is what answers "was this connection ever actually used?" after a suspected token theft. The screen also shows the server URL, so an admin connecting a second client doesn't need this page to find it.

Revoking takes effect on the next tool call: the client's tokens stop validating, and reconnecting means a fresh trip through the authorize page.

Admins see and revoke their own connections. Because listing and revoking run through Avo's authorization, you can widen that with a policy — an owner-level admin who sees every connection in the app, say — without this add-on inventing a role of its own.

Access tokens are short-lived and refreshed by the client with no admin involvement. The connection itself lasts until someone revokes it.

### Rate limiting

Two separate limits protect this server, and both ride on `Rails.cache`.

The authorize, token, and client registration endpoints are rate-limited **per IP**. They're reachable by anyone who knows your panel's URL, so this bounds what an unauthenticated caller can do with them.

The JSON-RPC endpoint — the one a connected client calls for every tool — is rate-limited **per connection**, defaulting to 300 calls a minute. This bounds a runaway or stolen-token client server-side, where before it faced nothing but your own proxy, if you had one. Over the limit, the endpoint answers `429 Too Many Requests` with a `Retry-After` header naming the window. Size the ceiling to your own heaviest legitimate agent with `config.mcp_server.tool_calls_per_minute` — this one bounds your own work, not a stranger's.

:::warning Both limits ride on your cache store
Rate limiting uses `Rails.cache`, and a store that doesn't count across processes makes both limits soft:

- On a **null store** — what `bin/rails dev:cache` leaves you with in development — nothing is counted, so there is no limit at all: neither the per-IP endpoints nor the per-connection JSON-RPC ceiling throttles anything.
- On a **per-process store** (`:memory_store`), each worker keeps its own counter, so the real ceiling is your configured limit multiplied by the worker count.
- Behind a proxy that collapses client IPs, the per-IP limits put legitimate traffic in one bucket.

Give the server a shared, incrementing cache — Redis or Memcached — for the limits to mean what they say.
:::

## Running it in production

A few operational facts that only bite once the server is live behind real infrastructure.

### Behind a proxy or load balancer

The server checks that each request actually arrived at `resource_identifier` — same scheme, host, and port. It's the audience check: a bearer token is only good for the one URL it was issued for. Behind a TLS-terminating proxy that doesn't pass the original scheme and host through, the app sees `http` and an internal hostname, the check fails, and every machine endpoint answers `421 Misdirected Request` while the connections screen shows a mismatch banner.

The fix is the standard Rails proxy setup, not anything specific to this add-on:

- Forward `X-Forwarded-Proto` and `X-Forwarded-Host` from the proxy.
- Allow the public hostname in `config.hosts`.

:::warning Plain `http` is refused outside development
A `resource_identifier` on plain `http://` is refused at boot for any host that isn't `localhost` or `127.0.0.1` — bearer tokens and authorization codes would travel unencrypted. Use `https://` in production; the loopback exception is only so local development works.
:::

### Changing `resource_identifier` is a migration

Every issued token is bound to the `resource_identifier` it was minted under, as its audience. Change the value — a new domain, a new mount path — and every existing connection's next call is refused with `421 Misdirected Request`. This is the audience binding doing its job, not a bug. Existing admins reconnect through the authorize page; there's no in-place rewrite of live tokens. Treat an identifier change as a migration you announce, not a config tweak.

### If you forget to mount

If `config.mcp_server.enabled` is `true` but `mount_avo_mcp_server` isn't in your routes, the protocol endpoints simply don't exist — discovery, token, and JSON-RPC all `404`. The server catches this: it logs a warning at boot, and the connections screen tells you the endpoints are unmounted instead of printing a server URL that leads nowhere. If a client can't discover the server, check that line in your routes first.

### Turning it off keeps the revoke screen

`config.mcp_server.enabled = false` shuts down every protocol endpoint and the consent screen — they `404` — but leaves the connections screen reachable. That's deliberate: disabling the server is a plausible first move when you're investigating a suspected leak, and you still need to see what's connected and cut it off. Revocation works while the server is disabled; only new connections are blocked.

### What's kept out of your logs

The engine filters the OAuth credential parameters — `code`, `code_verifier`, `refresh_token`, `access_token`, `client_secret` — from your request logs by default. Nothing to configure; it's added when the engine loads. The filters are name-anchored, so your own `country_code` or `zip_code` parameters stay readable.

One thing is **not** filtered by default: the `_meta` object some clients attach to each call. It's useful for debugging the protocol, but clients like ChatGPT put the end user's coarse geolocation in it, which then lands in your logs. If you'd rather it didn't, filter it yourself:

```ruby
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [:_meta]
```

### Linking the connections screen into your panel

The installer prints a snippet for a profile-menu entry pointing at the connections screen:

```ruby
# config/initializers/avo.rb, inside Avo.configure
config.profile_menu = -> do
  link_to "AI connections",
    path: Avo::McpServer::Engine.routes.url_helpers.connections_path,
    icon: "plug-connected"
end
```

A custom profile menu renders only if you have the [Menu editor](./menu-editor.html) add-on installed. Without it, reach the screen at `<your-avo-path>/mcp_server/connections` directly, or render the `avo/partials/_profile_menu_extra` partial, which Avo shows unconditionally.

## Trace changes back to an admin

When [Audit Logging](./audit-logging.html) is installed and enabled, a change made through a connection is recorded against the admin who authorized that connection.

The entry is deliberately indistinguishable from the same change made by hand in the panel — this release adds no MCP-specific marker. The audit log tells you **who** a change belongs to, not **what** made it. Read that together with the [prompt-injection note](#choose-what-a-connection-can-do) above.

Audit logging is optional here. With the add-on absent or disabled, tools still work and nothing is recorded.

## Errors a client receives

Refusals come back as JSON-RPC errors rather than as exceptions or as a successful result carrying an error flag. Every one has a numeric `code`, a human-readable `message`, and a `data` object with the detail a client can act on.

| Code     | When it occurs                                                                  |
| -------- | ------------------------------------------------------------------------------- |
| `-32000` | The connection wasn't granted the capability this tool requires                 |
| `-32001` | The capability was granted, but the owning admin's policy forbids the operation |
| `-32002` | Authorization isn't being enforced, so nothing was attempted                    |
| `-32003` | The model rejected the write — a failed validation, or a `destroy` that halted  |
| `-32004` | The named resource has no `self.search` configured, so there's nothing to search |
| `-32005` | The resource isn't backed by an Active Record model — an array resource, usually |
| `-32602` | The tool, resource, or record doesn't exist, or an argument names something the resource doesn't have |
| `-32020` | An `Mcp-Method`, `Mcp-Name`, or `Mcp-Protocol-Version` header disagrees with the request body, or is missing |
| `-32022` | The request declared a protocol revision this server doesn't implement          |

The first six are Avo's own and sit in the `-32000` to `-32019` band that the MCP specification leaves to implementations. The rest are the specification's, so they mean the same thing here as on any other MCP server.

`-32000` is the one most agents meet first, since two of the four capabilities are unselected at consent by design. It names both the capability that was withheld and the ones the connection does hold, so the client can tell the admin exactly what to re-authorize:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "This connection was not granted avo:delete, which is required by delete_record.",
    "data": {
      "requiredCapability": "avo:delete",
      "grantedCapabilities": ["avo:read", "avo:write"]
    }
  }
}
```

It's checked before anything else, so a refused call never reads or writes a record.

`-32001` means the opposite: the capability was there, and your app's policy said no.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32001,
    "message": "The connected admin is not authorized to destroy Post.",
    "data": {
      "action": "destroy",
      "subject": "Post"
    }
  }
}
```

`-32002` is not about this call at all — it's the licensing problem described above, surfacing per request. It means no policy ran and none would have, so the server refused instead of answering. Check the license before looking at the tool or the record.

`-32003` is a write your own model refused: a validation that failed on `create_record` or `update_record`, or a `destroy` halted by a dependent record or a callback. Nothing was changed. Its `data` is shaped for an agent that should correct its own call rather than hand the failure back to the person who asked:

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

`requiredAttributes` is read off the real schema and model rather than guessed from field names — a `NOT NULL` column with no default, an unconditional presence validator, or a non-optional `belongs_to` — which is what makes `missingRequiredAttributes` worth acting on.

`-32004` and `-32005` both name the resource in `data.resource`. The first says the resource exists and every other read tool works on it, but nobody configured `self.search`, so search is the one thing it can't answer. The second says there's no database table behind the resource at all — an Avo array resource serves a hardcoded list — so there is nothing to query or write.

`-32602` covers everything a client got structurally wrong: an unknown tool, an unknown resource, a record it can't reach, and any argument naming something the resource doesn't have. In that last case the `data` carries the real list, which is what lets an agent fix its own call instead of giving up:

| The argument that didn't resolve                  | The list in `data` |
| ------------------------------------------------- | ------------------ |
| An attribute on `create_record` / `update_record` | `writableFields`   |
| The `action` on `run_action`                      | `availableActions` |
| An input name in `run_action`'s `fields`          | `availableInputs`  |
| `sort_by` on `list_records`                       | `sortableColumns`  |

An attribute refused for being system-managed, credential-shaped, or hidden from this admin comes back with `fields` naming the ones that were refused, rather than with the full writable list.

A result that isn't an error carries `"resultType": "complete"`, which the `2026-07-28` revision requires on every result.

### Not found versus unauthorized

A record outside the admin's policy scope reports as **not found** (`-32602`), identical to an id that never existed. A resource they may not list reports as **unauthorized** (`-32001`), and says so.

The asymmetry is deliberate, so nobody files it as an inconsistency. A row's existence is worth keeping secret: if a hidden id errored differently from a missing one, every read tool would become a way to test for records a policy hides, and that difference is the leak. A resource's existence isn't worth keeping secret — the caller is an administrator of this panel who can already see the sidebar, so hiding one buys nothing, while answering "you may not list Users" instead of "no such resource" is the difference between a fixable answer and a wild goose chase.

A resource name no resource answers to is a `-32602` either way, and points at `list_resources` as the way to find the real one.

## Options reference

These options live under `config.mcp_server` inside `Avo.configure`, in `config/initializers/avo.rb`.

| Option                | Type      | Default | Description                                                                                                                |
| --------------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| `enabled`             | `Boolean` | `false` | Turns the whole server on. Off by default — installing the gem never starts answering protocol requests on its own.         |
| `resource_identifier` | `String`  | `nil`   | **Required.** The canonical public URL of this MCP server, e.g. `"https://app.example.com/avo/mcp"`. Never request-derived. |
| `tool_calls_per_minute` | `Integer` | `300`   | Per-connection ceiling on JSON-RPC tool calls. Over it, the client gets `429` with `Retry-After`. Size it to your heaviest legitimate agent; it bounds your own workload, not an unauthenticated caller's. |
