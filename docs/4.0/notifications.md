---
license: addon
addon_link: https://avohq.io/addons/notifications
outline: [2, 3]
api_docs: ./notifications-api.html
---

# Notifications

Avo Notifications is an in-app notification system for your Avo admin panel. It lets you send notifications to one user, several users, or everyone, complete with action buttons, severity levels, and optional real-time delivery via ActionCable.

Notifications appear in a bell icon dropdown in the navbar and can also be browsed through a full Avo resource page with scopes and bulk actions.

## Requirements

- The [`avo`](./installation.html) gem
- ActionCable (optional, for real-time delivery)

## Installation

:::info
Follow these steps in order. The installer generates a migration, an initializer, and an Avo resource for you.
:::

### 1. Install the gem

Add the following to your `Gemfile`:

```ruby
# Gemfile
gem "avo-notifications", source: "https://packager.dev/avo-hq/"
```

Then

```bash
bundle install
```

### 2. Run the installer

```bash
bin/rails generate avo:notifications install
```

This creates:

- A migration for the `avo_notifications_notifications` table
- An initializer at `config/initializers/avo_notifications.rb`
- An Avo resource at `app/avo/resources/avo_notification.rb`
- A controller at `app/controllers/avo/avo_notifications_controller.rb`

### 3. Run migrations

```bash
bin/rails db:migrate
```

### 4. Include the concern in your User model

```ruby
# app/models/user.rb
class User < ApplicationRecord
  include Avo::Notifications::HasNotifications # [!code ++]
end
```

