---
license: add_on
add_on: avo-api
betaStatus: Alpha
outline: [2,3]
---

# Avo API Controller Generators

This document explains how to use the Rails generators to create individual controllers for your Avo API resources.

## Overview

The `avo-api` gem provides two generators to help you create individual controllers for each resource. This allows for resource-specific customization while maintaining all the base functionality.

## Available Generators

### 1. Bulk Controller Generator

Creates controllers for **all existing Avo resources** at once.

```bash
rails generate avo_api:controllers
```

**What it does:**
- Automatically discovers all existing Avo resources in your application
- Creates individual controllers for each resource
- Places them in `app/controllers/avo/api/resources/v1/`
- Each controller inherits from `BaseResourcesController`

**Example output:**
```
  ✓ Created UsersController
  ✓ Created PostsController
  ✓ Created CommentsController
  ✓ Created ProfilesController
  ✓ Created TagsController

Generated 5 controllers successfully!
All controllers inherit from BaseResourcesController and can be customized as needed.
```

### 2. Single Controller Generator

Creates a controller for a **specific resource**.

```bash
rails generate avo_api:controller ResourceName
```

**Parameters:**
- `ResourceName` - The name of the resource (e.g., User, Post, BlogPost, ProductCategory)

**Examples:**
```bash
rails generate avo_api:controller User
rails generate avo_api:controller Post
rails generate avo_api:controller BlogPost
rails generate avo_api:controller ProductCategory
```

**Example output:**
```
      create  app/controllers/avo/api/resources/v1/users_controller.rb
Created UsersController at app/controllers/avo/api/resources/v1/users_controller.rb
You can now customize this controller by adding methods or overriding the base functionality.
```

## Generated Controller Structure

Each generated controller follows this structure:

```ruby
module Avo
  module Api
    module Resources
      module V1
        class UsersController < BaseResourcesController
          # Add any custom logic for User resources here
          #
          # Example: Override methods to customize behavior
          # def index
          #   super
          #   # Add custom logic after calling super
          # end
          #
          # def show
          #   super
          #   # Add custom logic for show action
          # end
        end
      end
    end
  end
end
```

## Resource to Controller Mapping

The generators follow Rails naming conventions:

| Avo Resource | Generated Controller |
|---------------|---------------------|
| `Avo::Resources::User` | `Avo::Api::Resources::V1::UsersController` |
| `Avo::Resources::Post` | `Avo::Api::Resources::V1::PostsController` |
| `Avo::Resources::Comment` | `Avo::Api::Resources::V1::CommentsController` |
| `Avo::Resources::BlogPost` | `Avo::Api::Resources::V1::BlogPostsController` |
| `Avo::Resources::ProductCategory` | `Avo::Api::Resources::V1::ProductCategoriesController` |

## File Locations

Generated controllers are placed in:
```
app/controllers/avo/api/resources/v1/
├── users_controller.rb
├── posts_controller.rb
├── comments_controller.rb
├── profiles_controller.rb
└── tags_controller.rb
```

## Customizing Generated Controllers

Since each controller inherits from `BaseResourcesController`, you get all the standard CRUD functionality automatically. You can customize behavior by overriding methods:

### Example: Custom Index Logic

```ruby
class UsersController < BaseResourcesController
  def index
    super
    # Add custom logic after the base index action
    # The @resources variable contains the paginated records
    # The @pagy variable contains pagination info
  end
end
```

### Example: Custom Show Logic

```ruby
class UsersController < BaseResourcesController
  def show
    super
    # Add custom logic after the base show action
    # The @resource variable contains the Avo resource instance
    # The @record variable contains the actual model record
  end
end
```

### Example: Custom Create Logic

```ruby
class UsersController < BaseResourcesController
  private

  def create_success_action
    # Custom success response for user creation
    render json: {
      record: serialize_record(@resource, :show),
      message: "Welcome! Your account has been created successfully."
    }, status: :created
  end

  def create_fail_action
    # Custom error response for user creation
    render json: {
      errors: @record.errors,
      message: "Account creation failed. Please check the errors below."
    }, status: :unprocessable_entity
  end
end
```

### Example: Adding Before Actions

```ruby
class UsersController < BaseResourcesController
  before_action :require_admin, only: [:destroy]
  before_action :log_user_access, only: [:show, :index]

  private

  def require_admin
    # Custom authorization logic
    head :forbidden unless current_user&.admin?
  end

  def log_user_access
    # Custom logging logic
    Rails.logger.info "User #{current_user&.id} accessed users API"
  end
end
```

## Available Methods to Override

The `BaseResourcesController` provides these methods that you can override:

### CRUD Actions
- `index` - List resources
- `show` - Show single resource
- `create` - Create new resource
- `update` - Update existing resource
- `destroy` - Delete resource

### Success/Failure Callbacks
- `create_success_action` - Called after successful creation
- `create_fail_action` - Called after failed creation
- `update_success_action` - Called after successful update
- `update_fail_action` - Called after failed update
- `destroy_success_action` - Called after successful deletion
- `destroy_fail_action` - Called after failed deletion

### Serialization Methods
- `serialize_records(resources, view)` - Serialize multiple records
- `serialize_record(resource, view)` - Serialize single record
- `serialize_field_value(field)` - Serialize individual field

## Workflow

1. **Create your Avo resources** as usual in `app/avo/resources/`
2. **Update your routes** to use individual controllers (this is already done)
3. **Generate controllers** using one of the generators:
   - `rails generate avo_api:controllers` (for all resources)
   - `rails generate avo_api:controller ResourceName` (for specific resource)
4. **Customize as needed** by overriding methods in the generated controllers

## Notes

- Generated controllers automatically inherit all functionality from `BaseResourcesController`
- You don't need to implement basic CRUD operations unless you want to customize them
- The routing system automatically maps to the correct controller based on the resource name
- All existing Avo features (authorization, field visibility, etc.) continue to work
- Controllers are generated with helpful comments showing common customization patterns
