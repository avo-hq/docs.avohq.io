---
license: add_on
add_on: avo-api
betaStatus: Alpha
outline: [2,3]
---

# Authentication

Avo API provides a flexible authentication system that can be customized for your specific needs. By default, the API requires authentication for all requests, but you can override this behavior in your controllers.

## How it works

The API uses a delegated authentication pattern where:

1. **Default Behavior**: All requests are rejected with a 401 Unauthorized error by default
2. **Override Pattern**: Individual controllers can override the `setup_authentication` method to implement custom authentication logic
3. **Error Handling**: Authentication failures are handled gracefully with JSON error responses
4. **Flexibility**: You can disable authentication entirely, implement token-based auth, session-based auth, or any custom solution

## Default Authentication

By default, Avo API controllers inherit from `Avo::Api::Resources::V1::ResourcesController`, which implements strict authentication:

```ruby{12-14}
# app/controllers/avo/api/resources/v1/resources_controller.rb
module Avo
  module Api
    module Resources
      module V1
        class ResourcesController < Avo::BaseController
          rescue_from Avo::Api::AuthenticationError do |exception|
            render json: { error: 'Unauthorized' }, status: :unauthorized
          end

          before_action :setup_authentication, prepend: true
          def setup_authentication
            raise Avo::Api::AuthenticationError
          end
        end
      end
    end
  end
end
```

This means all API requests will return a 401 Unauthorized response unless you override the authentication behavior.

## Overriding Authentication

You can customize authentication by overriding the `setup_authentication` class method in your individual controllers:

### Example 1: Disable Authentication

```ruby{7-9,13}
# app/controllers/avo/api/resources/v1/users_controller.rb
module Avo
  module Api
    module Resources
      module V1
        class UsersController < BaseResourcesController
          def setup_authentication
            # Leave empty to disable authentication
          end

          # OR

          skip_before_action :setup_authentication
        end
      end
    end
  end
end
```

### Example 2: API Key Authentication
Most suitable for server-to-server communication:

```ruby{7-12}
# app/controllers/avo/api/resources/v1/users_controller.rb
module Avo
  module Api
    module Resources
      module V1
        class UsersController < BaseResourcesController
          def setup_authentication
            api_key = request.headers['Authorization']&.sub(/^ApiKey /, '')
            unless ApiKey.active.exists?(key: api_key)
              raise Avo::Api::AuthenticationError
            end
          end
        end
      end
    end
  end
end
```

### Example 3: HTTP Basic Authentication
For more sophisticated token-based auth:

```ruby{7-16}
# app/controllers/avo/api/resources/v1/users_controller.rb
module Avo
  module Api
    module Resources
      module V1
        class UsersController < BaseResourcesController
          def setup_authentication
            raise Avo::Api::AuthenticationError unless authenticate_with_http_basic do |email, password|
              user = User.find_by(email: email)

              if user&.valid_password?(password)
                sign_in(user, store: false)
              else
                false
              end
            end
          end
        end
      end
    end
  end
end
```

## Error Responses

When authentication fails, the API returns a standardized JSON error response:

```json
{
  "error": "Unauthorized"
}
```

The response includes:
- **Status Code**: 401 Unauthorized
- **Content-Type**: application/json
- **Body**: JSON object with error message

## Best Practices

1. **Override at the Controller Level**: Each resource controller can have its own authentication strategy
2. **Use Strong Tokens**: If implementing token authentication, use cryptographically secure random tokens
3. **Rate Limiting**: Consider implementing rate limiting for API endpoints
4. **HTTPS Only**: Always use HTTPS in production for token-based authentication
5. **Token Rotation**: Implement token expiration and rotation for better security

## Security Considerations

- The default behavior (rejecting all requests) is secure by default
- Authentication errors are handled without exposing sensitive information
- Each controller can implement the authentication strategy that best fits its needs

## Testing Authentication

You can test your authentication implementations by making requests with and without proper credentials:

```bash{1-2,4-6}
# Should return 401
curl -X GET "http://localhost:3000/admin/api/resources/v1/users"

# Should return 200 (if properly authenticated)
curl -X GET "http://localhost:3000/admin/api/resources/v1/users"
  -H "Authorization: Basic YXZvQGF2b2hxLmlvOldIWV9BUkVfWU9VX1NPX0NVUklPVVM/"
```