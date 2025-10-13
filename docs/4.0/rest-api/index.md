---
license: add_on
add_on: avo-api
betaStatus: Alpha
outline: [2,3]
---

# REST API

Avo provides automatic REST API endpoints for all your resources. This allows you to interact with your data programmatically using standard HTTP methods.

## Installation

```ruby
# Gemfile
gem "avo-api", source: "https://packager.dev/avo-hq/"
```

```bash
bundle install
```

After installing the gem, run the install generator to set up your API controllers:

```bash
rails generate avo_api:install
```

This generator will:
- Generate individual controllers for all your existing Avo resources
- Export a customizable `BaseResourcesController` to your app directory
- Provide examples for authentication, authorization, and customization

:::tip PRO TIP
The generated controllers inherit from the `BaseResourcesController`, which you can customize to add global API behavior like authentication, custom serialization, or response formatting.
:::

## Overview

The REST API automatically generates endpoints for all your Avo resources, respecting field visibility settings and authorization rules.

### API Endpoints

For a resource called `teams`, the following endpoints are automatically available:

```
GET    /api/resources/v1/teams        # List all teams
POST   /api/resources/v1/teams        # Create a new team
GET    /api/resources/v1/teams/:id    # Show a specific team
PATCH  /api/resources/v1/teams/:id    # Update a team
PUT    /api/resources/v1/teams/:id    # Update a team
DELETE /api/resources/v1/teams/:id    # Delete a team
```

## Response Format

### Index (GET /api/resources/v1/teams)

```json
{
  "records": [
    {
      "id": 1,
      "name": "Development Team",
      "url": "https://dev.company.com",
      "logo": "https://logo.clearbit.com/dev.company.com?size=180"
    },
    {
      "id": 2,
      "name": "Marketing Team",
      "url": "https://marketing.company.com",
      "logo": "https://logo.clearbit.com/marketing.company.com?size=180"
    }
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

### Show (GET /api/resources/v1/teams/1)

```json
{
  "record": {
    "id": 1,
    "name": "Development Team",
    "url": "https://dev.company.com",
    "logo": "https://logo.clearbit.com/dev.company.com?size=180",
    "admin": {
      "id": 5,
      "label": "John Doe"
    },
    "team_members": {
      "count": 12
    }
  }
}
```

### Create/Update Success Response

```json
{
  "record": {
    "id": 3,
    "name": "New Team",
    "url": "https://new.company.com"
  }
}
```

### Error Response

```json
{
  "errors": {
    "name": ["can't be blank"],
    "url": ["is invalid"]
  },
  "message": "Failed to create Team"
}
```

## Field Visibility

The API respects field visibility settings from your resource configuration. Fields will be visible in API endpoints based on their standard view settings:

- **Index API** (`GET /api/resources/v1/teams`) - Shows fields visible on `:index` view
- **Show API** (`GET /api/resources/v1/teams/:id`) - Shows fields visible on `:show` view
- **Create API** (`POST /api/resources/v1/teams`) - Returns fields visible on `:new` view
- **Update API** (`PATCH/PUT /api/resources/v1/teams/:id`) - Returns fields visible on `:edit` view

```ruby
# app/avo/resources/team.rb
class Avo::Resources::Team < Avo::BaseResource
  def fields
    field :id, as: :id
    field :name, as: :text
    field :url, as: :text

    # Hidden from index API
    field :internal_notes, as: :text, hide_on: :index

    # Only in show API
    field :logo, as: :external_image, only_on: :show
  end
end
```

## Authentication & Authorization

:::info
Check out the [Authentication](./authentication) page for more information on how to authenticate your requests.
:::

For authenticated requests, the API uses the same [authorization](./../authorization) as your Avo interface. Authorization is automatically applied based on each resource's policy.

### Policy-Based Authorization

Each resource's authorization is handled through its corresponding policy class (using Pundit). The API respects your existing authorization rules:

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

```ruby
# Admin user request
GET /api/resources/v1/comments
# Returns: All comments (4 records)

# Regular user request
GET /api/resources/v1/comments
# Returns: Only user's own comments (2 records)

# Unauthorized request
GET /api/resources/v1/comments
# Returns: 401 Unauthorized
```

The same authorization logic that protects your Avo admin interface automatically protects your API endpoints.

## Creating Resources (POST)

### Request Format

To create a new resource, send a POST request with the field data in the request body. The API supports nested parameter format.

```bash
POST /api/resources/v1/teams
Content-Type: application/json

{
  "team": {
    "name": "New Development Team",
    "url": "https://dev.newteam.com",
    "description": "A newly formed development team"
  }
}
```

### Examples

**Basic Creation:**
```bash
curl -X POST /api/resources/v1/teams \
  -H "Content-Type: application/json" \
  -d '{
    "team": {
      "name": "Mobile Team",
      "url": "https://mobile.company.com"
    }
  }'
```

**With Associations:**
```bash
curl -X POST /api/resources/v1/teams \
  -H "Content-Type: application/json" \
  -d '{
    "team": {
      "name": "Backend Team",
      "url": "https://backend.company.com",
      "admin_id": 5
    }
  }'
