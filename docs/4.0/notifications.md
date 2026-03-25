---
license: add_on
betaStatus: Beta
outline: [2,3]
---

# Notifications

Avo Notifications is an in-app notification system for your Avo admin panel. It lets you send targeted or global notifications to your admin users, complete with action buttons, severity levels, and optional real-time delivery via ActionCable.

Notifications appear in a bell icon dropdown in the navbar and can also be browsed through a full Avo resource page with scopes, filters, and bulk actions.

## Requirements

- `avo` (core)
- ActionCable (optional, for real-time delivery)

## Installation

:::info
Follow these steps in order. The installer generates migrations, an initializer, and an Avo resource for you.
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
- A migration for the `avo_notifications` table
- A migration to add `avo_notifications_last_read_at` to your users table
- An initializer at `config/initializers/avo_notifications.rb`
- An Avo resource for managing notifications

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

| Parameter  | Required | Description                                                  |
| ---------- | -------- | ------------------------------------------------------------ |
| `title`    | Yes      | Notification title (max 255 characters)                      |
| `to`       | No       | Recipient user. Omit for a global notification               |
| `body`     | No       | Longer description text                                      |
| `level`    | No       | Severity: `:info`, `:success`, `:warning`, `:error` (default `:info`) |
| `url`      | No       | URL to navigate to when the notification title is clicked    |
| `sender`   | No       | The user who sent the notification                           |
| `buttons`  | No       | Array of action buttons (max 3)                              |

### Targeted vs global notifications

**Targeted** notifications are sent to a specific user by passing the `to:` parameter. **Global** notifications omit `to:` and are visible to all admin users.

```ruby
# Targeted — only this user sees it
Avo::Notifications.send(
  to: @user,
  title: "Your export is ready",
  level: :success
)

# Global — all admin users see it
Avo::Notifications.send(
  title: "System maintenance tonight at 10 PM",
  level: :warning
)
```

### Notification levels

Each notification has a level that controls its icon and color in the UI:

| Level      | Icon                | Color  |
| ---------- | ------------------- | ------ |
| `:info`    | Info circle (blue)  | Blue   |
| `:success` | Check circle (green)| Green  |
| `:warning` | Alert triangle      | Amber  |
| `:error`   | Alert circle (red)  | Red    |

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

## Reading notifications

### Query methods

```ruby
# Get notifications for a user (targeted + global), newest first
Avo::Notifications.for_user(user, limit: 10)

# Count unread notifications
Avo::Notifications.unread_count(user)

# Mark a single notification as read
Avo::Notifications.mark_as_read(notification, user: current_user)

# Mark all notifications as read for a user
Avo::Notifications.mark_all_as_read(user)
```

### User model methods

After including the `HasNotifications` concern, your User model gains these methods:

```ruby
user.unread_avo_notifications_count
# => 5

user.mark_all_avo_notifications_read!
# Marks all targeted notifications as read and updates avo_notifications_last_read_at

user.avo_notification_unread?(notification)
# => true/false — works for both targeted and global notifications
```

:::info
**How read state works:** Targeted notifications track read state via a `read_at` timestamp on the notification itself. Global notifications are considered "read" if they were created before the user's `avo_notifications_last_read_at` timestamp.
:::

## Bell component

The bell icon automatically appears in your Avo navbar when the gem is installed. It shows:

- A bell icon with an unread count badge (hidden when all notifications are read)
- A dropdown panel with the most recent notifications (limited by `dropdown_limit`)
- A "Mark all as read" link when there are unread notifications
- A "View all notifications" link to the full notification resource

No additional configuration is needed — the component renders automatically for logged-in users.

## Real-time delivery

When `config.realtime = true` (the default), notifications are broadcast via ActionCable using Turbo Streams. The bell dropdown updates automatically without a page refresh.

### How it works

Two ActionCable streams are used:

- **Personal stream** — delivers targeted notifications to the specific recipient
- **Global stream** (`avo_notifications:global`) — delivers global notifications to all connected users

The Stimulus controller `notifications-cable` handles subscribing to both streams and processing incoming Turbo Stream messages.

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

The installer generates an Avo resource at `app/avo/resources/avo_notification.rb` that gives you a full management interface for notifications.

### Scopes

- **All** — every notification for the current user
- **Unread** — only unread notifications
- **Read** — only read notifications

### Filter

- **Level** — filter by notification level (info, success, warning, error)

### Bulk actions

- **Mark as read** — marks selected notifications as read
- **Mark as unread** — clears the read state on targeted notifications
- **Delete** — permanently removes selected notifications

:::info
The notification resource has `visible_on_sidebar = false` by default. Notifications are accessed through the bell dropdown's "View all" link. You can change this in the generated resource if you prefer sidebar access.
:::

## Cleanup

Over time, expired notifications accumulate in the database. Use the built-in rake task to clean them up:

```bash
bin/rails avo_notifications:cleanup
```

This deletes all notifications past their expiry date (based on the `expires_at` column, which is set from the `ttl` configuration when a notification is created).

**Recommended:** schedule this as a daily cron job:

```bash
# Daily at 2 AM
0 2 * * * cd /path/to/app && bin/rails avo_notifications:cleanup
```
