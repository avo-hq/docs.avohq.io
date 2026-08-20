---
license: addon
addon_link: https://avohq.io/addons/json-api
addon: avo-api
outline: [2, 3]
---

# REST API

The `avo-api` add-on exposes a JSON REST API for every Avo resource. It reuses your resources' field definitions, view visibility rules, and Pundit policies, so a resource you already built for the admin panel is available over HTTP — list, read, create, update, and delete.

This page covers installation, mounting, authentication, how the current user is established, authorization, and the request/response format.

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

## Discovery

One endpoint describes everything the API version exposes, so a client doesn't have to be told which resources exist or what fields they carry:

```
GET    /api/resources/v1/_schema
```

It authenticates and authorizes like any other endpoint: a resource whose `index?` policy denies the current user is left out of the payload entirely, so the schema never advertises what that user can't reach.

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
| `required` | Read from the model's presence validators. |
| `readonly` | `null` when the resource sets it with a block, because a block is evaluated per record and discovery has none. |

:::info
Use `visible_on` to decide which fields a `POST` or `PATCH` body may carry: a field that isn't visible on `new` or `edit` is not writable.
:::

## Authentication

Every request runs through `setup_authentication`, a hook on `BaseResourcesController`. **The default implementation raises**, so the API is closed until you override it — every request gets `401 Unauthorized`:

```json
{ "error": "Unauthorized" }
```

Raise `Avo::Api::AuthenticationError` anywhere in the hook to reject a request with that response.

:::warning No built-in token authentication
`avo-api` ships no token model, no `Authorization: Bearer` handling, and no API-key store. `setup_authentication` is the single extension point — the credential scheme is yours to implement. The examples below show the common ones.
:::

### Set the current user

Authenticating the *request* is only half the job. Avo's authorization — Pundit policies and policy scopes — runs against `Avo::Current.user`, and **`setup_authentication` does not set it**. If you verify a credential but never establish a user, `Avo::Current.user` stays `nil` and every policy scope receives `nil`.

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

**Bearer token**, resolving to a user — see the snippet above.

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

:::warning A denied action redirects instead of rendering JSON
Policy *methods* (`index?`, `update?`, …) returning `false` raise `Avo::NotAuthorizedError`, which Avo handles by setting a flash message and issuing a **302 redirect** — behavior meant for the HTML admin panel. An API client sees a redirect to your root URL, not a JSON error.

Policy **scopes** are unaffected and are the reliable way to restrict API access. If you need JSON for denied actions, add a `rescue_from Avo::NotAuthorizedError` to your `BaseResourcesController`:

```ruby
# app/controllers/avo/api/resources/v1/base_resources_controller.rb
rescue_from Avo::NotAuthorizedError do
  render json: { error: "Forbidden" }, status: :forbidden
end
```
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
| `302` | A policy method denied the action — a redirect, not JSON (see [Authorization](#authorization)) |
| `401` | Authentication failed or missing |
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
