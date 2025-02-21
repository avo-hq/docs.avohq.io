---
license: enterprise
betaStatus: Beta
outline: [2,3]
---


# Audit Logging

Avo's Audit Logging feature provides a seamless way to track and visualize user activity and changes within your applications. It seamlessly integrates with [`paper_trail`](https://github.com/paper-trail-gem/paper_trail), offering flexible installation and customization options.

Captures user activities on Avo resources and actions, recording details such as the author and the performed event.

The installation process will automatically generate the necessary migrations, resources, and controllers that power activity tracking. Additionally [`paper_trail`](https://github.com/paper-trail-gem/paper_trail) will be installed if it is not already present in your project.

## Requirements

- `avo-advanced`

## Installation

:::info
When installing `avo-audit_logging` on an application, we strongly recommend following this documentation page step-by-step without skipping sections, as it was designed with that approach in mind.
:::

### 1. Install the gem

Start by adding the following to your `Gemfile`:

```bash
gem "avo-audit_logging", source: "https://packager.dev/avo-hq/"
```

Then
```bash
bundle install
```

### 2. Run the installer

```bash
bin/rails generate avo:audit_logging install
```

### 3. Migrate

At this stage, all migrations, resources, and controllers required for the audit logging feature are set up and ready, it's time to migrate:

```bash
bin/rails db:migrate
```

## Enable and configure audit logging

### Global enable

After installation, audit logging is disabled by default. To enable it, navigate to your `avo.rb` initializer file and update the configuration for the `Avo::AuditLogging` module.

Set `config.enabled` to `true` within this configuration.

```ruby
# config/initializers/avo.rb # [!code focus]

Avo.configure do |config|
  # ...
end

Avo::AuditLogging.configure do |config| # [!code focus]
  # config.enabled = false # [!code --] # [!code focus]
  config.enabled = true # [!code ++] # [!code focus]
  # config.author_model = "User"
end # [!code focus]
```

:::info
Setting this configuration to `false` will disable the audit logging feature entirely, overriding any other specific settings. We'll cover those specific settings in the next steps.
:::

### Configure author models

:::info
If `User` is your only author model, you can skip this step as it will be automatically set by default.
:::

Avo must determine the potential author models to correctly establish associations in the background. This setup enables the retrieval of all activities associated with a specific author via the `avo_authored` association. To designate a model as an author, use `config.author_model`, for multiple models, utilize `config.author_models`.

```ruby
# config/initializers/avo.rb # [!code focus]

Avo.configure do |config|
  # ...
end

Avo::AuditLogging.configure do |config| # [!code focus]
  config.enabled = true

  # config.author_model = "User" # [!code --] # [!code focus]
  config.author_model = "Account" # [!code ++] # [!code focus]

  # Or for multiples models # [!code focus]
  config.author_models = ["User", "Account"] # [!code ++] # [!code focus]
end # [!code focus]
```

### Enable specific resources and actions

At this stage, the audit logging feature should be enabled, but activities are not yet being saved. By default, only resources and actions that are explicitly enabled for auditing will be tracked.

To enable audit logging for specific resources or actions, use the `self.audit_logging` class attribute.

:::code-group
```ruby [Resource]{2-4}
class Avo::Resources::Product < Avo::BaseResource # [!code focus]
  self.audit_logging = { # [!code ++] # [!code focus]
    activity: true # [!code ++] # [!code focus]
  } # [!code ++] # [!code focus]

  def fields
    field :id, as: :id, link_to_record: true
    field :name, as: :text, link_to_record: true
    field :price, as: :number, step: 1
    # ...
  end

  def actions
    action Avo::Actions::ChangePrice
  end
end # [!code focus]
```

```ruby [Action]{4-6}
class Avo::Actions::ChangePrice < Avo::BaseAction # [!code focus]
  self.name = "Change Price"

  self.audit_logging = { # [!code ++] # [!code focus]
    activity: true # [!code ++] # [!code focus]
  } # [!code ++] # [!code focus]

  def fields
    field :price, as: :number, default: -> { resource.record.price rescue nil }
  end

  def handle(query:, fields:, current_user:, resource:, **args)
    query.each do |record|
      record.update!(price: fields[:price])
    end
  end
end # [!code focus]
```
:::

All resources and actions with audit logging activity enabled are being tracked now.

But these activities aren't visible yet, right? Let's look at how to display them in the next step.

## Display logged activities

### Resource-Specific Activities

The `Avo::ResourceTools::Timeline` tool, provided by the `avo-audit_logging` gem, is designed for use in the sidebar. It offers a compact view of activities that have occurred on a specific resource, presenting them in a streamlined format:

<Image src="/assets/img/3_0/audit-logging/sidebar-activities.png" width="1915" height="719" alt="Avo compact activities on sidebar image" />

### Configuring the Sidebar for Activity Tracking

To enable this feature, configure the resource to include the resource tool in the main menu sidebar:

```ruby{7,12-15}
class Avo::Resources::Product < Avo::BaseResource # [!code focus]
  self.audit_logging = {
    activity: true
  }

  def fields # [!code focus]
    main_panel do # [!code ++] # [!code focus]
      field :id, as: :id, link_to_record: true
      field :name, as: :text, link_to_record: true
      field :price, as: :number, step: 1

      sidebar do # [!code ++] # [!code focus]
        tool Avo::ResourceTools::Timeline # [!code ++] # [!code focus]
      end # [!code ++] # [!code focus]
    end # [!code ++] # [!code focus]

    field :avo_activities, as: :has_many # [!code focus]
  end # [!code focus]

  def actions
    action Avo::Actions::ChangePrice
  end
end # [!code focus]
```

### Viewing and Navigating Activity Logs

Hovering over an entry reveals the precise timestamp in UTC. Clicking on an entry navigates to a detailed page displaying the full payload.

<Image src="/assets/img/3_0/audit-logging/hover-activities.png" width="657" height="284" alt="Hover on activity" />

### Enabling Change Logs and Reverting Changes

By default, update activities do not display a change log, and there is no way to revert changes. This is because PaperTrail has not yet been enabled on the model. To enable it, simply add `has_paper_trail` to the model:

```ruby
# app/models/product.rb # [!code focus]

class Product < ApplicationRecord # [!code focus]
  has_paper_trail # [!code ++] # [!code focus]

  belongs_to :user, optional: true

  validates_presence_of :price
end # [!code focus]
```

Once enabled, the changelog will be visible, along with an action to revert changes.

<Image src="/assets/img/3_0/audit-logging/activity-details.png" width="2010" height="1152" alt="Activity details page" />

### Troubleshooting: Missing `changeset` Field

:::warning
If the `changeset` field in the versions table consistently appears as `nil`, ensure you add the following configuration in your `application.rb` file:

```ruby
config.active_record.yaml_column_permitted_classes = [Symbol, Date, Time, ActiveSupport::TimeWithZone, ActiveSupport::TimeZone]
```
:::

### Display author logged activities

We’ve already covered how to view all activity on a specific record. Now, let’s display a table within `Avo::Resources::User` to view all tracked activity for a particular user.

<Image src="/assets/img/3_0/audit-logging/authored.png" width="1921" height="754" alt="Authored table image" />

:::warning
If you're using a model other than `User`, make sure you have already [configured the author models](#configure-author-models).
:::

```ruby
class Avo::Resources::User < Avo::BaseResource # [!code focus]
  def fields # [!code focus]
    field :id, as: :id, link_to_record: true
    field :email, as: :text, link_to_record: true
    field :products, as: :has_many
    field :avo_authored, as: :has_many, name: "Activity" # [!code ++] # [!code focus]
  end # [!code focus]
end # [!code focus]
```

### Overview of all activities

We've covered how to view activities for specific records and how to view all actions made by a particular author. However, having an overview of all the activities in one place can also be useful. This can be achieved by configuring the menu to include a section with an entry for all activities.

```ruby
# config/initializers/avo.rb

Avo.configure do |config|
  config.main_menu = -> {
    section "AuditLogging", icon: "presentation-chart-bar" do # [!code ++]
      resource :avo_activity # [!code ++]
    end # [!code ++]
  }
end
```

## Disable specific actions logging

By default, when audit logging is enabled for a resource or action, all actions, such as `index` visits, `show` visits, `edit`, `update`, etc. are logged.

If you prefer not to log all of these actions, configure the `actions` key within the `self.audit_logging` class attribute.

Let's turn off `edit` and `show` logging for the `Avo::Resources::Product`:

```ruby
class Avo::Resources::Product < Avo::BaseResource # [!code focus]
  self.audit_logging = { # [!code focus]
    activity: true, # [!code focus]
    actions: { # [!code ++] # [!code focus]
      edit: false, # [!code ++] # [!code focus]
      show: false # [!code ++] # [!code focus]
    } # [!code ++] # [!code focus]
  } # [!code focus]

  def fields
    main_menu do
      field :id, as: :id, link_to_record: true
      field :name, as: :text, link_to_record: true
      field :price, as: :number, step: 1

      sidebar do
        tool Avo::ResourceTools::Timeline
      end
    end
    # ...
    field :avo_activities, as: :has_many
  end

  def actions
    action Avo::Actions::ChangePrice
  end
end # [!code focus]
```

The default value for `actions` is:

```ruby
{
  index: true,
  new: true,
  create: true,
  edit: true,
  update: true,
  show: true,
  destroy: true,
  attach: true,
  detach: true,
  handle: true
}
```

## Conclusion

With Avo's Audit Logging, you gain a powerful tool to track and visualize user actions and record changes seamlessly across your application. By carefully following the setup steps and configuring logging to fit your needs, you can establish a robust and transparent audit system, enhancing accountability and preserving data integrity.

Happy auditing!
