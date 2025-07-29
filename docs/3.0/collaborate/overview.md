---
license: add_on
add_on: collaboration_feature
betaStatus: Beta
outline: [2,3]
---

# Collaboration

Keep your team in sync with built-in comments and status updates. No more scattered communication across multiple tools.

## Installation

1. **Add gem:** Add the following to your Gemfile:
   ```ruby
   gem "avo-collaborate", source: "https://packager.dev/avo-hq"
   ```

2. **Bundle:** Run bundle install:
   ```bash
   bundle
   ```

3. **Install migrations:** Generate the required database migrations:
   ```bash
   rails avo_collaborate:install:migrations
   ```

4. **Run migrations:** Apply the migrations to your database:
   ```bash
   rails db:migrate
   ```

5. **Configure resources:** Enable collaboration on your resources by adding `self.collaboration` to your resource configuration.

6. **Add timeline:** Include the collaboration timeline in your resource using `collaboration_timeline`.

<Option name="self.collaboration">

Configure collaboration settings for your resource. This hash contains author and watchers configuration.

```ruby{3-21}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.collaboration = {
    author: {
      current_author: -> { current_user },
      name_property: :name,
    },
    watchers: [
      {
        property: :name,
        message: -> { "This property has been updated #{property}: #{old_value} -> #{new_value}" }
      },
      {
        property: :status,
        i18n_message_key: "avo.collaboration.custom_property_changed_html",
      },
      {
        property: :stage,
      }
    ]
  }

  def fields
    # ...
  end
end
```

### `author`

- **`current_author`**: A lambda that returns the current user/author object
- **`name_property`**: The property on the author object that contains their display name

### `watchers`

Watchers monitor changes to specific properties and can generate automatic timeline entries when those properties change.

Each watcher can have:

- **`property`**: The property name to watch for changes (required)
- **`message`**: A lambda that generates a custom message when the property changes. Available variables: `property`, `old_value`, `new_value`
- **`i18n_message_key`**: An internationalization key for the message instead of a custom lambda

If neither `message` nor `i18n_message_key` is provided, a default message will be generated.

#### I18n Example

When using `i18n_message_key`, define your translations in your locale files:

```yaml
en:
  hello: "Hello world"
  avo:
    collaboration:
      custom_property_changed_html: changed %{property} to %{new_value} <span class="font-bold">[Custom]</span>
```

The message can use interpolation variables like `%{property}`, `%{old_value}`, and `%{new_value}`.

</Option>

<Option name="collaboration_timeline">

The `collaboration_timeline` method renders the collaboration timeline component at the specific position where it's defined within your resource's fields.

```ruby{13}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.collaboration = {
    # ...
  }

  def fields
    field :id, as: :id
    field :name
    field :status
    field :stage, as: :select, options: ["Not Started", "In Progress", "Completed"]

    collaboration_timeline
  end
end
```

This DSL method will display the collaboration timeline (showing comments, status updates, and property changes) wherever you place it in your resource definition. You can position it among your other fields to control where the timeline appears in your resource's layout.
</Option>