```

**Response (Success - 201 Created):**
```json
{
  "record": {
    "id": 3,
    "name": "Mobile Team",
    "url": "https://mobile.company.com",
    "description": null,
    "admin": null
  }
}
```

**Response (Error - 422 Unprocessable Entity):**
```json
{
  "errors": {
    "name": ["can't be blank"],
    "url": ["is not a valid URL"]
  },
  "message": "Failed to create Team"
}
```

### Field Types

Different field types accept different data formats:

**Text/String Fields:**
```json
{
  "name": "Team Name",
  "description": "Team description"
}
```

**Number Fields:**
```json
{
  "count": 42,
  "price": 19.99
}
```

**Boolean Fields:**
```json
{
  "active": true,
  "featured": false
}
```

**Date/DateTime Fields:**
```json
{
  "created_at": "2024-01-15T10:30:00Z",
  "start_date": "2024-01-15"
}
```

**Belongs To Associations:**
```json
{
  "admin_id": 5,
  "category_id": 2
}
```

## Updating Resources (PATCH/PUT)

### Request Format

To update an existing resource, send a PATCH or PUT request with the field data. The API supports nested parameter format.

```bash
PATCH /api/resources/v1/teams/1
Content-Type: application/json

{
  "team": {
    "name": "Updated Team Name",
    "description": "Updated description"
  }
}
```

### Examples

**Partial Update (PATCH):**
```bash
curl -X PATCH /api/resources/v1/teams/1 \
  -H "Content-Type: application/json" \
  -d '{
    "team": {
      "name": "Updated Mobile Team"
    }
  }'
```

**Full Update (PUT):**
```bash
curl -X PUT /api/resources/v1/teams/1 \
  -H "Content-Type: application/json" \
  -d '{
    "team": {
      "name": "Completely Updated Team",
      "url": "https://new.company.com",
      "description": "New description"
    }
  }'
```

**Response (Success - 200 OK):**
```json
{
  "record": {
    "id": 1,
    "name": "Updated Mobile Team",
    "url": "https://mobile.company.com",
    "description": "Team description",
    "admin": {
      "id": 5,
      "name": "John Doe"
    }
  }
}
```

## Deleting Resources (DELETE)

### Request Format

```bash
DELETE /api/resources/v1/teams/1
```

### Example

```bash
curl -X DELETE /api/resources/v1/teams/1
```

**Response (Success - 200 OK):**
```json
{
  "message": "Team deleted successfully"
}
```

**Response (Error - 422 Unprocessable Entity):**
```json
{
  "errors": ["Cannot delete team with active projects"],
  "message": "Failed to delete Team"
}
```

## Query Parameters

### Pagination (Index only)

- `page` - Page number (default: 1)
- `per_page` - Records per page (default: from Avo configuration)

### Sorting (Index only)

- `sort_by` - Field to sort by
- `sort_direction` - `asc` or `desc`

### Example

```bash
GET /api/resources/v1/teams?page=2&per_page=10&sort_by=name&sort_direction=asc
```

## Field Type Handling

Different field types are serialized appropriately:

### Belongs To Fields
```json
{
  "admin": {
    "id": 5,
    "label": "John Doe"
  }
}
```

### Has Many/Has One Fields
```json
{
  "team_members": {
    "count": 12
  }
}
```

### File Fields
```json
{
  "avatar": {
    "filename": "profile.jpg",
    "url": "/rails/active_storage/blobs/...",
    "content_type": "image/jpeg",
    "byte_size": 15234
  }
}
```

## Customization

### Custom API Controller

:::warning 🚧 Work In Progress
:::
<!--
If you need to customize the API behavior, you can generate a custom controller:

```bash
rails generate avo:api_controller --version=v1
```

This creates `app/controllers/avo/api/resources/v1/resources_controller.rb` which inherits from `BaseController` and overrides only the necessary methods for JSON responses.

### Override Methods

The generated controller inherits all functionality from `BaseController` and only overrides the response methods. Common customizations:

```ruby
class Avo::Api::V1::ResourcesController < BaseController
  private

  # Customize record serialization
  def serialize_record(resource, view)
    result = super(resource, view)
    result[:custom_field] = "custom_value"
    result
  end

  # Customize success responses
  def create_success_action
    render json: {
      record: serialize_record(@resource, :show),
      message: "Successfully created #{@resource.singular_name}"
    }, status: :created
  end

  # Add custom logic to parent methods
  def index
    super # Calls BaseController#index which sets up @resources

    # Add custom logic here before rendering
    render json: {
      records: serialize_records(@resources, :index),
      pagination: pagination_info,
      meta: { total_resources: @resources.count }
    }
  end
end
``` -->

## CORS Configuration

:::warning 🚧 Work In Progress
:::
<!--
If you're accessing the API from a web application, you may need to configure CORS. Add the `rack-cors` gem to your Gemfile and configure it:

```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'
    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
``` -->

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `422` - Unprocessable Entity (validation errors)
- `404` - Not Found
- `401` - Unauthorized
- `403` - Forbidden