This adds an `avo_notifications` association and helper methods for reading notification state on the user (covered in [Reading notifications](#reading-notifications)).

## Configuration

After installation, tune the gem in `config/initializers/avo_notifications.rb`. Every option has a sensible default, so an empty block works out of the box.

```ruby
# config/initializers/avo_notifications.rb
Avo::Notifications.configure do |config|
  config.ttl = 30.days      # how long notifications are kept before cleanup
  config.realtime = true    # real-time delivery via ActionCable
  config.dropdown_limit = 10 # notifications shown in the bell dropdown
  config.user_class = "User" # model used for recipients and `to: :all`
  config.user_display_name_method = :name # sender attribution name
end
```

See the [API reference](./notifications-api.html#configuration) for each option's type, default, and behavior.

## Sending notifications

Use [`Avo::Notifications.send`](./notifications-api.html#send-parameters) (aliased as `Avo::Notifications.notify`) to create and deliver notifications. Only [`to`](./notifications-api.html#to) and [`title`](./notifications-api.html#title) are required:

```ruby
Avo::Notifications.send(
  to: user,
  title: "Welcome to the admin panel!",
  body: "You now have access to all features.",
  level: :info
)
```

See the [send parameters reference](./notifications-api.html#send-parameters) for every argument and its validation rules.

### Who receives a notification

Every notification belongs to a single recipient — there are no shared "global" rows. To reach more than one user, the [`to:`](./notifications-api.html#to) argument fans out into one row per recipient, so read, saved, and done state are always tracked per user.

```ruby
# A single user — returns the notification
Avo::Notifications.send(
  to: @user,
  title: "Your export is ready",
  level: :success
)

# Several users — one row per recipient, returns an Array
Avo::Notifications.send(
  to: User.where(admin: true),
  title: "New signup spike",
  level: :info
)

# Every user — fans out to one row per user, returns an Array
Avo::Notifications.send(
  to: :all,
  title: "System maintenance tonight at 10 PM",
  level: :warning
)
```

:::warning
A blank `to:` (`nil` or `""`) raises an error — notifications must be addressed. An empty Array, on the other hand, is a deliberate no-op: it sends nothing and returns `[]`.
:::

### Choosing a level

Each notification carries a [`level`](./notifications-api.html#level) — `:info`, `:success`, `:warning`, or `:error` — that controls its icon and color in the UI. It defaults to `:info`. See the [levels table](./notifications-api.html#level) for the icon and color of each.

### Tagging with a type

Pass [`notification_type:`](./notifications-api.html#notification_type) to tag a notification with a freeform category. The tag is rendered as a small label on the notification row, handy for distinguishing kinds of notifications at a glance (e.g. `"mention"`, `"system"`, `"billing"`).

```ruby
Avo::Notifications.send(
  to: @user,
  title: "You were mentioned in a comment",
  notification_type: "mention",
  level: :info
)
```

### Adding action buttons

Notifications can include up to 3 [action buttons](./notifications-api.html#buttons). Each button needs a `label` and `url`, and optionally a `method` (defaults to `"get"`; supported: `get`, `post`, `patch`, `put`, `delete`).

```ruby
Avo::Notifications.send(
  to: @user,
  title: "Project review pending",
  level: :info,
  buttons: [
    { label: "Approve", url: "/projects/#{@project.id}/approve", method: "post" },
    { label: "Reject", url: "/projects/#{@project.id}/reject", method: "post" },
    { label: "View", url: "/projects/#{@project.id}" }
  ]
)
```

### From Avo actions

```ruby
# app/avo/actions/approve_project.rb
class Avo::Actions::ApproveProject < Avo::BaseAction
  self.name = "Approve project"

  def handle(query:, fields:, current_user:, **args)
    query.each do |project|
      project.approve!

      Avo::Notifications.send(
        to: project.owner,
        title: "Your project was approved",
        body: "#{current_user.name} approved '#{project.name}'.",
        level: :success,
        sender: current_user,
        url: "/admin/projects/#{project.id}"
      )
    end

    succeed "#{query.count} project(s) approved."
  end
end
```

### From model callbacks

```ruby
# app/models/order.rb
class Order < ApplicationRecord
  after_update :notify_status_change

  private

  def notify_status_change
    return unless saved_change_to_status?

    Avo::Notifications.send(
      to: user,
      title: "Order ##{id} status changed to #{status}",
      level: :info,
      url: "/admin/orders/#{id}"
    )
  end
end
```

### From background jobs

```ruby
# app/jobs/process_export_job.rb
class ProcessExportJob < ApplicationJob
  def perform(export_id, user_id)
    export = Export.find(export_id)
    user = User.find(user_id)

    export.process!

    Avo::Notifications.send(
      to: user,
      title: "Your export is ready",
      body: "#{export.name} has finished processing.",
      level: :success,
      url: export.download_url
    )
  end
end
```

## Notification states

Each notification carries three independent states, all tracked per recipient:

| State           | What it does                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| **Read/unread** | Unread notifications drive the bell badge count.                                                                |
| **Saved**       | "Save for later" bookmarks a notification — it keeps a marker and appears under the Saved scope.                |
| **Done**        | Archives a notification out of the inbox (and the badge). Still reachable under the Done scope, and reversible. |

The **inbox** — the main view used by the bell dropdown and the resource's default scope — is every notification that isn't done, newest first. See the [state API](./notifications-api.html#query-and-state-api) for the methods and columns behind each state.

## Reading notifications

Read state from anywhere with the [query API](./notifications-api.html#query-and-state-api):

```ruby
# The inbox for a user (not-done notifications), newest first
Avo::Notifications.for_user(user, limit: 10)

# Count unread notifications (drives the bell badge)
Avo::Notifications.unread_count(user)

# Mark a user's whole unread inbox as read
Avo::Notifications.mark_all_as_read(user)
```

After including the `HasNotifications` concern, your User model exposes the same state directly:

```ruby
user.unread_avo_notifications_count       # => 5
user.mark_all_avo_notifications_read!     # marks the unread inbox as read
user.avo_notification_unread?(notification) # => true/false
```

:::info
**How read state works:** read state is tracked per notification via a `read_at` timestamp. Because each recipient has their own row, marking one user's copy read never affects another's. "Done" notifications are archived out of the inbox and excluded from the unread count, but remain available under the Done scope.
:::

## Bell component

The bell icon automatically appears in your Avo navbar when the gem is installed. It shows:

- A bell icon with an unread count badge (hidden when the inbox has no unread notifications)
- A dropdown panel with the most recent inbox notifications (limited by [`dropdown_limit`](./notifications-api.html#dropdown_limit))
- A "Mark all as read" link when there are unread notifications
- A "View all notifications" link to the full notification resource

Each row reveals quick actions on hover — **mark as read/unread**, **save for later**, and **mark as done** — and a saved notification keeps its bookmark visible even when you're not hovering. No additional configuration is needed; the component renders automatically for logged-in users.

## Real-time delivery

When [`config.realtime = true`](./notifications-api.html#realtime) (the default), each new notification is pushed to its recipient over ActionCable as a Turbo Stream, so the bell updates without a page refresh.

### How it works

Each user subscribes to their own stream through `Avo::Notifications::NotificationChannel` (`stream_for current_user`), and a notification is broadcast only to its recipient — there is no shared global stream. The `notifications-cable` Stimulus controller subscribes on page load and renders incoming Turbo Stream messages.

### ActionCable setup

Make sure ActionCable is configured in your Rails app. A typical `config/cable.yml`:

```yaml
# config/cable.yml
development:
  adapter: async

production:
  adapter: redis
  url: redis://localhost:6379/1
```

:::warning
If ActionCable is not available or not configured, real-time delivery is silently skipped — notifications still work, they just require a page refresh to appear. Broadcasting errors are logged but never raise exceptions.
:::

## Notification resource

The installer generates an Avo resource at `app/avo/resources/avo_notification.rb` that gives you a full management interface for notifications. By default it's scoped to the current user and hidden from the sidebar.

### Scopes

- **Inbox** _(default)_ — the main view: everything that isn't archived (not done)
- **Unread** — unread notifications only
- **Read** — read notifications only
- **Saved** — bookmarked ("save for later") notifications
- **Done** — archived notifications

Done notifications are archived out of every scope except **Done**.

### Bulk actions

- **Mark as read** / **Mark as unread**
- **Save** / **Unsave**
- **Mark as done** / **Mark as undone**

:::info
The generated resource sets `visible_on_sidebar = false`, so notifications are reached through the bell dropdown's "View all" link rather than the sidebar. It's a plain Avo resource — add fields, filters, or a `DeleteNotifications` action, or flip it onto the sidebar, by editing the generated file.
:::

## Cleanup

Every notification is created with an `expires_at` derived from the [`ttl`](./notifications-api.html#ttl) configuration. Over time, expired notifications accumulate in the database — use the built-in rake task to clean them up:

```bash
bin/rails avo_notifications:cleanup
```

This deletes all notifications past their `expires_at`.

**Recommended:** schedule this as a daily cron job:

```bash
# Daily at 2 AM
0 2 * * * cd /path/to/app && bin/rails avo_notifications:cleanup
```
