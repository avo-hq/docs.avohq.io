# Reserved model names and routes

When defining models in an Avo-powered application, certain names should be avoided as they are used by Avo’s internal controllers. Using these names may lead to conflicts, routing issues, or unexpected behavior.

## Model names to avoid

Avo uses the following names for its internal controllers:

- `action`
- `application`
- `association`
- `attachment`
- `base_application`
- `base`
- `chart`
- `debug`
- `home`
- `private`
- `resource`
- `search`

Using these names for models may override built-in functionality, cause routing mismatches, or introduce other conflicts.

## Why these names are reserved

Avo relies on these names for its controller and routing system. For example:
- `resource` is essential for managing Avo resources.
- `chart` is used for analytics and visualizations.
- `search` handles search functionality.

Since Avo dynamically maps models and controllers, using these names may interfere with how Avo processes requests and displays resources.

## Alternative approaches

If your application requires one of these names, consider the following alternatives:
- **Use a prefix or suffix**
  - `user_resource` instead of `resource`
  - `advanced_search` instead of `search`
- **Choose a synonym**
  - `graph` instead of `chart`

### Using Avo with existing models

If your application already has models with these names, you can generate an Avo resource with a different name while keeping the same model class.

For example for `Resource` run the following command:

```sh
bin/rails generate avo:resource user_resource --model-class resource
```

This will generate:

- `Avo::Resources::UserResource`
- `Avo::UserResourcesController`

However, it will still use the existing `Resource` model, ensuring no conflicts arise.

## Route Conflicts with `resources :resources`

If your application has a route definition like:

```ruby
resources :resources
```

This will create path helpers such as `resources_path`, which **conflicts with [Avo’s internal routing helpers](https://github.com/avo-hq/avo/blob/main/app/helpers/avo/url_helpers.rb#L3)**. Avo uses `resources_path` internally, and having this route in your application **will override Avo’s default helpers**, potentially breaking parts of the admin panel.

### How to Fix It

To prevent conflicts, rename the route helpers to something more specific:

```ruby
resources :resources, as: 'articles'
```

This allows you to maintain the desired URL structure (`/resources`) without interfering with Avo’s internals.
