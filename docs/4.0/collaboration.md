---
license: addon
addon_link: https://avohq.io/addons/collaboration
addon: collaboration_feature
betaStatus: Beta
outline: [2, 3]
api_docs: ./collaboration-api.html
---

# Collaboration

Keep your team in sync with built-in comments, reactions, and automatic status updates on your records. No more scattered communication across multiple tools — the conversation lives next to the data it's about.

Once installed and enabled on a resource, Avo renders a **timeline** where users can post comments, react with emoji, and see automatic entries whenever a watched attribute changes.

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.collaboration = {
    author: { name_property: :name },
    watchers: [{ property: :status }]
  }

  def fields
    field :status, as: :select, options: ["Not Started", "In Progress", "Completed"]
    collaboration_timeline
  end
end
```

With no `watchers` configured, the timeline still works for comments and reactions — it just won't record automatic property-change entries. Reactions use a default emoji set unless you customize them.

## Installation

1. **Add the gem** to your `Gemfile`:

  ```ruby
  # Gemfile
  gem "avo-collaboration", source: "https://packager.dev/avo-hq"
  ```

2. **Bundle:**

  ```bash
  bundle
  ```

3. **Install the migrations:**

  ```bash
  rails avo_collaboration:install:migrations
  ```

4. **Run the migrations:**

  ```bash
  rails db:migrate
  ```

5. **Enable collaboration** on a resource with `self.collaboration` — see [Enable collaboration on a resource](#enable-collaboration-on-a-resource).

6. **Place the timeline** in the resource's fields with `collaboration_timeline` — see [Place the timeline](#place-the-timeline).

7. **Configure permissions** by adding the [authorization methods](#authorization) to your resource policies.

## Enable collaboration on a resource

Add `self.collaboration` to a resource to turn on the timeline. The hash configures who the author is ([`author`](./collaboration-api.html#author)) and which attribute changes are recorded automatically ([`watchers`](./collaboration-api.html#watchers)).

```ruby{3-20}
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.collaboration = {
    author: {
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

### Set the author name

The author of comments, reactions, and automatic entries is your Avo `current_user`. Use [`author`](./collaboration-api.html#author)'s `name_property` to tell the timeline which attribute holds that user's display name:

```ruby
self.collaboration = {
  author: { name_property: :name }
}
```

### Watch property changes

Each entry in [`watchers`](./collaboration-api.html#watchers) records an automatic timeline entry whenever that attribute changes. Give each one a `property` to watch, and optionally a custom `message` proc (with `resource`, `record`, `property`, `old_value`, and `new_value` in scope) or an `i18n_message_key`. Provide neither and Avo uses a default message.

To translate a message, point `i18n_message_key` at a translation and interpolate `%{property}`, `%{old_value}`, and `%{new_value}`:

```yaml
# config/locales/en.yml
en:
  avo:
    collaboration:
      custom_property_changed_html: changed %{property} to %{new_value} <span class="font-bold">[Custom]</span>
```

::: info
When a translation key ends in `_html`, Rails treats the value as safe HTML, so you can include markup in your timeline messages without extra escaping — see Rails' [safe HTML translations](https://guides.rubyonrails.org/i18n.html#using-safe-html-translations).
:::

### Customize reactions

Users can react to timeline entries with emoji. Reactions are enabled by default with a standard set. To offer your own list, set [`reactions`](./collaboration-api.html#reactions):

```ruby{4-6}
self.collaboration = {
  author: { name_property: :name },
  watchers: [{ property: :status }],
  reactions: {
    options: %w[👍 👎 ❤️ 🚀 👀]
  }
}
```

## Place the timeline

Call [`collaboration_timeline`](./collaboration-api.html#collaboration_timeline) inside `fields` to render the timeline where you want it. It shows comments, reactions, and automatic property-change entries.

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

Position it among your other fields to control where the timeline appears.

## Authorization

Control who can view, create, and remove timeline entries through your resource policies. Collaboration adds three policy methods on top of Avo's [authorization](./authorization) system:

- [`collaboration_view_timeline?`](./collaboration-api.html#collaboration_view_timeline) — who can see the timeline.
- [`collaboration_create_entry?`](./collaboration-api.html#collaboration_create_entry) — who can post comments and messages.
- [`collaboration_destroy_entry?`](./collaboration-api.html#collaboration_destroy_entry) — who can remove entries.

A common setup: anyone who can view the record sees the timeline, team members can post, and users can only delete their own comments (while admins can delete anything):

```ruby
# app/policies/project_policy.rb
class ProjectPolicy < ApplicationPolicy
  def collaboration_view_timeline?
    show?
  end

  def collaboration_create_entry?
    current_user.team_member? && show?
  end

  def collaboration_destroy_entry?
    return true if current_user.admin?

    # Only own comments, never auto-generated action entries
    record.is_a?(Avo::Collaboration::Comment) && record.author == current_user
  end
end
```

See the [API reference](./collaboration-api.html#authorization) for each method's exact contract.

## Extend the collaboration models

Sometimes the default models aren't enough and you want custom associations, validations, or callbacks tied to your domain logic. You can safely reopen `Avo::Collaboration::Action`, `Avo::Collaboration::Comment`, and `Avo::Collaboration::Entry` in an initializer, the same way you'd extend other Avo models:

```ruby{7-46}
# config/initializers/avo.rb
Avo.configure do |config|
  # ... other config options ...
end

Rails.configuration.to_prepare do
  # Actions generated by watchers (property changes, status updates, etc.)
  Avo::Collaboration::Action.class_eval do
    after_create :slack_notification

    private

    def slack_notification
      SlackNotificationService.notify(message: "New action created: #{body}")
    end
  end

  # User-authored comments in the timeline
  Avo::Collaboration::Comment.class_eval do
    validates :body, presence: true, length: { maximum: 5000 }

    before_validation :sanitize_body

    private

    def sanitize_body
      self.body = HtmlSanitizer.sanitize(body)
    end
  end

  # Wrapper entry that unifies comments and actions via delegated_type :entryable
  Avo::Collaboration::Entry.class_eval do
    after_create :discord_notification

    private

    def discord_notification
      DiscordNotificationService.notify(message: "New entry created: #{body}")
    end
  end
end
```

This lets you hook collaboration events into your domain while keeping the core functionality intact. Add only the associations and callbacks that make sense for your app.
