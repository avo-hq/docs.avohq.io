---
license: add_on
betaStatus: Alpha
outline: [2,3]
---

# CSRF Protection in Avo API

## Overview

Cross-Site Request Forgery (CSRF) protection is a security measure that prevents malicious websites from making unauthorized requests on behalf of authenticated users. The Avo API implements CSRF protection using Rails' built-in mechanisms.

## Implementation

The Avo API implements CSRF protection through a customizable class method hook in the `Avo::Api::Resources::V1::ResourcesController`:

```ruby{10-12}
# app/controllers/avo/api/resources/v1/resources_controller.rb
module Avo
  module Api
    module Resources
      module V1
        class ResourcesController < Avo::BaseController
          delegate :setup_csrf_protection, to: :class
          before_action :setup_csrf_protection, prepend: true

          def self.setup_csrf_protection
            protect_from_forgery with: :null_session
          end
        end
      end
    end
  end
end
```

This approach makes the CSRF protection easily configurable and overridable.

## Customizing CSRF Protection

You can override the `setup_csrf_protection` method in your controllers that inherit from `Avo::Api::Resources::V1::ResourcesController` to customize CSRF handling:

### Example 1: Change CSRF protection method
```ruby{7-9}
# app/controllers/avo/api/resources/v1/users_controller.rb
module Avo
  module Api
    module Resources
      module V1
        class UsersController < BaseResourcesController
          def self.setup_csrf_protection
            protect_from_forgery with: :exception
          end
        end
      end
    end
  end
end
```

### Example 2: Disable CSRF protection entirely
```ruby{7-9}
# app/controllers/avo/api/resources/v1/users_controller.rb
module Avo
  module Api
    module Resources
      module V1
        class UsersController < BaseResourcesController
          def self.setup_csrf_protection
            # No CSRF protection - leave empty
          end
        end
      end
    end
  end
end
```

## What is `:null_session`?

The `:null_session` strategy is specifically designed for API endpoints and works as follows:

1. **For requests with valid CSRF tokens**: Normal session handling continues
2. **For requests without valid CSRF tokens**: A new, empty session is created for the duration of the request
3. **No exceptions are raised**: Unlike other strategies, this doesn't raise `ActionController::InvalidAuthenticityToken`

## Why `:null_session` for APIs?

This strategy is ideal for REST APIs because:

- **Stateless Nature**: APIs are typically stateless and don't rely on browser sessions
- **Token-based Authentication**: APIs usually use tokens (JWT, API keys) rather than session-based authentication
- **Cross-Origin Requests**: APIs are designed to be consumed by various clients (mobile apps, SPAs, other services)
- **No CSRF Token Distribution**: API clients don't typically have access to CSRF tokens like HTML forms do

## Best Practices for API Consumers

When consuming the Avo API:

1. **Use Token-based Authentication**: Implement proper API token authentication
2. **HTTPS Only**: Always use HTTPS to prevent token interception
3. **Token Rotation**: Implement token rotation for long-lived applications

## Testing CSRF Protection

To test that CSRF protection is working:

```bash
# This should work (with null_session, no exception is raised)
curl -X POST http://localhost:3000/admin/api/resources/v1/users \
  -H "Content-Type: application/json" \
  -d '{"user": {"first_name": "Test User"}}'
```

## Related Security Considerations

- Implement proper authentication and authorization
- Use CORS headers appropriately for browser-based clients
- Validate all input data
- Use HTTPS in production
- Implement rate limiting for API endpoints

## References

- [Rails Security Guide - CSRF](https://guides.rubyonrails.org/security.html#cross-site-request-forgery-csrf)
- [ActionController CSRF Protection](https://api.rubyonrails.org/classes/ActionController/RequestForgeryProtection.html)