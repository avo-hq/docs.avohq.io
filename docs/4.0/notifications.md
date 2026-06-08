---
license: add_on
add_on_link: "https://avohq.io/pricing-4?add_ons[]=notifications"
betaStatus: "Not yet released"
outline: [2, 3]
---

# Notifications

Avo Notifications is an in-app notification system for your Avo admin panel. It lets you send notifications to one user, several users, or everyone, complete with action buttons, severity levels, and optional real-time delivery via ActionCable.

Notifications appear in a bell icon dropdown in the navbar and can also be browsed through a full Avo resource page with scopes and bulk actions.

## Requirements

- `avo` (core)
- ActionCable (optional, for real-time delivery)

## Installation

:::info
Follow these steps in order. The installer generates a migration, an initializer, and an Avo resource for you.
:::

### 1. Install the gem

Add the following to your `Gemfile`:

```ruby
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
class User < ApplicationRecord
  include Avo::Notifications::HasNotifications # [!code ++] [!code focus]
end
```

This adds helper methods for reading notification state on the user (covered in [Reading notifications](#reading-notifications)).

## Configuration

After installation, configure the gem in `config/initializers/avo_notifications.rb`:

```ruby
Avo::Notifications.configure do |config|
  # How long notifications are kept before cleanup deletes them
  config.ttl = 30.days

  # Enable real-time delivery via ActionCable
  config.realtime = true

  # Max notifications shown in the bell dropdown
  config.dropdown_limit = 10

  # The model class used for notification recipients
  config.user_class = "User"

  # Method called on the sender to display their name
  config.user_display_name_method = :name
end
```

## Sending notifications

Use `Avo::Notifications.send` (aliased as `Avo::Notifications.notify`) to create and deliver notifications.

### Basic usage

```ruby
Avo::Notifications.send( # [!code focus]
  to: user, # [!code focus]
  title: "Welcome to the admin panel!", # [!code focus]
  body: "You now have access to all features.", # [!code focus]
  level: :info # [!code focus]
) # [!code focus]
```

| Parameter           | Required | Description                                                             |
| ------------------- | -------- | ----------------------------------------------------------------------- |
| `to`                | Yes      | Recipient(s): a record, an Array of records, or `:all` (every user)     |
| `title`             | Yes      | Notification title (max 255 characters)                                 |
| `body`              | No       | Longer description text                                                 |
| `level`             | No       | Severity: `:info`, `:success`, `:warning`, `:error` (default `:info`)   |
| `notification_type` | No       | Freeform label shown as a tag on the row (e.g. `"mention"`, `"system"`) |
| `url`               | No       | URL to navigate to when the notification title is clicked               |
| `sender`            | No       | The user who sent the notification (used for attribution)               |
| `buttons`           | No       | Array of action buttons (max 3)                                         |

### Who receives a notification

Every notification belongs to a single recipient — there are no shared "global" rows. To reach more than one user, the `to:` argument fans out into one row per recipient, so read, saved, and done state are always tracked per user.

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
A blank `to:` raises an error — notifications must be addressed. Pass a record, an Array, or `:all`.
:::

### Notification levels

Each notification has a level that controls its icon and color in the UI:

| Level      | Icon           | Color |
| ---------- | -------------- | ----- |
| `:info`    | Info circle    | Blue  |
| `:success` | Circle check   | Green |
| `:warning` | Alert triangle | Amber |
| `:error`   | Alert circle   | Red   |

### Notification type

Pass `notification_type:` to tag a notification with a freeform category. The tag is rendered as a small label on the row, which is handy for distinguishing kinds of notifications at a glance (e.g. `"mention"`, `"system"`, `"billing"`).

```ruby
Avo::Notifications.send(
  to: @user,
  title: "You were mentioned in a comment",
  notification_type: "mention", # [!code focus]
  level: :info
)
```

### Adding action buttons

Notifications can include up to 3 action buttons. Each button needs a `label` and `url`, and optionally a `method` (defaults to `"get"`).

```ruby
Avo::Notifications.send(
  to: @user,
  title: "Project review pending",
  level: :info,
  buttons: [ # [!code focus]
    { label: "Approve", url: "/projects/#{@project.id}/approve", method: "post" }, # [!code focus]
    { label: "Reject", url: "/projects/#{@project.id}/reject", method: "post" }, # [!code focus]
    { label: "View", url: "/projects/#{@project.id}" } # [!code focus]
  ] # [!code focus]
)
```

Supported `method` values: `get`, `post`, `patch`, `put`, `delete`.

### From Avo actions

```ruby
class Avo::Actions::ApproveProject < Avo::BaseAction
  self.name = "Approve project"

  def handle(query:, fields:, current_user:, **args)
    query.each do |project|
      project.approve!

      Avo::Notifications.send( # [!code focus]
        to: project.owner, # [!code focus]
        title: "Your project was approved", # [!code focus]
        body: "#{current_user.name} approved '#{project.name}'.", # [!code focus]
        level: :success, # [!code focus]
        sender: current_user, # [!code focus]
        url: "/admin/projects/#{project.id}" # [!code focus]
      ) # [!code focus]
    end

    succeed "#{query.count} project(s) approved."
  end
end
```

### From model callbacks

```ruby
class Order < ApplicationRecord
  after_update :notify_status_change

  private

  def notify_status_change
    return unless saved_change_to_status?

    Avo::Notifications.send( # [!code focus]
      to: user, # [!code focus]
      title: "Order ##{id} status changed to #{status}", # [!code focus]
      level: :info, # [!code focus]
      url: "/admin/orders/#{id}" # [!code focus]
    ) # [!code focus]
  end
end
```

### From background jobs

```ruby
class ProcessExportJob < ApplicationJob
  def perform(export_id, user_id)
    export = Export.find(export_id)
    user = User.find(user_id)

    export.process!

    Avo::Notifications.send( # [!code focus]
      to: user, # [!code focus]
      title: "Your export is ready", # [!code focus]
      body: "#{export.name} has finished processing.", # [!code focus]
      level: :success, # [!code focus]
      url: export.download_url # [!code focus]
    ) # [!code focus]
  end
end
```

## Notification states

Each notification carries three independent states, all tracked per recipient:

| State           | Column              | What it does                                                                                                    |
| --------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Read/unread** | `read_at`           | Unread notifications drive the bell badge count.                                                                |
| **Saved**       | `saved_at`          | "Save for later" bookmarks a notification — it keeps a marker and appears under the Saved scope.                |
| **Done**        | `marked_as_done_at` | Archives a notification out of the inbox (and the badge). Still reachable under the Done scope, and reversible. |

The **inbox** — the main view used by the bell dropdown and the resource's default scope — is every notification that isn't done, newest first.

## Reading notifications

### Query methods

```ruby
# The inbox for a user (not-done notifications), newest first
Avo::Notifications.for_user(user, limit: 10)

# Count unread notifications (drives the bell badge)
Avo::Notifications.unread_count(user)

# Per-notification state changes
Avo::Notifications.mark_as_read(notification)
Avo::Notifications.mark_as_unread(notification)
Avo::Notifications.save_for_later(notification)
Avo::Notifications.unsave(notification)
Avo::Notifications.mark_as_done(notification)
Avo::Notifications.mark_as_undone(notification)

# Mark a user's whole unread inbox as read
Avo::Notifications.mark_all_as_read(user)

# Delete expired notifications (also available as a rake task)
Avo::Notifications.cleanup_expired!
```

### User model methods

After including the `HasNotifications` concern, your User model gains these methods:

```ruby
user.unread_avo_notifications_count
# => 5 — unread notifications in the inbox (done ones are excluded)

user.mark_all_avo_notifications_read!
# Marks the user's unread inbox as read

user.avo_notification_unread?(notification)
# => true/false
```

:::info
**How read state works:** read state is tracked per notification via a `read_at` timestamp. Because each recipient has their own row, marking one user's copy read never affects another's. "Done" notifications are archived out of the inbox and excluded from the unread count, but remain available under the Done scope.
:::

## Bell component

The bell icon automatically appears in your Avo navbar when the gem is installed. It shows:

- A bell icon with an unread count badge (hidden when the inbox has no unread notifications)
- A dropdown panel with the most recent inbox notifications (limited by `dropdown_limit`)
- A "Mark all as read" link when there are unread notifications
- A "View all notifications" link to the full notification resource

Each row reveals quick actions on hover — **mark as read/unread**, **save for later**, and **mark as done** — and a saved notification keeps its bookmark visible even when you're not hovering. No additional configuration is needed; the component renders automatically for logged-in users.

## Real-time delivery

When `config.realtime = true` (the default), each new notification is pushed to its recipient over ActionCable as a Turbo Stream, so the bell updates without a page refresh.

### How it works

Each user subscribes to their own stream through `Avo::Notifications::NotificationChannel` (`stream_for current_user`), and a notification is broadcast only to its recipient — there is no shared global stream. The `notifications-cable` Stimulus controller subscribes on page load and renders incoming Turbo Stream messages.

### ActionCable setup

Make sure ActionCable is configured in your Rails app. A typical `config/cable.yml`:

```yaml
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
The notification resource has `visible_on_sidebar = false` by default. Notifications are accessed through the bell dropdown's "View all" link. You can change this in the generated resource if you prefer sidebar access.
:::

## Cleanup

Every notification is created with an `expires_at` derived from the `ttl` configuration. Over time, expired notifications accumulate in the database — use the built-in rake task to clean them up:

```bash
bin/rails avo_notifications:cleanup
```

This deletes all notifications past their `expires_at`.

**Recommended:** schedule this as a daily cron job:

```bash
# Daily at 2 AM
0 2 * * * cd /path/to/app && bin/rails avo_notifications:cleanup
```
