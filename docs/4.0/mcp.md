---
license: addon
addon_link: https://avohq.io/addons/mcp-server
betaStatus: "Not yet released"
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

The authorize page and the connections screen are not part of this — they're mounted inside the panel with the rest of Avo's chrome, so they inherit your existing sign-in.

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

### What the authorize page shows

- **The origin of the requesting client's identifier**, as the primary identity.
- The client's display name, shown as *claimed by the client*.
- The admin identity currently signed in — the person the connection will act as.
- The four capabilities, as checkboxes.

:::warning Read the origin, not the name
Every attribute a client says about itself is unverified. A client's display name is whatever it puts in its own metadata, so an attacker can publish one that calls itself Claude and ask for delete access. The origin of the client identifier is the one attribute they'd have to control a domain to forge, which is why the page leads with it.

Check the origin before approving — especially on a request that asks for delete or run actions.
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

## Every call stays inside the admin's own permissions

Every tool call passes two gates, in this order:

1. **The capability gate.** If the connection wasn't granted the capability the tool needs, the call is refused before any data is touched, and the error names the missing capability.
2. **Avo's authorization.** The owning admin is re-resolved from your app on every request, and the operation runs through your Avo authorization for that admin — the same policies the panel uses.

A connection therefore can never do anything its owning admin couldn't do by hand in the panel. Granting a capability is permission to *try*; the policy still decides.

Because the admin is re-resolved on every request, a change to their permissions takes effect on the connection's next tool call. Demote an admin to read-only and their connected client stops being able to write, with nobody revoking or re-authorizing anything.

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

The authorize, token, and client registration endpoints are rate-limited per IP. They're reachable by anyone who knows your panel's URL, so this bounds what an unauthenticated caller can do with them.

:::warning The limit rides on your cache store
Rate limiting uses `Rails.cache`. On a host configured with `:null_store`, the limits are inert. Two consequences worth checking: if you sit behind a proxy that collapses client IPs, legitimate traffic shares one bucket; and if your cache is a null store, there is no limit at all.
:::

## Trace changes back to an admin

When [Audit Logging](./audit-logging.html) is installed and enabled, a change made through a connection is recorded against the admin who authorized that connection.

The entry is deliberately indistinguishable from the same change made by hand in the panel — this release adds no MCP-specific marker. The audit log tells you **who** a change belongs to, not **what** made it. Read that together with the [prompt-injection note](#choose-what-a-connection-can-do) above.

Audit logging is optional here. With the add-on absent or disabled, tools still work and nothing is recorded.

## Errors a client receives

All tools return structured errors rather than raising:

| Error type           | When it occurs                                                                  |
| -------------------- | ------------------------------------------------------------------------------- |
| `missing_capability` | The connection wasn't granted the capability this tool requires                 |
| `invalid_params`     | Required parameters are missing or invalid                                      |
| `not_found`          | The requested resource or record doesn't exist                                  |
| `not_authorized`     | The capability was granted, but the owning admin's policy forbids the operation |
| `validation_error`   | Record validation failed (includes field errors)                                |
| `internal_error`     | An unexpected error occurred                                                    |

`missing_capability` is the one most agents meet first, since two of the four capabilities are unselected at consent by design. It names the capability that was withheld, so the client can tell the admin what to re-authorize:

```json
{
  "error_type": "missing_capability",
  "capability": "avo:delete",
  "tool": "delete_record",
  "message": "This connection was not granted the delete capability."
}
```

It's checked before anything else, so a refused call never reads or writes a record.

`not_authorized` means the opposite: the capability was there, and your app's policy said no.

```json
{
  "error_type": "not_authorized",
  "action": "destroy",
  "message": "You are not authorized to perform this action."
}
```

## Options reference

Both options live under `config.mcp_server` inside `Avo.configure`, in `config/initializers/avo.rb`.

| Option                | Type      | Default | Description                                                                                                                |
| --------------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| `enabled`             | `Boolean` | `false` | Turns the whole server on. Off by default — installing the gem never starts answering protocol requests on its own.         |
| `resource_identifier` | `String`  | `nil`   | **Required.** The canonical public URL of this MCP server, e.g. `"https://app.example.com/avo/mcp"`. Never request-derived. |
