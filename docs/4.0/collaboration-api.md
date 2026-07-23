---
license: add_on
add_on_link: https://avohq.io/addons/collaboration
add_on: collaboration_feature
betaStatus: Beta
outline: [2, 3]
guide: ./collaboration.html
prev:
  text: "Collaboration"
  link: "./collaboration.html"
next: false
---

# Collaboration API

Per-option reference for the collaboration add-on. For task-oriented documentation, installation, and worked examples, see the [Collaboration guide](./collaboration.html).

Collaboration is configured per resource through the `self.collaboration` hash, plus the `collaboration_timeline` DSL method and a set of policy methods:

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.collaboration = {
    # options listed below
  }

  def fields
    # ...
    collaboration_timeline
  end
end
```

## Resource configuration

Keys of the `self.collaboration` hash.

<Option name="`author`" headingSize="3">

Configures how the timeline displays the author of comments, reactions, and automatic entries. The author itself is always resolved from `Avo::Current.user`; this hash only controls display.

```ruby
self.collaboration = {
  author: {
    name_property: :name
  }
}
```

- **Type:** Hash
- **Default:** `nil`
- **Keys:**

| Key             | Type             | Description                                                        |
| --------------- | ---------------- | ------------------------------------------------------------------ |
| `name_property` | Symbol or String | The attribute on the author object holding their display name |

</Option>

<Option name="`watchers`" headingSize="3">

An array of watchers. Each watcher records an automatic timeline entry whenever the given attribute changes on the record.

```ruby
self.collaboration = {
  watchers: [
    {
      property: :name,
      message: -> { "#{property} changed: #{old_value} → #{new_value}" }
    },
    { property: :status, i18n_message_key: "avo.collaboration.custom_property_changed_html" },
    { property: :stage }
  ]
}
```

- **Type:** Array of Hashes
- **Default:** `nil`
- **Keys:**

| Key                | Type             | Description                                                                                             |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------------------------- |
| `property`         | Symbol or String | *(required)* The attribute to watch for changes.                                                        |
| `message`          | Proc             | Builds a custom message for the entry. Executed with `resource`, `record`, `property`, `old_value`, and `new_value` in scope. |
| `i18n_message_key` | String           | An I18n key used to translate the message instead of a `message` proc.                                  |

When a watcher provides neither `message` nor `i18n_message_key`, Avo falls back to the `avo.collaboration.property_changed` translation.

:::info Safe HTML translations
When the translation key ends in `_html`, Rails treats the value as safe HTML, so message translations may contain markup. See Rails' [safe HTML translations](https://guides.rubyonrails.org/i18n.html#using-safe-html-translations).
:::

</Option>

<Option name="`reactions`" headingSize="3">

Customizes the emoji available when reacting to timeline entries.

```ruby
self.collaboration = {
  reactions: {
    options: %w[👍 👎 ❤️ 🚀 👀]
  }
}
```

- **Type:** Hash with key `options` (Array of Strings)
- **Default:** `👍 👎 😀 🎉 😕 ❤️ 🚀 👀 💡 🔥`
- **Behavior:** Reactions are always enabled. When `reactions` is omitted, the default set above is used; supply `options` to replace it with your own list.

</Option>

## Timeline

<Option name="`collaboration_timeline`" headingSize="3">

DSL method called inside a resource's `fields` block. Renders the collaboration timeline — comments, reactions, and automatic property-change entries — at the position where it's called.

```ruby
def fields
  field :id, as: :id
  field :name

  collaboration_timeline
end
```

- **Type:** DSL method (no arguments)

</Option>

## Authorization

Policy methods, defined on your resource's Pundit-style policy, that gate access to the timeline. Each returns a boolean. These extend Avo's [authorization](./authorization) system.

<Option name="`collaboration_view_timeline?`" headingSize="3">

Whether the user can view the timeline on a record.

```ruby
# app/policies/project_policy.rb
def collaboration_view_timeline?
  show?
end
```

- **Type:** Policy method returning Boolean

</Option>

<Option name="`collaboration_create_entry?`" headingSize="3">

Whether the user can create new entries (comments and messages).

```ruby
# app/policies/project_policy.rb
def collaboration_create_entry?
  current_user.team_member? && show?
end
```

- **Type:** Policy method returning Boolean

</Option>

<Option name="`collaboration_destroy_entry?`" headingSize="3">

Whether the user can destroy an entry. The `record` passed to the policy is either an **action** entry (generated automatically when a watched attribute changes) or a **comment** entry (`Avo::Collaboration::Comment`, posted by a user).

```ruby
# app/policies/project_policy.rb
def collaboration_destroy_entry?
  return true if current_user.admin?

  record.is_a?(Avo::Collaboration::Comment) && record.author == current_user
end
```

- **Type:** Policy method returning Boolean

</Option>
