---
license: addon
addon_link: https://avohq.io/addons/notifications
outline: [2, 3]
guide: ./notifications.html
prev:
  text: "Notifications"
  link: "./notifications.html"
next: false
---

# Notifications API

Per-option reference for the Avo Notifications add-on — configuration, the `Avo::Notifications.send` parameters, and the query API. For task-oriented documentation and worked examples, see the [Notifications guide](./notifications.html).

## Configuration

Set in `config/initializers/avo_notifications.rb`:

```ruby
Avo::Notifications.configure do |config|
  # options listed below
end
```

<Option name="`ttl`" headingSize="3">

How long a notification is kept before cleanup can delete it. Each notification's `expires_at` is set to `Time.current + ttl` at creation; the [cleanup](#cleanup_expired) task deletes rows past that time.

```ruby
config.ttl = 30.days
```

- **Type:** `ActiveSupport::Duration`
- **Default:** `30.days`

</Option>

<Option name="`realtime`" headingSize="3">

Enables real-time delivery of new notifications over ActionCable as a Turbo Stream. When `false`, notifications still work but only appear on the next page load.

```ruby
config.realtime = true
```

- **Type:** Boolean
- **Default:** `true`

:::info
Even when `true`, broadcasting is skipped if ActionCable is not defined or has no running server. Broadcast failures are logged, never raised.
:::

</Option>

<Option name="`dropdown_limit`" headingSize="3">

Maximum number of notifications shown in the bell dropdown panel.

```ruby
config.dropdown_limit = 10
```

- **Type:** Integer
- **Default:** `10`

</Option>

<Option name="`user_class`" headingSize="3">

The model class used to resolve recipients when sending to `:all`. Passed to `constantize`, then `.all` is fanned out into one notification per record.

```ruby
config.user_class = "User"
```

- **Type:** String
- **Default:** `"User"`

</Option>

<Option name="`user_display_name_method`" headingSize="3">

The method called on a notification's `sender` to render its attribution name.

```ruby
config.user_display_name_method = :name
```

- **Type:** Symbol
- **Default:** `:name`
- **Fallback:** if the sender doesn't respond to this method, `:email` is tried, then `to_s`.

</Option>

## Send parameters

`Avo::Notifications.send` (aliased as `Avo::Notifications.notify`) creates and delivers a notification. Every notification belongs to a single recipient; sending to multiple recipients fans out into one row each.

```ruby
Avo::Notifications.send(
  to: user,
  title: "Welcome to the admin panel!",
  body: "You now have access to all features.",
  level: :info
)
```

The return value depends on `to:` — a single record returns the created notification; an Array or `:all` returns an Array of notifications.

<Option name="`to`" headingSize="3">

The recipient(s). A single record returns the notification; an Array or `:all` fans out to one row per recipient and returns an Array.

```ruby
to: user            # a record
to: [user1, user2]  # an Array of records
to: :all            # every record of `user_class`
```

- **Type:** ActiveRecord record, Array of records, or the Symbol `:all`
- **Required:** yes
- **Validation:** a blank `to:` (`nil` or `""`) raises `Avo::Notifications::Error`. An empty Array is a deliberate no-op — it sends nothing and returns `[]`.

</Option>

<Option name="`title`" headingSize="3">

The notification title.

```ruby
title: "Your export is ready"
```

- **Type:** String
- **Required:** yes
- **Validation:** must be present and 255 characters or less, otherwise raises `Avo::Notifications::Error`.

</Option>

<Option name="`body`" headingSize="3">

Longer description text shown below the title.

```ruby
body: "The report finished processing."
```

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`level`" headingSize="3">

Severity, controlling the icon and color in the UI.

```ruby
level: :warning
```

| Level      | Icon           | Color |
| ---------- | -------------- | ----- |
| `:info`    | Info circle    | Blue  |
| `:success` | Circle check   | Green |
| `:warning` | Alert triangle | Amber |
| `:error`   | Alert circle   | Red   |

- **Type:** Symbol
- **Default:** `:info`
- **Values:** `:info`, `:success`, `:warning`, `:error`
- **Validation:** any other value raises `Avo::Notifications::Error`.

