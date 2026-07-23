---
license: addon
addon_link: https://avohq.io/addons/json-api
addon: avo-api
outline: [2, 3]
---

# REST API

The `avo-api` add-on exposes a JSON REST API for every Avo resource. It reuses your resources' field definitions, visibility rules, and authorization, so a resource you already built for the admin panel is instantly available over HTTP — list, read, create, update, and delete, plus read-only association traversal.

This single page is the full guide **and** reference: installation, mounting, authentication, permissions, the request/response format, and the configuration surface.

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

Run the install generator:

```bash
rails generate avo_api:install
```

The generator:

- Copies a migration that creates the `avo_api_tokens` and `avo_api_permission_grants` tables (API tokens and their permission grants).
- Appends an `Avo::Api.configure` block to `config/initializers/avo.rb` with the `manage_tokens_if` gate and token-pepper instructions.

Then run the migration:

```bash
rails db:migrate
```

### Set the token pepper

API tokens are stored as HMAC-SHA256 digests, keyed with a server-side **pepper** you must provide. Token creation and authentication **fail closed** (raise) until it's set. Generate a secret and add it to your Rails credentials:

```bash
rails secret          # prints a long random value
rails credentials:edit
```

```yaml
# config/credentials.yml.enc (via `rails credentials:edit`)
avo_api:
  token_pepper: <the value from `rails secret`>
```

Alternatively set the `AVO_API_TOKEN_PEPPER` environment variable. Prefer credentials in production.

:::warning
Changing the pepper invalidates every existing token — they can no longer be authenticated. Treat it like a signing key: set it once and keep it stable.
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

Read-only association traversal is also available:

```
GET    /api/resources/v1/teams/:id/members   # Records of the `members` association
```

The path segment is the resource's `route_key` (e.g. `blog_posts`, `product_categories`). No per-resource controllers are required — a single catch-all controller serves every resource.

## Authentication

Every API request authenticates through one of two paths, checked in this order:

1. **Bearer token** — an `Authorization: Bearer <token>` header. This is the primary mechanism, designed for external and server-to-server clients. Tokens are managed from the Avo UI.
2. **Code hook** — when no Bearer token is presented, the request falls through to the `setup_authentication` hook, which you override to plug in your own scheme (HTTP Basic, session, etc.).

A Bearer token always wins when present. A malformed or invalid token is a uniform `401 Unauthorized` with no fall-through — it never silently degrades to the code hook. With no override and no valid token, every request is denied (`401`), so the API is closed by default.

### Managing API tokens

