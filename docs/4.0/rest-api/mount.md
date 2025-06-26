---
license: add_on
add_on: avo-api
betaStatus: Alpha
outline: [2,3]
---

# Mount Avo API

This document explains how to mount and configure the Avo API in your Rails application.

## Overview

The `mount_avo_api` method is a convenient Rails route helper that mounts the Avo API engine into your application's routing system. It provides a RESTful API for all your Avo resources, allowing external applications to interact with your data programmatically.

:::warning IMPORTANT
There is a caveat when mounting the API that requires attention:

If you have `mount_avo` inside an `authenticate` block (like `authenticate :user`), you **must** mount the API outside and before that authentication block.

**Why?** When the API is mounted inside an authentication block, all API endpoints will require the same authentication as your web interface, which breaks API functionality for external clients using API tokens.

**This do not mean that API can't use authentication, check the [Authentication](./authentication) page for more information.**

**Correct setup:**

```ruby
# config/routes.rb
Rails.application.routes.draw do
  # Mount Avo API FIRST - outside any authentication blocks
  mount_avo_api

  # Mount Avo web interface with authentication
  authenticate :user do
    mount_avo
  end
end
```

**Incorrect setups:**
```ruby
# config/routes.rb
Rails.application.routes.draw do
  # ❌ Don't do this - API will require web authentication
  authenticate :user do
    mount_avo_api  # This breaks API token authentication
    mount_avo
  end
end
```

<br />

```ruby
# config/routes.rb
Rails.application.routes.draw do
  # ❌ Don't do this - API will require web authentication
  authenticate :user do
    mount_avo
  end

  mount_avo_api  # This breaks API token authentication
end
```
:::

## Basic Usage

### Simple Mount

Add this to your `config/routes.rb` file:

```ruby
# config/routes.rb
Rails.application.routes.draw do
  mount_avo_api
end
```

This will mount the API at the default path: `#{Avo.configuration.root_path}/api`

If your Avo is configured with `root_path = "/admin"`, the API will be available at `/admin/api`.

### Custom Mount Path

You can specify a custom mount path:

```ruby
Rails.application.routes.draw do
  mount_avo_api at: "/avo_api"
end
```

This makes the API available at `/avo_api` instead of the default path.

## Configuration Options

### Mount Path Option

```ruby
mount_avo_api at: "/custom/api/path"
```

**Parameters:**
- `at:` - String specifying where to mount the API (default: `"#{Avo.configuration.root_path}/api"`)

### Additional Mount Options

You can pass any options that Rails' `mount` method accepts:

```ruby
mount_avo_api at: "/api", via: [:get, :post], constraints: { subdomain: "api" }
```

**Common options:**
- `via:` - Restrict HTTP methods
- `constraints:` - Add routing constraints
- `defaults:` - Set default parameters

### Custom Routes Block

You can provide a block to define custom routes within the API engine:

```ruby
Rails.application.routes.draw do
  mount_avo_api do
    # Custom routes within the API engine
    get 'health', to: 'health#check'
    get 'version', to: 'version#show'

    # Custom namespaces
    namespace :custom do
      resources :reports, only: [:index, :show]
    end
  end
end
```

## Generated API Endpoints

When you mount the API, it automatically generates RESTful endpoints for all your Avo resources:

### Standard Endpoints Pattern

For each resource, the following endpoints are created:

```
GET    /admin/api/resources/v1/{resource_name}        # List resources
POST   /admin/api/resources/v1/{resource_name}        # Create resource
GET    /admin/api/resources/v1/{resource_name}/:id    # Show resource
PATCH  /admin/api/resources/v1/{resource_name}/:id    # Update resource
PUT    /admin/api/resources/v1/{resource_name}/:id    # Update resource
DELETE /admin/api/resources/v1/{resource_name}/:id    # Delete resource
```

### Example for User Resource

If you have an `Avo::Resources::User` resource:

```
GET    /admin/api/resources/v1/users     # List users
POST   /admin/api/resources/v1/users     # Create user
GET    /admin/api/resources/v1/users/1   # Show user
PATCH  /admin/api/resources/v1/users/1   # Update user
PUT    /admin/api/resources/v1/users/1   # Update user
DELETE /admin/api/resources/v1/users/1   # Delete user
```

## Complete Examples

### Basic Setup

```ruby
# config/routes.rb
Rails.application.routes.draw do
  devise_for :users

  # Mount Avo API
  mount_avo_api

  # Mount Avo
  authenticate :user do
    mount_avo do
      get "tool_with_form", to: "tools#tool_with_form", as: :tool_with_form
    end
  end

  # Redirect to Avo root path
  root to: redirect(Avo.configuration.root_path)
end

```


### API with Custom Constraints

```ruby
# config/routes.rb
Rails.application.routes.draw do
  # API only accessible from api subdomain
  mount_avo_api at: "/api", constraints: { subdomain: "api" }

  # API with IP restrictions (for internal use)
  mount_avo_api at: "/internal/api", constraints: lambda { |request|
    %w[127.0.0.1 10.0.0.0/8 192.168.0.0/16].any? { |ip|
      IPAddr.new(ip).include?(request.remote_ip)
    }
  }
end
```

### Development vs Production Setup

```ruby
# config/routes.rb
Rails.application.routes.draw do
  mount_avo

  if Rails.env.development?
    # Development: Mount API with debugging routes
    mount_avo_api at: "/api" do
      get 'debug/info', to: proc { |env|
        info = {
          version: Avo::Api::VERSION,
          environment: Rails.env,
          timestamp: Time.current.iso8601
        }
        [200, { 'Content-Type' => 'application/json' }, [info.to_json]]
      }
    end
  else
    # Production: Simple mount
    mount_avo_api at: "/api"
  end
end
```
