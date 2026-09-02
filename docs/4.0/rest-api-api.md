---
license: addon
addon_link: https://avohq.io/addons/avo-api
outline: [2, 3]
guide: ./rest-api.html
prev:
  text: "REST API"
  link: "./rest-api.html"
next: false
---

# REST API reference

Per-item reference for the `avo-api` add-on's public surface. For task-oriented documentation and worked examples, see the [REST API guide](./rest-api.html).

The add-on has no initializer configuration — no `Avo::Api.configure` block, environment variable, or credential. Its surface is a route helper, the generators, the controller hooks, and two public methods, all listed below.

## Mounting

<Option name="`mount_avo_api`">

Route helper that mounts the API engine. Available inside `Rails.application.routes.draw`.

```ruby
# config/routes.rb

# Default: mounts at /api
mount_avo_api

# Mount under Avo's root path (e.g. /admin/api)
mount_avo_api at: "#{Avo.configuration.root_path}/api"

# Restrict to an api subdomain
mount_avo_api at: "/api", constraints: { subdomain: "api" }

# Add custom routes inside the API engine
mount_avo_api do
  get "health", to: "health#check"
end
```

- **`at:`** — String, the mount path. **Default:** `"api"`.
- **Rails `mount` options** — any other option is forwarded to Rails' `mount`, e.g. `via:`, `constraints:`, `defaults:`.
- **Block** — optional; drawn inside the API engine's routes.

</Option>

## Generators

<Option name="`avo_api:install`">

Everything a first install needs: every resource controller, the `BaseResourcesController` they inherit from, and the migration for the `avo_api_tokens` table. Invokes `avo_api:generate` and `avo_api:tokens` under the hood.

```bash
rails generate avo_api:install
rails generate avo_api:install --version v2
```

- **`--version`** — String, the version namespace the controllers are generated under. **Default:** `v1`.

</Option>

<Option name="`avo_api:generate`">

The controllers half alone: generates every resource controller (via `avo_api:controllers`) and exports `BaseResourcesController`. Does not touch the tokens table.

```bash
rails generate avo_api:generate
```

- **`--version`** — String, the version namespace. **Default:** `v1`.

</Option>

<Option name="`avo_api:tokens`">

The tokens table alone: writes the `avo_api_tokens` migration without touching any controller. This is the upgrade path for an app that was running the API before tokens shipped.

```bash
rails generate avo_api:tokens
rails db:migrate
```

Running it twice is a no-op rather than an error — when the migration already exists it prints a notice and generates nothing.

</Option>

<Option name="`avo_api:controller`">

One controller for a single resource. Takes the resource name as an argument.

```bash
rails generate avo_api:controller User
```

</Option>

<Option name="`avo_api:controllers`">

Resource controllers for every Avo resource, without re-exporting `BaseResourcesController`.

```bash
rails generate avo_api:controllers
```

:::warning It does not create the base controller
The generated controllers inherit from `BaseResourcesController` but this generator doesn't create that class. Run `avo_api:generate` first (or on its own — it invokes `avo_api:controllers` and then exports the base controller).
:::

</Option>

Controller naming follows Rails conventions:

| Avo resource | Generated controller |
| --- | --- |
| `Avo::Resources::User` | `Avo::Api::Resources::V1::UsersController` |
| `Avo::Resources::BlogPost` | `Avo::Api::Resources::V1::BlogPostsController` |
| `Avo::Resources::ProductCategory` | `Avo::Api::Resources::V1::ProductCategoriesController` |

## Controller hooks

Both hooks live on your app's `BaseResourcesController` (`app/controllers/avo/api/resources/v1/base_resources_controller.rb`), so an override there applies to every resource controller.

<Option name="`setup_authentication`">

Instance-level `before_action` that authenticates every request. The default implementation accepts a request carrying a valid [API token](./rest-api.html#authentication) and rejects everything else. Override it to [bring your own scheme](./rest-api.html#bring-your-own-authentication); in an override, `super` accepts valid tokens alongside yours, and omitting `super` opts out of tokens entirely.

```ruby
# app/controllers/avo/api/resources/v1/base_resources_controller.rb
def setup_authentication
  raise Avo::Api::AuthenticationError if invalid_credentials?
end
```

- **Type:** instance method.
- **Default:** accepts a valid API token, rejects everything else with `401`.

</Option>

<Option name="`self.setup_csrf_protection`">

Class-level hook that installs the CSRF strategy. The default is Rails' `:null_session` — the right choice for stateless JSON clients, which carry no CSRF token: such requests get a fresh empty session instead of an `InvalidAuthenticityToken` exception.

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

- **Type:** class method.
- **Default:** `protect_from_forgery with: :null_session`.

</Option>

### Overridable methods

Beyond the two hooks, `BaseResourcesController` exposes these methods to override — call `super` and adjust, or replace outright. Put an override in `BaseResourcesController` to apply it everywhere, or in one resource controller to scope it.

| Group | Methods |
| --- | --- |
| Actions | `index`, `show`, `create`, `update`, `destroy` |
| Result callbacks | `create_success_action`, `create_fail_action`, `update_success_action`, `update_fail_action`, `destroy_success_action`, `destroy_fail_action` |
| Serialization | `serialize_records(resources, view)`, `serialize_record(resource, view)`, `serialize_field_value(field)` |

The guide has a [worked example](./rest-api.html#custom-controllers).

## Public API

<Option name="`Avo::Api.token_request?`">

`true` while a valid API token is authenticating the request in flight, `false` otherwise. This is the supported guard for a [`config.authenticate_with`](./rest-api.html#your-apps-own-authentication-still-runs) block that can't be satisfied for token traffic — guard on it rather than on anything inside the gem's controllers.

```ruby
# config/initializers/avo.rb
config.authenticate_with do
  next if Avo::Api.token_request?

  authenticate_user!
end
```

- **Type:** Boolean.

</Option>

<Option name="`Avo::Api::AuthenticationError`">

Raise it anywhere in `setup_authentication` to reject the request with `401 Unauthorized` and `{ "error": "Unauthorized" }`.

```ruby
raise Avo::Api::AuthenticationError if @api_user.nil?
```

</Option>

## Status codes

| Status | Meaning |
| --- | --- |
| `200` | Success |
| `201` | Created |
| `401` | Authentication failed or missing — an absent, malformed, unknown, expired, revoked, or orphaned token all look the same ([why](./rest-api.html#token-lifecycle)) |
| `403` | Refused on permission. `reason` says which: `token_scope` (outside the token's [grants](./rest-api.html#scope-a-token)) or `policy` (a policy method denied it) — see [the three refusals](./rest-api.html#tell-the-three-refusals-apart) |
| `404` | Record not found, out of policy scope, or the `avo-api` feature isn't enabled on your license |
| `422` | Validation errors |