Tokens are standalone Bearer credentials managed through a dedicated Avo resource. Who can see and manage them is gated by [`manage_tokens_if`](#manage_tokens_if), which **defaults to deny** — opt specific users in:

```ruby
# config/initializers/avo.rb
Avo::Api.configure do |config|
  config.manage_tokens_if = ->(user) { user.admin? }
end
```

Once enabled, an **API Tokens** entry appears in the Avo sidebar. From there you can:

- **Create a token** with a name and an optional expiry (leave expiry blank for a token that never expires).
- **Copy the secret** — the raw token is shown **exactly once**, immediately after creation, on a one-time reveal screen. It's never stored or shown again. If lost, revoke it and create a new one.
- **Disable / enable** a token to temporarily deactivate it (reversible).
- **Revoke** a token to deactivate it permanently (terminal — a revoked token cannot be re-enabled).

A token's `status` is one of `Active`, `Disabled`, `Expired`, or `Revoked`. Only `Active` tokens authenticate. The UI also tracks `last_used_at` so you can spot stale tokens.

Use the secret as a Bearer token:

```bash
curl https://example.com/api/resources/v1/teams \
  -H "Authorization: Bearer avo_xxxxxxxxxxxxxxxxxxxx"
```

:::warning
A token grants nothing on its own — you must also grant it permissions (see [Permissions](#permissions)). A brand-new token with no grants is denied (`403`) on every resource.
:::

### The `setup_authentication` code hook

When no Bearer token is presented, the request calls `setup_authentication`. By default it raises and the request is rejected. Override it in a resource controller (generate one first — see [Custom controllers](#custom-controllers)) to authenticate with your own scheme.

**Disable authentication** for a resource (public, unauthenticated reads):

```ruby
# app/controllers/avo/api/resources/v1/users_controller.rb
class UsersController < BaseResourcesController
  def setup_authentication
    # Leave empty to disable the code-auth check
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

**HTTP Basic:**

```ruby
# app/controllers/avo/api/resources/v1/users_controller.rb
class UsersController < BaseResourcesController
  def setup_authentication
    raise Avo::Api::AuthenticationError unless authenticate_with_http_basic do |email, password|
      user = User.find_by(email: email)
      user&.valid_password?(password) ? sign_in(user, store: false) : false
    end
  end
end
```

Raise `Avo::Api::AuthenticationError` to reject a request; it renders `{ "error": "Unauthorized" }` with status `401`.

:::info Token path vs. code-auth path
The two paths behave differently for authorization: **token** requests are governed entirely by the [permission matrix](#permissions) and Pundit row-scoping is off. **Code-auth** requests keep your Pundit policies and draw from the read-only default permissions list. Pick tokens for external clients and the code hook for trusted internal integrations.
:::

## Permissions

Authorization is **opt-in from zero**: nothing is reachable until a grant exists. Each grant is a `resource × verb` pair (`teams` × `index`, `teams` × `create`, …), where verbs map 1:1 to the REST actions: `index`, `show`, `create`, `update`, `destroy`.

There are two grant sets:

- **Per-token grants** — govern a specific Bearer token. Edit them from that token's page. Token requests draw only from their own grants and can be granted any verb, including writes.
- **The default permissions list** — governs the code-auth path (requests authenticated via `setup_authentication`). Manage it at **API Settings** (`/<root_path>/avo_api/settings`). This list is **read-only**: it may grant `index` and `show` only. Writes always require a Bearer token.

A request with no matching grant gets `403 Forbidden`. The `403` is checked before record loading, so an ungranted client can't probe whether a record exists.

For the code-auth path, your existing **Pundit policies still apply** on top of the grant — the same `Scope`/policy methods that protect your admin panel scope and filter the API response. For token requests, Pundit row-scoping is bypassed and the grant matrix is authoritative.

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

### Association traversal

`GET /api/resources/v1/teams/1/members` returns the records of an association, serialized with the **target** resource's `:index` fields:

```json
{
  "records": [
    { "id": 5, "name": "John Doe" },
    { "id": 8, "name": "Jane Roe" }
  ]
}
```

This is read-only. The actor must be granted `index` (or `show`) on the target resource; otherwise the response is `403`.

### Field serialization

Fields are respected according to their view visibility, and typed values are serialized per field type:

| Field type | Shape |
| --- | --- |
| Text, number, boolean, date/datetime | The raw value |
| `belongs_to` | `{ "id": 5, "label": "John Doe" }` |
| `has_many`, `has_one` | `{ "count": 12 }` (or `{ "id": 5 }` for a single loaded record) |
| `file`, `files` | `{ "filename": "…", "content_type": "…", "byte_size": 1234, "url": "…" }` |

:::info Association visibility
An association key is **omitted entirely** when the actor isn't granted read access to the target resource — the response never leaks a foreign key or the existence of an ungranted record.
:::

:::info File URLs for token requests
For **token** actors, file `url`s are signed and expiring (valid for a few minutes) rather than permanent, so a leaked response can't be replayed after the token is revoked. Code-auth requests get the standard attachment URL.
:::

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

`PATCH` for a partial update, `PUT` for a full one. Both return the updated record on its `:show` view (`200 OK`).

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

You don't need any controllers for the standard behavior — the catch-all controller serves every resource. Generate a controller only when you want to **override** behavior for a specific resource (a custom `setup_authentication`, `setup_csrf_protection`, response shape, or serialization).

Generate one for a single resource:

```bash
rails generate avo_api:controller User
```

Or one for every existing resource at once:

```bash
rails generate avo_api:controllers
```

Both create controllers under `app/controllers/avo/api/resources/v1/` that inherit from `BaseResourcesController`. Naming follows Rails conventions:

| Avo resource | Generated controller |
| --- | --- |
| `Avo::Resources::User` | `Avo::Api::Resources::V1::UsersController` |
| `Avo::Resources::BlogPost` | `Avo::Api::Resources::V1::BlogPostsController` |
| `Avo::Resources::ProductCategory` | `Avo::Api::Resources::V1::ProductCategoriesController` |

The route for a resource that has an override controller is drawn first, so it wins over the catch-all. A controller subclassing `BaseResourcesController` keeps authentication and the permission gate; one that inherits a plain `ActionController` is a full-bypass escape hatch (public, unauthenticated, ungated) — use it deliberately.

### Overridable methods

`BaseResourcesController` exposes these hooks:

- **Actions:** `index`, `show`, `create`, `update`, `destroy`, `related`
- **Result callbacks:** `create_success_action`, `create_fail_action`, `update_success_action`, `update_fail_action`, `destroy_success_action`, `destroy_fail_action`
- **Serialization:** `serialize_records(resources, view)`, `serialize_record(resource, view)`, `serialize_field_value(field)`
- **Auth hooks:** `setup_authentication`, `self.setup_csrf_protection`

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
| `401` | Unauthorized (authentication failed or missing) |
| `403` | Forbidden (no permission grant) |
| `404` | Not Found |
| `422` | Unprocessable Entity (validation errors) |

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

- **`at:`** — String, the mount path. Default: `"api"`.
- **Rails `mount` options** — any option `mount` accepts is forwarded, e.g. `via:` (restrict HTTP methods), `constraints:`, `defaults:`.
- **Block** — optional; defines custom routes inside the API engine.

### `manage_tokens_if`

Gate deciding which users may manage API tokens and the default permissions list. Applied to every token surface (resource, one-time reveal, and lifecycle actions).

```ruby
# config/initializers/avo.rb
Avo::Api.configure do |config|
  config.manage_tokens_if = ->(user) { user.admin? }
end
```

- **Type:** Proc — a one-arg lambda `->(user) { … }`, or a zero-arg Avo block `-> { current_user.admin? }` (evaluated with `current_user`/`user` available).
- **Default:** `->(_user) { false }` — deny everyone.
- **Behavior:** Fail-closed. Any result other than `true` — including a raised exception (e.g. a `nil` user) — denies access.

### Token pepper

Not an Avo config value — a secret read from Rails credentials or the environment, used to HMAC token digests.

```yaml
# config/credentials.yml.enc
avo_api:
  token_pepper: <a long random secret>
```

- **Source:** `avo_api.token_pepper` in Rails credentials (preferred), or the `AVO_API_TOKEN_PEPPER` environment variable.
- **Required:** yes — token creation and authentication raise until it's set.
- **Stability:** changing it invalidates every existing token.
