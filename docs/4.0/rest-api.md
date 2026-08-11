---
license: addon
addon_link: https://avohq.io/addons/api
addon: avo-api
outline: [2, 3]
---

# REST API

The `avo-api` add-on exposes a JSON REST API for every Avo resource. It reuses your resources' field definitions, visibility rules, and authorization, so a resource you already built for the admin panel is instantly available over HTTP — list, read, create, update, and delete.

This single page is the full guide **and** reference: installation, mounting, authentication, tokens, authorization, the request/response format, and the configuration surface.

:::info Add-on
The REST API ships as the separate `avo-api` gem. [See the add-on page →](https://avohq.io/addons/api)
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

Run the install generator:

```bash
rails generate avo:api:generate
```

The generator:

- Generates one controller per existing Avo resource under `app/controllers/avo/api/resources/v1/` (change the namespace with `--version`).
- Exports a `BaseResourcesController` in the same directory that every generated controller inherits. It already authenticates with API tokens, so Bearer tokens work out of the box.
- Copies the migration that creates the `avo_api_tokens` table, and generates `app/policies/avo/api/token_policy.rb` — the policy that decides who may manage whose tokens (see [Who can manage tokens](#who-can-manage-tokens)).

Then run the migration:

```bash
rails db:migrate
```

:::info
Pass `--skip-tokens` to leave out the tokens migration and policy — the generated `BaseResourcesController` then rejects every request until you fill in [`setup_authentication`](#the-setup_authentication-code-hook) yourself. If you change your mind later, `rails generate avo:api:tokens` adds the table and the policy, and wires token authentication into your `BaseResourcesController` unless you've written your own.
:::

There is nothing you must configure to have a working install. The optional settings live inside your existing `Avo.configure` block — see the [configuration reference](#configuration-reference).

## Mount the API

Add `mount_avo_api` to your routes. It mounts the API engine at `"api"` by default (resolved as `/api`).

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
If `mount_avo` lives inside an `authenticate :user do … end` block, `mount_avo_api` **must** be mounted outside and before it. Mounting the API inside the block forces every API request through your web session authentication, which breaks token-based access for external clients.

This does not mean the API is unauthenticated — it authenticates itself (see [Authentication](#authentication)). It just must not inherit the web interface's session guard.
:::

```ruby
# ❌ Don't — the API inherits web session auth and token access breaks
Rails.application.routes.draw do
  authenticate :user do
    mount_avo_api
    mount_avo
  end
end
```

:::warning Prefer an anchored mount path
The default `at: "api"` is unanchored — Rails treats it as a prefix, so a top-level `/api-debug` route can land inside the engine and 404. Mount at `"/api"` (or another path that does not share a prefix with other root routes) when you also have routes that start with those letters.
:::

### Mount options

`mount_avo_api` accepts a mount path and forwards any option Rails' `mount` accepts. See the [`mount_avo_api` reference](#mount_avo_api) for the full list.

```ruby
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

For each resource, the API exposes standard RESTful endpoints under `resources/v1`. For a `teams` resource mounted at the default `/api`:

```
GET    /api/resources/v1/teams        # List teams
POST   /api/resources/v1/teams        # Create a team
GET    /api/resources/v1/teams/:id    # Show a team
PATCH  /api/resources/v1/teams/:id    # Update a team
PUT    /api/resources/v1/teams/:id    # Update a team
DELETE /api/resources/v1/teams/:id    # Delete a team
```

The path segment is the resource's `route_key` (e.g. `blog_posts`, `product_categories`). Each resource is served by the thin controller the generator wrote for it — the behavior lives in the gem, and the generated file is your override point (see [Custom controllers](#custom-controllers)).

:::info
The API tokens resource itself is deliberately **not** exposed over the API — managing credentials through the credential-authenticated API would let a token mint more tokens.

A resource added after the install needs its controller generated: `rails generate avo:api:controller ThatResource`, or re-run `avo:api:generate` (existing files are skipped, never overwritten).
:::

Anything unrouted inside the mount is answered as a JSON `404` with the [`unrecognized_request_url`](#error-responses) code — the host app's own 404 still handles the rest of the site.

## Discovery

One endpoint describes everything the API version exposes, so a client doesn't have to be told which resources exist or what fields they carry:

```
GET    /api/resources/v1/_schema
```

It is served by your generated `BaseResourcesController`, so it uses the same `setup_authentication` as the rest of the API. There is no separate `schema?` policy — after authenticating, each resource is included only when that user's `index?` allows it, so the schema never advertises what the caller can't list.

```json
{
  "schema_version": 1,
  "api_version": "v1",
  "resources": [
    {
      "route_key": "teams",
      "singular_name": "Team",
      "plural_name": "Teams",
      "model_name": "Team",
      "fields": [
        {
          "id": "id",
          "name": "ID",
          "type": "id",
          "required": false,
          "readonly": true,
          "visible_on": ["index", "show"]
        },
        {
          "id": "name",
          "name": "Name",
          "type": "text",
          "required": true,
          "readonly": false,
          "visible_on": ["index", "show", "new", "edit"]
        }
      ]
    }
  ]
}
```

| Key | Meaning |
|-----|---------|
| `schema_version` | The shape of this payload, not the API version. It changes only when the keys below change, so a client can refuse a payload it doesn't understand. |
| `api_version` | The version namespace the request came through. |
| `visible_on` | The views the field appears in. A resource can declare different fields per view (`index_fields`, `edit_fields`, …) — this reflects the result. |
| `required` | The field's `required:` option when set; otherwise the model's presence validators. `null` when a `required:` block cannot be evaluated safely (discovery has no record). |
| `readonly` | `null` when the resource sets it with a block, because a block is evaluated per record and discovery has none. |

:::info
Use `visible_on` to decide which fields a `POST` or `PATCH` body may carry: a field that isn't visible on `new` or `edit` is not writable.
:::

## Authentication

Every request runs the `setup_authentication` hook before anything else. The gem's default **raises**, so the API is closed until something answers it — and the generated `BaseResourcesController` answers it with **Bearer tokens**:

```ruby
def setup_authentication
  authenticate_with_api_token!
end
```

A request without a valid token gets a `401`. Tokens are minted and managed from the Avo UI, and are the primary mechanism for external and server-to-server clients. To authenticate your own way — or to accept tokens *and* keep an existing scheme — override the hook: see [the `setup_authentication` code hook](#the-setup_authentication-code-hook).

### Managing API tokens

Tokens are Bearer credentials managed through a dedicated **API Tokens** resource in the Avo sidebar. From there you can:

- **Create a token** with a name and a lifetime — **7**, **30**, **60**, or **90 days**, or **No expiration**. Each option is labelled with the date it resolves to, and **30 days is preselected**, since a token that never expires is the riskier choice and should be a deliberate one.
- **Change the lifetime** of an existing token — the same picker is on the edit form, so a token that's about to run out can be given longer without minting a new one and redeploying every client that holds it.
- **Copy the secret** — the raw token is shown **exactly once**, immediately after creation, on the new token's show page. It's never stored or shown again. If lost, revoke it and create a new one.
- **Revoke** a token to deactivate it permanently (terminal — a revoked token cannot be re-enabled; the row survives so the audit trail does too).

A token's `status` is one of `Active`, `Expired`, or `Revoked`. Only `Active` tokens authenticate. The UI also tracks `last_used_at` so you can spot stale tokens (see [`last_used_precision`](#config-api-last_used_precision)).

:::info
Every option in the lifetime picker counts from **today**, on the edit form as much as on the create form. Picking "90 days" on a token with a week left means it stops 90 days from now — not 97. The edit form opens on a blank **Keep the current expiration** option, so renaming a token never re-dates it.

`expires_at` itself is read-only on every screen: the presets are the only dates on offer, and a posted `expires_at` (or `revoked_at`) is dropped — the form permits only `name`, `owner_id`, and the lifetime picker.
:::

Use the secret as a Bearer token:

```bash
curl https://example.com/api/resources/v1/teams \
  -H "Authorization: Bearer avo_xxxxxxxxxxxxxxxxxxxx"
```

The plaintext is `avo_` followed by alphanumeric characters only, so it stays one regex for a secret scanner and survives a double-click select. It's stored as a SHA256 digest, never in plaintext — the UI keeps a short display prefix so a token stays recognizable in a list.

Tokens can also be minted from code or the console:

```ruby
token, raw = Avo::Api::Token.generate(owner: user, name: "Zapier")
# `raw` is the only time the plaintext exists — show it once, then it's gone.
```

`generate` also accepts `expires_at:` and `created_by:`.

:::warning A token is its owner
A token authenticates **as its owner** and runs under that user's own policies — it has no permission level of its own and cannot be narrower (or wider) than the user it belongs to. Minting a token owned by an admin hands out everything that admin can do. Control what a token reaches by choosing its owner and by narrowing that owner's policies.
:::

### Who can manage tokens

Token management is authorization, not configuration — it goes through `Avo::Api::TokenPolicy`, a file the generator writes into **your** app at `app/policies/avo/api/token_policy.rb`. As generated it allows everyone everything, which is exactly what the token screens do before `avo-authorization` is installed — so installing the authorization gem never silently takes the screens away. Narrowing the policy is the point of the file.

Three answers, decided by what the app has installed:

| Installed | Who manages whose tokens |
| --------- | ------------------------ |
| `avo` + `avo-api` | Everyone manages everyone's — without `avo-authorization`, nothing is authorized, tokens included. |
| `+ avo-authorization` | Your `Avo::Api::TokenPolicy` decides. As generated it allows everything until you edit it. |
| `+ your edits` | Your rules. The usual first narrowing is scoping tokens to their owner (`show?` and `Scope#resolve` together), and `edit_owner?`. |

Two things worth knowing when you edit it:

- **Keep every method.** Avo's `explicit_authorization` defaults to `true`, so a deleted method is a silent denial. Return `false` to deny; don't remove. Don't inherit `ApplicationPolicy` either — an inherited `false` is the same silent denial from a file you weren't reading.
- **`edit_owner?` is the answer most worth changing first.** It decides who may mint a token *for somebody else* — such a token authenticates as that person. It gates the owner picker on the form, and whether a posted `owner_id` is honoured. Leaving the picker empty always means "mine".

### The `setup_authentication` code hook

Override `setup_authentication` in your `BaseResourcesController` (for the whole API) or in a single resource's controller to plug in your own scheme. Raise `Avo::Api::AuthenticationError` to reject a request; it renders a `401` with the error envelope described under [Error responses](#error-responses).

**Keep tokens and add a fallback** — `authenticate_with_api_token` (no bang) returns the token or `nil`:

```ruby
# app/controllers/avo/api/resources/v1/base_resources_controller.rb
def setup_authentication
  return if authenticate_with_api_token

  authenticate_with_http_basic do |email, password|
    user = User.find_by(email: email)
    if user&.valid_password?(password)
      sign_in(user, store: false)
    else
      raise Avo::Api::AuthenticationError
    end
  end
end
```

**Disable authentication** for a resource (public, unauthenticated reads — your policies still apply):

```ruby
# app/controllers/avo/api/resources/v1/users_controller.rb
class UsersController < BaseResourcesController
  def setup_authentication
    # Leave empty to disable the check
  end
end
```

**API key** (server-to-server):

```ruby
# app/controllers/avo/api/resources/v1/users_controller.rb
class UsersController < BaseResourcesController
  def setup_authentication
    expected = ENV.fetch("API_KEY")
    provided = request.headers["Authorization"]&.sub(/^ApiKey /, "")
    unless ActiveSupport::SecurityUtils.secure_compare(provided.to_s, expected)
      raise Avo::Api::AuthenticationError
    end
  end
end
```

## Authorization

Authentication answers "who is calling"; your Avo policies answer everything after that. With [`avo-authorization`](./authorization) installed, the same Pundit policies that protect your admin panel run on every API request — `index?`, `show?`, `create?`, the `Scope`, all of it. For token requests they run as the token's **owner**.

A policy denial renders a `403` with the [`permission_denied`](#error-responses) code. A record outside the caller's policy scope renders a `404` (`resource_missing`) rather than a `403` — a `403` would confirm the id exists.

:::warning No authorization gem, no limits
Without `avo-authorization` there is no policy layer, and an authenticated request can reach everything — a token can do whatever its owner could do in the admin UI. Install the gem to narrow access, or gate requests yourself in the `BaseResourcesController` you own:

```ruby
before_action :restrict_to_admins

def restrict_to_admins
  raise Avo::NotAuthorizedError unless _current_user.admin?
end
```

Raising `Avo::NotAuthorizedError` renders the same `403` envelope a policy denial does.
:::

:::warning The API needs the license feature
Requests return `404` with [`unrecognized_request_url`](#error-responses) when the license does not carry `avo-api`. An all-404 API on a fresh install is usually the license, not the routes.
:::

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

**Pagination** (index only): `page` (default `1`) and `per_page` (default from your Avo configuration).

**Sorting** (index only): `sort_by` (field) and `sort_direction` (`asc` / `desc`).

```bash
GET /api/resources/v1/teams?page=2&per_page=10&sort_by=name&sort_direction=asc
```

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

## Writing data

Send field data under the resource's singular key. Requests use JSON.

### Create

```bash
curl -X POST https://example.com/api/resources/v1/teams \
  -H "Authorization: Bearer avo_xxxx" \
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

Update with `PATCH` or `PUT`. Both apply just the fields present in the body and leave every other field untouched — a `PUT` does not reset the fields you omit. Both return the updated record on its `:show` view (`200 OK`).

```bash
curl -X PATCH https://example.com/api/resources/v1/teams/1 \
  -H "Authorization: Bearer avo_xxxx" \
  -H "Content-Type: application/json" \
  -d '{ "team": { "name": "Updated Mobile Team" } }'
```

### Delete

```bash
curl -X DELETE https://example.com/api/resources/v1/teams/1 \
  -H "Authorization: Bearer avo_xxxx"
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

API controllers use Rails' `:null_session` CSRF strategy by default — the right choice for stateless, token-authenticated clients that don't carry a CSRF token. Requests without a valid token get a fresh empty session for the request; no `InvalidAuthenticityToken` exception is raised.

Override `self.setup_csrf_protection` in a controller to change it:

```ruby
# app/controllers/avo/api/resources/v1/users_controller.rb
class UsersController < BaseResourcesController
  def self.setup_csrf_protection
    protect_from_forgery with: :exception   # or leave empty to disable entirely
  end
end
```

## Custom controllers

The generator already wrote a controller per resource, and the standard behavior needs no edits to any of them. Edit a resource's controller to **override** its behavior (a custom `setup_authentication`, `setup_csrf_protection`, response shape, or serialization); edit `BaseResourcesController` for API-wide behavior.

For a resource added after the install, generate its controller:

```bash
rails generate avo:api:controller User
```

Or (re)generate one for every existing resource at once — existing files are skipped:

```bash
rails generate avo:api:controllers
```

Both create controllers under `app/controllers/avo/api/resources/v1/` that inherit from `BaseResourcesController`. Naming follows Rails conventions:

| Avo resource | Generated controller |
| --- | --- |
| `Avo::Resources::User` | `Avo::Api::Resources::V1::UsersController` |
| `Avo::Resources::BlogPost` | `Avo::Api::Resources::V1::BlogPostsController` |
| `Avo::Resources::ProductCategory` | `Avo::Api::Resources::V1::ProductCategoriesController` |

A controller subclassing `BaseResourcesController` keeps authentication and the error envelope; one that inherits a plain `ActionController` is a full-bypass escape hatch (public, unauthenticated) — use it deliberately.

### Overridable methods

`BaseResourcesController` exposes these hooks:

- **Actions:** `index`, `show`, `create`, `update`, `destroy`
- **Result callbacks:** `create_success_action`, `create_fail_action`, `update_success_action`, `update_fail_action`, `destroy_success_action`, `destroy_fail_action`
- **Serialization:** `serialize_records(resources, view)`, `serialize_record(resource, view)`, `serialize_field_value(field)`
- **Auth hooks:** `setup_authentication` (an instance method), `self.setup_csrf_protection` (a class method)

Call `super` and adjust, or replace outright:

```ruby
# app/controllers/avo/api/resources/v1/users_controller.rb
class UsersController < BaseResourcesController
  def create_success_action
    render json: {
      record: serialize_record(@resource, :show),
      message: "Welcome! Your account has been created."
    }, status: :created
  end
end
```

## Error handling

The API returns standard HTTP status codes:

| Status | Meaning |
| --- | --- |
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (malformed request body) |
| `401` | Unauthorized (authentication failed or missing) |
| `403` | Forbidden (a policy refused the request) |
| `404` | Not Found |
| `422` | Unprocessable Entity (validation errors) |

### Error responses

Every error except a validation failure comes back in one envelope:

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "permission_denied",
    "message": "You do not have permission to perform this request."
  }
}
```

Branch on **`code`**. `type` is the coarse family, and `message` is written for a
person reading a terminal — its wording may change between releases, a `code`
will not.

| Status | `code` | Means |
| --- | --- | --- |
| `400` | `parameter_missing` | the attributes weren't nested under the resource key. The message names the key |
| `401` | `missing_api_token` | no `Bearer` credential was sent |
| `401` | `invalid_api_token` | a token was sent and didn't authenticate. Identical whether it is unknown, revoked, or expired |
| `403` | `permission_denied` | your policies refused it. The only `403` the API returns — a token cannot be narrower than its owner, so a different token won't help |
| `404` | `unrecognized_request_url` | nothing is routed there |
| `404` | `resource_missing` | the record didn't resolve — it's absent, or outside what you may reach |

:::info Why the two `401`s stop where they do
The split is on whether a credential was *offered*, never on why it failed.
Naming an absent token leaks nothing — you know what you sent. But answering
"revoked" differently from "never existed" would let anyone use the endpoint to
discover which tokens are real, so every failed token gets one identical reply.
:::

Validation failures keep the per-field shape shown under [Writing data](#writing-data)
(`{ "errors": { … }, "message": … }`) rather than this envelope.

Set [`docs_url`](#config-api-docs_url) to append `See <url> for details.` to every message.

---

## Configuration reference

### `mount_avo_api`

Route helper that mounts the API engine.

```ruby
# config/routes.rb
mount_avo_api at: "/api", constraints: { subdomain: "api" } do
  # optional custom routes inside the engine
end
```

- **`at:`** — String, the mount path. Default: `"api"` (unanchored — prefer `"/api"` when other root routes share that prefix; see [Mount the API](#mount-the-api)).
- **Rails `mount` options** — any option `mount` accepts is forwarded, e.g. `via:` (restrict HTTP methods), `constraints:`, `defaults:`.
- **Block** — optional; defines custom routes inside the API engine.

### `config.api.*`

There is no `Avo::Api.configure` and no separate initializer — the gem's settings live inside your existing `Avo.configure` block:

```ruby
# config/initializers/avo.rb
Avo.configure do |config|
  config.api.user_class = "Account"
  config.api.docs_url = "https://acme.com/docs/api"
  config.api.last_used_precision = 5.minutes
end
```

#### `config.api.user_class` {#config-api-user_class}

What a token's `owner` points at — the class whose records the owner picker offers.

- **Type:** String. **Default:** `"User"`.

#### `config.api.docs_url` {#config-api-docs_url}

When set, `See <url> for details.` is appended to the `message` of every API error body.

- **Type:** String. **Default:** `nil` — off. A gem has no business pointing your API's consumers at Avo's documentation.

#### `config.api.last_used_precision` {#config-api-last_used_precision}

How stale a token's `last_used_at` may get before an authenticated request rewrites it. Stamping unconditionally puts a write in the path of every API call; the default answers "is this token still in use?" at one write per hour per token.

- **Type:** a duration (`1.hour`, `5.minutes`) or a number of seconds. **Default:** `1.hour`.
- Set `0` (or `nil`) to stamp every request, for an app that needs the timestamp accurate to the second and would rather pay the write.