</Option>

<Option name="`notification_type`" headingSize="3">

Freeform category rendered as a small tag on the notification row (e.g. `"mention"`, `"system"`, `"billing"`).

```ruby
notification_type: "mention"
```

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`url`" headingSize="3">

URL to navigate to when the notification title is clicked.

```ruby
url: "/admin/orders/42"
```

- **Type:** String
- **Default:** `nil`

</Option>

<Option name="`sender`" headingSize="3">

The record that sent the notification, used for attribution. Its display name is resolved via [`user_display_name_method`](#user_display_name_method).

```ruby
sender: current_user
```

- **Type:** ActiveRecord record
- **Default:** `nil`

</Option>

<Option name="`buttons`" headingSize="3">

Action buttons rendered on the notification. Each button is a Hash with `label` and `url`, and an optional `method` (defaults to `"get"`).

```ruby
buttons: [
  { label: "Approve", url: "/projects/1/approve", method: "post" },
  { label: "View", url: "/projects/1" }
]
```

- **Type:** Array of Hashes with keys `label`, `url`, and optional `method`
- **Default:** `nil`
- **Values:** `method` must be one of `get`, `post`, `patch`, `put`, `delete` (case-insensitive)
- **Validation:** raises `Avo::Notifications::Error` if not an Array, if it holds more than 3 buttons, if a button is not a Hash, if `label` or `url` is blank, or if `method` is not a supported verb.

</Option>

## Query and state API

Module methods on `Avo::Notifications` for reading and mutating notification state.

<Option name="`for_user`" headingSize="3">

The inbox for a user — not-done notifications, newest first. Used by the bell dropdown and the resource's default scope. Pass `limit:` to cap the result.

```ruby
Avo::Notifications.for_user(user, limit: 10)
```

- **Returns:** an `ActiveRecord::Relation`

</Option>

<Option name="`unread_count`" headingSize="3">

Number of unread notifications in the inbox — drives the bell badge. Done notifications are excluded.

```ruby
Avo::Notifications.unread_count(user)
```

- **Returns:** Integer

</Option>

<Option name="`mark_all_as_read`" headingSize="3">

Marks a user's whole unread inbox as read.

```ruby
Avo::Notifications.mark_all_as_read(user)
```

</Option>

<Option name="`cleanup_expired!`" headingSize="3">

Deletes every notification past its `expires_at`. Also exposed as the `avo_notifications:cleanup` rake task.

```ruby
Avo::Notifications.cleanup_expired!
```

</Option>

<Option name="Per-notification state changes" headingSize="3">

Each toggles one state on a single notification and is idempotent.

```ruby
Avo::Notifications.mark_as_read(notification)
Avo::Notifications.mark_as_unread(notification)
Avo::Notifications.save_for_later(notification)
Avo::Notifications.unsave(notification)
Avo::Notifications.mark_as_done(notification)
Avo::Notifications.mark_as_undone(notification)
```

| State           | Column              | Set by                                    |
| --------------- | ------------------- | ----------------------------------------- |
| Read/unread     | `read_at`           | `mark_as_read` / `mark_as_unread`         |
| Saved           | `saved_at`          | `save_for_later` / `unsave`               |
| Done            | `marked_as_done_at` | `mark_as_done` / `mark_as_undone`         |

The three states are independent and all tracked per recipient row.

</Option>

## User model methods

After including `Avo::Notifications::HasNotifications`, the model gains an `avo_notifications` association plus:

<Option name="`unread_avo_notifications_count`" headingSize="3">

Unread notifications in the inbox (done ones excluded).

```ruby
user.unread_avo_notifications_count # => 5
```

- **Returns:** Integer

</Option>

<Option name="`mark_all_avo_notifications_read!`" headingSize="3">

Marks the user's unread inbox as read.

```ruby
user.mark_all_avo_notifications_read!
```

</Option>

<Option name="`avo_notification_unread?`" headingSize="3">

Whether a given notification is unread.

```ruby
user.avo_notification_unread?(notification) # => true
```

- **Returns:** Boolean

</Option>
