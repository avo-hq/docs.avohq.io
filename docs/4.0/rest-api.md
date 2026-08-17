---
license: addon
addon_link: https://avohq.io/addons/json-api
addon: avo-api
outline: [2, 3]
---

# REST API

The `avo-api` add-on exposes a JSON REST API for every Avo resource. It reuses your resources' field definitions, view visibility rules, and Pundit policies, so a resource you already built for the admin panel is available over HTTP — list, read, create, update, and delete.

This page covers installation, mounting, API tokens, authentication, token scopes, how the current user is established, authorization, and the request/response format.

:::info Add-on
The REST API ships as the separate `avo-api` gem. [See the add-on page →](https://avohq.io/addons/json-api)
:::

## Installation

Add the gem:

```ruby
# Gemfile
gem "avo-api", source: "https://packager.dev/avo-hq/"
```

```bash
bundle install
```

Then generate the controllers:

```bash
rails generate avo_api:generate
```

This creates one controller per Avo resource under `app/controllers/avo/api/resources/v1/`, plus a `BaseResourcesController` that all of them inherit from. The base controller is where you put authentication and any global customization.

:::danger The generator is required, not optional
The API's routes are drawn by globbing your app's `app/controllers/avo/api/resources/*` directory. If you never run the generator, that directory doesn't exist, the glob returns nothing, and **no API routes are drawn at all** — every request 404s. There is no catch-all controller that serves resources you haven't generated.

The same applies to resources you add later: generate a controller for each new resource, or it won't be reachable over the API.
:::

Pass `--version` to namespace under something other than `v1`:

```bash
rails generate avo_api:generate --version v2
```

### Install the API tokens table

Then install the credential store:

```bash
rails generate avo_api:install
rails db:migrate
```

This writes one migration, creating the `avo_api_tokens` table. There is no initializer setting, environment variable, or credential to add — the feature needs none.

:::info This step is additive
`avo_api:install` does not replace `avo_api:generate`. One delivers the resource controllers, the other the tokens table, and a working API wants both. Skip it only if your app brings its own credential scheme and wants no tokens at all — and then [replace the authentication hook](#bring-your-own-authentication) too, so nothing goes looking for a token that can't exist.
:::

## Mount the API

Add `mount_avo_api` to your routes. It mounts the API engine at `/api` by default.

```ruby
# config/routes.rb
Rails.application.routes.draw do
  mount_avo_api

  authenticate :user do
    mount_avo
  end
end
```

:::danger Mount the API outside your authentication block
If `mount_avo` lives inside an `authenticate :user do … end` block, `mount_avo_api` **must** be mounted outside and before it. Mounting the API inside the block forces every API request through your web session authentication, which breaks access for external clients.

This does not mean the API is unauthenticated — it authenticates itself (see [Authentication](#authentication)). It just must not inherit the web interface's session guard.
:::

```ruby
# ❌ Don't — the API inherits web session auth and external access breaks
Rails.application.routes.draw do
  authenticate :user do
    mount_avo_api
    mount_avo
  end
end
```

### Mount options

`mount_avo_api` accepts a mount path and forwards any option Rails' `mount` accepts.

```ruby
# config/routes.rb

# Mount under Avo's root path (e.g. /admin/api)
mount_avo_api at: "#{Avo.configuration.root_path}/api"

# Restrict to an api subdomain
mount_avo_api at: "/api", constraints: { subdomain: "api" }

# Add custom routes inside the API engine
mount_avo_api do
  get "health", to: "health#check"
end
```

## Endpoints

Each generated resource controller gets standard RESTful endpoints under `resources/v1`. For a `teams` resource mounted at the default `/api`:

```
GET    /api/resources/v1/teams        # List teams
POST   /api/resources/v1/teams        # Create a team
GET    /api/resources/v1/teams/:id    # Show a team
PATCH  /api/resources/v1/teams/:id    # Update a team
PUT    /api/resources/v1/teams/:id    # Update a team
DELETE /api/resources/v1/teams/:id    # Delete a team
```

The path segment is the resource's `route_key` (e.g. `blog_posts`, `product_categories`).

:::info API tokens are not served over the API
The token resource is skipped when routes are drawn, so no version namespace gets a `tokens` endpoint. Tokens are managed in the panel only — a credential can neither mint nor revoke credentials, and so cannot outlive being revoked.
:::

## Authentication

Every request runs through `setup_authentication`, a hook on `BaseResourcesController`. **The default implementation accepts a valid API token** and rejects everything else with `401 Unauthorized`:

```json
{ "error": "Unauthorized" }
```

Raise `Avo::Api::AuthenticationError` anywhere in the hook to reject a request with that response.

### Create a token

Once the [tokens table is installed](#install-the-api-tokens-table), an **API tokens** entry appears in the Avo sidebar. Create a token there with a name and, optionally, an expiry date.

The token belongs to whoever created it. The form has no owner field, and a token cannot be moved to another owner afterwards, so a crafted request cannot mint a credential belonging to somebody else.

**The secret is shown once**, on the new token's page immediately after creation, with a copy button. Only a digest of it is stored, so nothing can show it again — not a console, not a support tool, not a database dump. Miss it and there is no recovery beyond minting a replacement and revoking the one you lost.

What the list shows afterwards is a short leading slice of the secret (`avo_a1B2c3D4...`), enough to tell two tokens apart and far too little to guess one.

### Send the token

Present the secret as a bearer credential in the `Authorization` header, over HTTPS:

```bash
curl https://example.com/api/resources/v1/teams \
  -H "Authorization: Bearer avo_a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V"
```

:::danger Use TLS, always
A token is a replayable, full-privilege bearer credential: anyone holding it acts as its owner, with all of that owner's access, until the token expires or is revoked. There is nothing bound to a device, an IP, or a request body to stop a copy of it working. Send it only to `https://` endpoints.
:::

Only that header, and only that scheme, is read. A credential in a query string is not read at all, so the request is rejected exactly like one carrying no credential.

:::warning A token sent in a URL is already compromised
Rejecting it doesn't undo the disclosure — by the time the request reached Avo it was in your web server's access log, and likely in a proxy log and a browser history too. Treat any token that has appeared in a URL as leaked: revoke it and mint a replacement.
:::

### Token lifecycle

A token's status is derived from two timestamps, never stored, so there is no lifecycle field to drift out of step:

| Status | When | Authenticates |
| --- | --- | --- |
| **Active** | Not revoked, and either no expiry or an expiry still in the future | Yes |
| **Expired** | The expiry instant has passed | No |
| **Revoked** | The Revoke action was run on it | No |

Expiry is optional — leave it blank and the token never expires. Revocation is permanent: the **Revoke** action on the token resource marks the token and keeps the record, and nothing can un-revoke it. A token that is both revoked and past its expiry reports **Revoked**.

Each successful request stamps the token's **Last used** column, which is the fastest way to tell a token that was never wired up from one that stopped working.

Deleting a token's owner also stops the token: a token whose owner can no longer be resolved is rejected, so a request never proceeds with nobody attached to it.

:::info Every rejection looks the same
Absent, malformed, unknown, expired, revoked, and orphaned credentials all produce the identical `401` and `{ "error": "Unauthorized" }` body — the response tells a caller nothing about which one it was.

So debug a `401` from the panel, not from the response. Check the token's **Status** first (expired and revoked are the common answers), then whether its owner still exists, then **Last used** to see whether the request reached this token at all.
:::

### A token acts as its owner

An authenticated request runs as the token's owner, and **every policy that owner is subject to applies to it unchanged**. That is the ceiling: a token is never more powerful than the person who created it, so an administrator's token reaches everything an administrator reaches.

A token can be less powerful, though. [Scopes](#scope-a-token) narrow it to a chosen set of resources and actions — always a subset of what the owner may already do, never an addition to it. A token nobody scoped reaches everything its owner does.

### Your app's own authentication still runs

Token traffic is not exempt from whatever you put in [`config.authenticate_with`](./authentication.html). Avo can't tell an authentication check there from an IP allowlist, a tenant assignment, or a maintenance gate, so the block is **satisfied rather than skipped**: where Devise is present and the token's owner is a Devise-mapped model, the owner is signed in for that one request (`store: false`, so no session is written) and a standard session check passes on its own terms. Everything else in the block still runs, and a token request your rules reject stays rejected.

If your block can't be satisfied that way — another authentication library, or a check against a scope the owner isn't in — guard it yourself:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.authenticate_with do
    next if Avo::Api.token_request? # [!code highlight]

    authenticate_user!
  end
end
```

`Avo::Api.token_request?` is supported public API and returns `true` while a valid API token is authenticating the request in flight. Guard on it rather than on anything inside the gem's controllers.

### Keep the credential safe

Three rules, two of them above: send it only over TLS, and treat a token that has appeared in a URL as leaked. The third is about the one moment the plaintext exists at all.

:::warning The one-time reveal transits your session store
The plaintext secret is never written to the tokens table, but it does ride the flash from the create request to the page that displays it. That means it passes through whatever session store the app is configured with. Rails' default cookie store keeps it in the visitor's own encrypted cookie; a **server-side store writes it to disk** (or to Redis) for that one hop. The page itself is sent `Cache-Control: no-store` and opts out of Turbo's snapshot cache, but neither reaches your session store.
:::

Who may mint and revoke tokens is your app's authorization decision, and the default is permissive — see [Who may manage tokens](#who-may-manage-tokens).

## Scope a token

A token starts out able to do everything its owner can. **Scopes** narrow it: an allowlist, held on the token itself, of the resources it may reach and what it may do on each. Set them in the **Scopes** panel — on the token's page, and on the create and edit forms — there's no initializer setting and nothing to configure globally, because scoping is per token.

Each granted resource is held at one of two levels:

| Level | API actions it permits |
| --- | --- |
| **Read** | `index`, `show` |
| **Read & Write** | `index`, `show`, `create`, `update`, `destroy` |

:::warning Granting one resource restricts every other one
A token with **no grants at all** is unrestricted — it reaches everything its owner's policies allow. That's every token minted without anyone opening the panel.

Grant anything, and that list becomes the whole of what the token may reach. Every resource you didn't grant is refused — **including resources your app ships later**. A deploy never widens a token; widening one is always a deliberate act in the panel.
:::

### Grant a resource

Every resource the token's owner can reach is a row, set to **None**, **Read**, or **Read & Write**. None means not granted — there's no separate list of grants and nothing to remove.

Above the rows, a search box narrows the list as you type, and **Set all shown** applies one level to whatever the search is currently showing: "read-only across the board" is one click, "read-only on everything matching `order`" is a search away.

Clicking a level changes nothing on its own. The moment the grid differs from what's stored, **Apply changes** and **Undo** appear — Apply writes the whole grid at once, Undo snaps back. On the create and edit forms it's the same grid, and your **Save** is what commits it, so a token can be scoped as it's minted rather than sitting unrestricted until you come back to it.

An unrestricted token shows one line instead of the grid. **Fine-tune** opens it with every row already at Read & Write — which is what unrestricted means for this owner — so you narrow from there instead of building the list up from nothing. Nothing is stored until you apply or save.

Two things never get a row:

- **Resources the token's owner can't reach.** The rows are resolved through the owner's own policies, so an administrator scoping somebody else's token can't grant past what that person already sees.
- **The API tokens resource itself.** It has no API endpoint at all ([why](#endpoints)), so granting it would promise something no route can keep.

### Take a token back to unrestricted

Setting every row to None does not land where you started. A token with nothing granted is scoped to *nothing* — it refuses every request. That's a legitimate thing to want, and it is not the same as never having scoped the token at all.

**Make unrestricted** is the way back: it drops every grant and returns the token to reaching everything its owner can. The panel says which of the two states a token is in rather than leaving you to infer it — a collapsed **Unrestricted** line, or a footer counting what's granted against what could be.

### Scopes sit in front of your policies, never instead of them

The check runs on the way in — before any record is loaded and before your authorization runs — and it can only ever subtract. A granted request then goes through your policies and policy scopes exactly as the same request would without a token.

So a token granted **Read & Write** on Orders still cannot destroy an order its owner's policy protects: the grant opens the door, the policy still decides. There is no grant that lets a token exceed its owner.

Two consequences worth knowing:

- **A refusal can't be used to probe for records.** Because the gate runs before anything loads, an ungranted request gets the identical response whether the id exists or not.
- **Only gem-issued tokens are gated.** If your `setup_authentication` [replaces the built-in one](#bring-your-own-authentication) without calling `super`, no token is in flight and no scope check runs — your scheme is in sole charge.

### Tell the three refusals apart

A refused request answers one of three ways, and they're deliberately distinguishable:

| Response | What happened | Where you fix it |
| --- | --- | --- |
| `401` `{ "error": "Unauthorized" }` | The credential didn't authenticate — absent, malformed, unknown, expired, revoked, or orphaned ([all identical on purpose](#token-lifecycle)) | Mint or rotate the token |
| `403` `{ "error": "Forbidden", "reason": "token_scope" }` | The credential authenticated fine; the token's grants don't cover this resource or this action | The token's **Scopes** panel |
| `403` `{ "error": "Forbidden", "reason": "policy" }` | The grants allow it; the owner's policy denied it | Your policy classes, or the token's owner |

`reason` is the whole point of the split: it tells an operator holding the response which lever to pull — widen the token, or fix the policy — without having to reproduce the request from the panel.

### Who may change scopes

Editing a token's scopes is gated by its own policy method, `edit_scopes?`, exactly like [`revoke?`](#who-may-manage-tokens) gates the Revoke action:

```ruby
# app/policies/avo/api/token_policy.rb
class Avo::Api::TokenPolicy < ApplicationPolicy
  def edit_scopes? = user.admin?
end
```

Denied, the panel renders the grid **read-only** rather than disappearing — so someone who can see a token can always see what it reaches, and is told plainly that they can't change it.

:::danger Without an authorization client, everyone may scope every token
`edit_scopes?` is asked through the resource's authorization service, and with no client configured every such question answers yes — the same permissive default that applies to [minting and revoking](#who-may-manage-tokens). Nothing in the gem restricts scope editing on its own.
:::

### What scopes don't cover

Scopes constrain **resources and actions**. They do not constrain rows or attributes:

- **Which records come back** is still your policy scopes' job, unchanged. A token granted Read on Orders sees exactly the orders its owner sees — no more, and no fewer.
- **Which fields are serialized** is still the resource's per-view visibility (`only_on:` / `hide_on:`).
- **Custom controller actions.** A grant holds the five REST actions; an action you route onto a generated controller yourself is refused for every scoped token — only an unscoped token reaches it.

:::warning Renaming a resource class orphans its grants
Grants are stored under the Avo resource's class name (`Avo::Resources::Order`). Rename that class and the grant no longer matches anything, so the token is **refused** on the renamed resource — the safe direction, but a silent one.

The grid doesn't show it, and doesn't lose it. It lists only resources the token's owner can currently reach, so a grant on a class that no longer exists — or on one the owner's policies stopped letting them index — is held without a row and left untouched by every apply. Grant the new name like any other resource; **Make unrestricted** is what clears the leftovers.
:::

## Bring your own authentication

Override `setup_authentication` on `BaseResourcesController` to use a different scheme. Your override wins by ordinary inheritance, and omitting `super` opts out of tokens entirely.

:::warning `super` changed meaning
In an override of `setup_authentication`, `super` used to **reject** the request. It now **accepts a valid API token**. Check every existing override before upgrading — see the [upgrade note](./upgrade.html).
:::

### Set the current user

Authenticating the *request* is only half the job. Avo's authorization — Pundit policies and policy scopes — runs against `Avo::Current.user`, and **a hand-rolled `setup_authentication` does not set it**. If you verify a credential but never establish a user, `Avo::Current.user` stays `nil` and every policy scope receives `nil`. (The built-in token path does this for you: a token resolves to its owner, and a token whose owner can't be resolved is rejected rather than let through as nobody.)

`Avo::Current.user` is assigned from whatever [`config.current_user_method`](./authentication.html) resolves to, evaluated in the controller instance:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.current_user_method = :current_user
end
```

So with the default setting, **the API controller's `current_user` method is what the policies see**. Make that method return the authenticated user:

```ruby
# app/controllers/avo/api/resources/v1/base_resources_controller.rb
module Avo::Api::Resources::V1
  class BaseResourcesController < ResourcesController
    def setup_authentication
      token = request.headers["Authorization"].to_s.delete_prefix("Bearer ")
      @api_user = User.find_by(api_token: token) if token.present?

      raise Avo::Api::AuthenticationError if @api_user.nil?
    end

    # This is what `config.current_user_method` resolves to,
    # and therefore what Pundit receives.
    def current_user
      @api_user
    end
  end
end
```

:::warning Assigning `Avo::Current.user` directly does not work
`setup_authentication` runs *before* Avo's `init_app` callback, and `init_app` then overwrites `Avo::Current.user` with whatever `config.current_user_method` returns. Setting `Avo::Current.user = user` inside the hook is silently discarded. Always go through `current_user` (or whichever method you configured).
:::

A global `config.current_user_method do … end` block is the alternative, but it's evaluated for the admin UI too, so you'd have to branch on the request. Overriding `current_user` in the API controller keeps the two paths separate.

### Authentication examples

**Your own bearer token**, resolving to a user — see the snippet above. Use this when the credential lives in your app rather than in Avo's tokens table.

**HTTP Basic** with Devise. `sign_in(user, store: false)` is what makes `current_user` return the user for the rest of the request, so no `current_user` override is needed here:

```ruby
# app/controllers/avo/api/resources/v1/base_resources_controller.rb
module Avo::Api::Resources::V1
  class BaseResourcesController < ResourcesController
    def setup_authentication
      raise Avo::Api::AuthenticationError unless authenticate_with_http_basic do |email, password|
        user = User.find_by(email: email)
        user&.valid_password?(password) ? sign_in(user, store: false) : false
      end
    end
  end
end
```

**Shared API key** for a trusted server-to-server integration. A single shared key identifies no particular user, so pick the account the request should act as — otherwise your policies get `nil`:

```ruby
# app/controllers/avo/api/resources/v1/base_resources_controller.rb
module Avo::Api::Resources::V1
  class BaseResourcesController < ResourcesController
    def setup_authentication
      provided = request.headers["Authorization"].to_s.delete_prefix("ApiKey ")

      unless ActiveSupport::SecurityUtils.secure_compare(provided, ENV.fetch("API_KEY"))
        raise Avo::Api::AuthenticationError
      end
    end

    def current_user
      @current_user ||= User.find_by!(email: "integration@example.com")
    end
  end
end
```

**Disable authentication** for one resource — public, unauthenticated reads:

```ruby
# app/controllers/avo/api/resources/v1/users_controller.rb
module Avo::Api::Resources::V1
  class UsersController < BaseResourcesController
    skip_before_action :setup_authentication
  end
end
```

:::warning A public endpoint still has a `nil` user
Skipping authentication leaves `Avo::Current.user` as `nil`. Any policy scope that calls a method on `user` (`user.admin?`) raises `NoMethodError` and the request 500s. Guard for `nil` in your scopes before exposing an endpoint this way.
:::

## Authorization

Your existing Pundit policies apply to the API automatically — the same `Scope` classes and policy methods that protect the admin panel filter the API response. Nothing API-specific to configure.

- **Index** resolves through the resource's `Scope`, so `GET /api/resources/v1/comments` returns only the records that user may see.
- **Show, update, and destroy** look the record up through the same scope, so a record outside it is **`404 Not Found`**, not a `403` — the API doesn't confirm that an out-of-scope record exists.

```ruby
# app/policies/comment_policy.rb
class CommentPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      user.admin? ? scope.all : scope.where(user:)
    end
  end
end
```

With that policy, an admin's `GET /api/resources/v1/comments` returns every comment; a regular user's returns only their own.

Policy scoping requires all three of the following. If any is missing, the query is handed back untouched — it is **not** scoped, every record is returned, and nothing raises:

| Requirement | Where |
| --- | --- |
| The `avo-authorization` add-on installed | `Gemfile` |
| The `avo-authorization` feature enabled on your license | Your Avo plan |
| An authorization client configured | `config.authorization_client = :pundit` |

:::info A `nil` user fails differently
Those three are configuration — miss one and the query is silently unscoped. A missing **user** is the opposite failure: with Pundit configured, scoping still runs, so `nil` reaches your `Scope#resolve` and the usual `user.admin?` raises `NoMethodError`. You get a 500, not a leak — the same trap described under [Authentication examples](#authentication-examples).

Both have one cure: make sure [`config.current_user_method`](#set-the-current-user) resolves to a real user on every API request.
:::

:::info A denied policy method answers `403`, and says so
Policy *methods* (`index?`, `update?`, …) returning `false` raise `Avo::NotAuthorizedError`, which the API renders as JSON:

```json
{ "error": "Forbidden", "reason": "policy" }
```

The `reason` is what separates this from a [scope refusal](#tell-the-three-refusals-apart), which is also a `403`. Policy **scopes** are unaffected — they keep filtering the index silently, with no error at all.

This used to be a **302 redirect** to your root URL, behavior meant for the HTML admin panel; see the [upgrade note](./upgrade.html). A `rescue_from Avo::NotAuthorizedError` you added to your own `BaseResourcesController` to work around that still wins, so your response shape is unchanged.
:::

### Who may manage tokens

`avo-api` adds no setting for this. The token resource obeys your app's existing authorization exactly like any other resource, and the gem ships no policy and generates none — policy method names are configurable and the client need not be Pundit, so a supplied file would be wrong for those apps.

:::danger Without an authorization client, every panel user can mint a token
And a token carries its owner's full privileges over every record. If `avo-authorization` isn't installed, isn't enabled on your license, or no `config.authorization_client` is set, nothing stands between a user who can sign in to Avo and a credential that reaches your whole API. That's your app's configuration rather than anything this feature decides, but decide it deliberately.
:::

The opposite is just as true. With [`config.explicit_authorization`](./authorization.html#explicit_authorization) at its default of `true`, a resource whose policy class is missing is **denied**, so the token resource is unreachable until you write one — the same rule that applies to every other resource in that app.

Each built-in action is gated by its own policy method, and that one method controls both whether the action renders and whether it can be run — a hidden Revoke button cannot be run by a direct request either. Write the policy as you would for any model:

```ruby
# app/policies/avo/api/token_policy.rb
class Avo::Api::TokenPolicy < ApplicationPolicy
  def index?   = true
  def show?    = true
  def create?  = true          # anyone who may create one gets a token owned by themselves
  def new?     = create?
  def update?  = mine?
  def edit?    = update?
  def destroy? = mine?
  def act_on?  = true          # gates the Actions menu as a whole
  def revoke?  = mine?         # gates the Revoke action specifically

  # Gates the Scopes panel — read-only where this is false. See "Scope a token".
  def edit_scopes? = user.admin?

  class Scope < ApplicationPolicy::Scope
    def resolve = user.admin? ? scope.all : scope.where(owner: user)
  end

  private

  def mine?
    return true if user.admin?
    # Avo asks this against the model class, not a row, when it decides whether
    # to offer an action on an index view. There is nothing to own yet, so the
    # honest answer is "yes, in principle" — the per-record check that runs
    # before the action touches anything is what actually decides.
    return true unless record.is_a?(ActiveRecord::Base)

    record.owner == user
  end
end
```

That grants administrators every token while limiting everyone else to their own — they see, edit, and revoke the tokens they created and nothing more.

:::info This is one client's shape
The example is Pundit's. Other authorization clients express the same rules their own way, and if you renamed methods through [`config.authorization_methods`](./authorization.html#using-different-policy-methods), use your names — the gem checks through the resource's authorization service, not through any particular library.
:::

Tokens record their owner polymorphically, so `scope.where(owner: user)` works whatever your user model is called.

## Works better with

Nothing on this page needs another add-on. Two of them change what the feature can do.

- **[`avo-authorization`](./authorization.html)** — the layer every question here defers to. It decides which tokens a user sees on the index, whether they may revoke one (`revoke?`) or change what it reaches (`edit_scopes?`), and it is what makes scopes *subtractive*: a scope narrows what a token's owner could already do and can never widen it. Without it, Avo's authorization service answers `true` to every question and hands the index query back unfiltered — [Authorization](#authorization) has the exact failure modes.
- **[`avo-custom_controls`](./custom-controls.html)** — promotes **Revoke** out of the Actions dropdown. On a token's page it becomes a button beside Edit; on the index it becomes an icon at the end of every row, so working down a list of tokens costs one click each instead of a round trip. It appears only where the Actions menu would have offered it anyway — the control is filtered by the same `revoke?` policy and the same active-token check, so an expired or already-revoked token shows nothing.

## Reading data

### Index

`GET /api/resources/v1/teams` returns records visible on the `:index` view, plus pagination:

```json
{
  "records": [
    { "id": 1, "name": "Development Team", "url": "https://dev.company.com" },
    { "id": 2, "name": "Marketing Team", "url": "https://marketing.company.com" }
  ],
  "pagination": {
    "page": 1,
    "per_page": 25,
    "total_pages": 1,
    "total_count": 2,
    "has_next_page": false,
    "has_prev_page": false
  }
}
```

**Pagination**: `page` (default `1`) and `per_page` (default `config.per_page`).

**Sorting**: `sort_by` (field) and `sort_direction` (`asc` / `desc`).

```bash
GET /api/resources/v1/teams?page=2&per_page=10&sort_by=name&sort_direction=asc
```

:::info `per_page` is remembered in a cookie
Avo stores `per_page` in a cookie so the admin panel remembers the reader's choice. A client that keeps cookies between requests (a browser, or a scripted session with a cookie jar) will keep the last `per_page` it sent even when it omits the parameter. Send `per_page` explicitly on every request if you need a fixed page size.
:::

### Show

`GET /api/resources/v1/teams/1` returns a single record with fields visible on the `:show` view:

```json
{
  "record": {
    "id": 1,
    "name": "Development Team",
    "url": "https://dev.company.com",
    "admin": { "id": 5, "label": "John Doe" },
    "team_members": { "count": 12 }
  }
}
```

### Field serialization

Fields are respected according to their view visibility, and typed values are serialized per field type:

| Field type | Shape |
| --- | --- |
| Text, number, boolean, date/datetime | The raw value |
| `belongs_to` | `{ "id": 5, "label": "John Doe" }` |
| `has_many`, `has_one` | `{ "count": 12 }` (or `{ "id": 5 }` for a single loaded record) |
| `file`, `files` | `{ "filename": "…", "content_type": "…", "byte_size": 1234, "url": "…" }` |

Field visibility follows your resource's view settings, so you can shape the API per view:

```ruby
# app/avo/resources/team.rb
class Avo::Resources::Team < Avo::BaseResource
  def fields
    field :id, as: :id
    field :name, as: :text
    field :url, as: :text

    field :internal_notes, as: :text, hide_on: :index   # hidden from the index response
    field :logo, as: :external_image, only_on: :show     # only in the show response
  end
end
```

:::info File URLs are permanent
`file` and `files` fields serialize the standard attachment URL. These are not signed or expiring — anyone who obtains the URL can fetch the file. Keep that in mind before exposing attachments to clients you don't control.
:::

## Writing data

Send field data under the resource's singular key. Requests use JSON.

### Create

```bash
curl -X POST https://example.com/api/resources/v1/teams \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "team": { "name": "Mobile Team", "url": "https://mobile.company.com", "admin_id": 5 } }'
```

On success the response is `201 Created` with the record serialized on its `:show` view:

```json
{
  "record": { "id": 3, "name": "Mobile Team", "url": "https://mobile.company.com", "admin": { "id": 5, "label": "John Doe" } }
}
```

On validation failure it's `422 Unprocessable Entity`:

```json
{
  "errors": { "name": ["can't be blank"], "url": ["is not a valid URL"] },
  "message": "Failed to create Team"
}
```

### Update

`PATCH` for a partial update, `PUT` for a full one. Both return the updated record on its `:show` view (`200 OK`).

```bash
curl -X PATCH https://example.com/api/resources/v1/teams/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "team": { "name": "Updated Mobile Team" } }'
```

### Delete

```bash
curl -X DELETE https://example.com/api/resources/v1/teams/1 \
  -H "Authorization: Bearer <token>"
```

Success (`200 OK`):

```json
{ "message": "Team successfully deleted" }
```

Failure (`422 Unprocessable Entity`):

```json
{
  "errors": { "base": ["Cannot delete a team with active projects"] },
  "message": "Failed to delete Team"
}
```

### Field value formats

Different field types accept the formats you'd expect:

| Field | Example value |
| --- | --- |
| Text / string | `"Team Name"` |
| Number | `42`, `19.99` |
| Boolean | `true`, `false` |
| Date / datetime | `"2024-01-15"`, `"2024-01-15T10:30:00Z"` |
| `belongs_to` | the foreign key: `"admin_id": 5` |

## CSRF protection

API controllers use Rails' `:null_session` CSRF strategy by default — the right choice for stateless clients that don't carry a CSRF token. Requests without a valid token get a fresh empty session for the request; no `InvalidAuthenticityToken` exception is raised.

Override `self.setup_csrf_protection` to change it:

```ruby
# app/controllers/avo/api/resources/v1/users_controller.rb
module Avo::Api::Resources::V1
  class UsersController < BaseResourcesController
    def self.setup_csrf_protection
      protect_from_forgery with: :exception   # or leave empty to disable entirely
    end
  end
end
```

## Custom controllers

`rails generate avo_api:generate` creates every controller for you. Two narrower generators exist for later use:

```bash
# One controller for a single resource
rails generate avo_api:controller User

# Controllers for every resource, without re-exporting BaseResourcesController
rails generate avo_api:controllers
```

:::warning `avo_api:controllers` does not create the base controller
It generates resource controllers that inherit from `BaseResourcesController` but doesn't create that class. Run `avo_api:generate` first (or on its own — it invokes `avo_api:controllers` and then exports the base controller).
:::

Naming follows Rails conventions:

| Avo resource | Generated controller |
| --- | --- |
| `Avo::Resources::User` | `Avo::Api::Resources::V1::UsersController` |
| `Avo::Resources::BlogPost` | `Avo::Api::Resources::V1::BlogPostsController` |
| `Avo::Resources::ProductCategory` | `Avo::Api::Resources::V1::ProductCategoriesController` |

### Overridable methods

`BaseResourcesController` exposes these hooks:

- **Actions:** `index`, `show`, `create`, `update`, `destroy`
- **Result callbacks:** `create_success_action`, `create_fail_action`, `update_success_action`, `update_fail_action`, `destroy_success_action`, `destroy_fail_action`
- **Serialization:** `serialize_records(resources, view)`, `serialize_record(resource, view)`, `serialize_field_value(field)`
- **Auth hooks:** `setup_authentication`, `self.setup_csrf_protection`

Call `super` and adjust, or replace outright:

```ruby
# app/controllers/avo/api/resources/v1/users_controller.rb
module Avo::Api::Resources::V1
  class UsersController < BaseResourcesController
    def create_success_action
      render json: {
        record: serialize_record(@resource, :show),
        message: "Welcome! Your account has been created."
      }, status: :created
    end
  end
end
```

Put customization that should apply everywhere in `BaseResourcesController` instead — every resource controller inherits from it.

## Error handling

The API returns these status codes:

| Status | Meaning |
| --- | --- |
| `200` | Success |
| `201` | Created |
| `401` | Authentication failed or missing — an absent, malformed, unknown, expired, revoked, or orphaned token all look the same ([why](#token-lifecycle)) |
| `403` | Refused on permission. `reason` says which: `token_scope` (outside the token's [grants](#scope-a-token)) or `policy` (a policy method denied it) |
| `404` | Record not found, out of policy scope, or the `avo-api` feature isn't enabled on your license |
| `422` | Validation errors |

## Configuration reference

### `mount_avo_api`

Route helper that mounts the API engine.

```ruby
# config/routes.rb
mount_avo_api at: "/api", constraints: { subdomain: "api" } do
  # optional custom routes inside the engine
end
```

- **Type:** route helper, available inside `Rails.application.routes.draw`.
- **`at:`** — String, the mount path. Default: `"api"`.
- **Rails `mount` options** — any option `mount` accepts is forwarded, e.g. `via:` (restrict HTTP methods), `constraints:`, `defaults:`.
- **Block** — optional; defines custom routes inside the API engine.
