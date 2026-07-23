---
license: enterprise
outline: [2, 3]
---

# Audit Logging

Avo's Audit Logging feature provides a seamless way to track and visualize user activity and changes within your applications. It integrates with a versioning backend — either [`paper_trail`](https://github.com/paper-trail-gem/paper_trail) (recommended) or [`audited`](https://github.com/collectiveidea/audited) — offering flexible installation and customization options.

Captures user activities on Avo resources and actions, recording details such as the author and the performed event.

The installation process will automatically generate the necessary migrations, resources, and controllers that power activity tracking. Additionally [`paper_trail`](https://github.com/paper-trail-gem/paper_trail) will be installed if it is not already present in your project.

:::info Choosing a versioning backend
Activity tracking works with either `paper_trail` or `audited`, but you must have **exactly one** of them — with both installed (or neither) the associations aren't registered and nothing is tracked. `paper_trail` is the recommended default and the one the installer sets up; the change-log diff and the [revert action](#enable-change-logs-and-revert-changes) are `paper_trail`-only.
:::

## Requirements

- An [Avo Enterprise](https://savvycal.com/avo-hq/discovery-call-ent) license — audit logging is an Enterprise feature
- [Custom controls](./custom-controls) — the generated activity resources use `show_controls` and `index_controls`
- [Authorization](./authorization) — the generated activity models use the authorization helpers (`authorizable_ransackable_attributes` / `authorizable_ransackable_associations`)
- [`paper_trail`](https://github.com/paper-trail-gem/paper_trail) and `avo-diff_field` are installed automatically if not already present

## Installation

:::info
When installing `avo-audit_logging` on an application, we strongly recommend following this documentation page step-by-step without skipping sections, as it was designed with that approach in mind.
:::

### 1. Install the gem

Start by adding the following to your `Gemfile`:

```ruby
# Gemfile
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

### Enable it globally

After installation, audit logging is disabled by default. To enable it, navigate to your `avo.rb` initializer file and update the configuration for the `Avo::AuditLogging` module.

Set `config.enabled` to `true` within this configuration.

```ruby
# config/initializers/avo.rb
Avo::AuditLogging.configure do |config|
  # config.enabled = false
  config.enabled = true # [!code ++]
end
```

:::info
Setting this configuration to `false` will disable the audit logging feature entirely, overriding any other specific settings. We'll cover those specific settings in the next steps.
:::

:::warning
Setting this configuration to `false` will not prevent previously registered activity from being displayed.

To control the display behavior when this configuration is set to `false`,
you can wrap the relevant fields or tools within an `Avo::AuditLogging.configuration.enabled?` condition, like this:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true
    field :email, as: :text, link_to_record: true
    field :products, as: :has_many
    if Avo::AuditLogging.configuration.enabled? # [!code highlight]
      field :avo_authored, as: :has_many, name: "Activity" # [!code highlight]
    end # [!code highlight]
  end
end
```
:::

### Configure author models

:::info
If `User` is your only author model, you can skip this step as it will be automatically set by default.
:::

Avo must determine the potential author models to correctly establish associations in the background. This setup enables the retrieval of all activities associated with a specific author via the `avo_authored` association. To designate a single model as an author, use `config.author_model`; for multiple models, use `config.author_models`.

```ruby
# config/initializers/avo.rb
Avo::AuditLogging.configure do |config|
  config.enabled = true

  # A single author model:
  config.author_model = "Account" # [!code highlight]

  # …or, for multiple author models:
  # config.author_models = ["User", "Account"]
end
```

### Enable specific resources and actions

At this stage, the audit logging feature should be enabled, but activities are not yet being saved. By default, only resources and actions that are explicitly enabled for auditing will be tracked.

To enable audit logging for specific resources or actions, use the `self.audit_logging` class attribute.

:::code-group
```ruby [Resource]
# app/avo/resources/product.rb
class Avo::Resources::Product < Avo::BaseResource
  self.audit_logging = { # [!code ++]
    activity: true # [!code ++]
  } # [!code ++]

  def fields
    field :id, as: :id, link_to_record: true
    field :name, as: :text, link_to_record: true
    field :price, as: :number, step: 1
    # ...
  end

  def actions
    action Avo::Actions::ChangePrice
  end
end
```

```ruby [Action]
# app/avo/actions/change_price.rb
class Avo::Actions::ChangePrice < Avo::BaseAction
  self.name = "Change Price"

  self.audit_logging = { # [!code ++]
    activity: true # [!code ++]
  } # [!code ++]

  def fields
    field :price, as: :number, default: -> { resource.record.price rescue nil }
  end

  def handle(query:, fields:, current_user:, resource:, **args)
    query.each do |record|
      record.update!(price: fields[:price])
    end
  end
end
```
:::

The `activity` key also supports a lambda to dynamically determine if the activity should be logged.

Within this block, you gain access to all attributes of [`Avo::ExecutionContext`](./execution-context) along with the `payload`, `action`, `records` and `activity_class`.

A common use case is to configure audit logging for specific users, for example if you have a `User` model and a method `audit_avo_activity?` on it that returns a boolean that indicates if activities should be logged for the user:

```ruby
# app/avo/resources/product.rb
class Avo::Resources::Product < Avo::BaseResource
  self.audit_logging = { # [!code highlight]
    activity: -> { current_user.audit_avo_activity? } # [!code highlight]
  } # [!code highlight]
end
```

All resources and actions with audit logging activity enabled are being tracked now.

But these activities aren't visible yet, right? Let's look at how to display them in the next step.

## Display logged activities

### Show activities on a specific record

The `Avo::ResourceTools::Timeline` tool, provided by the `avo-audit_logging` gem, is designed for use in the sidebar. It offers a compact view of activities that have occurred on a specific resource, presenting them in a streamlined format:

<Image src="/assets/img/4_0/audit-logging/sidebar-activities.webp" dark-src="/assets/img/4_0/audit-logging/sidebar-activities-dark.webp" width="2848" height="1360" alt="The History activity timeline tool shown in the product record's sidebar, with breadcrumbs and title" />

To enable this feature, configure the resource to include the resource tool in a sidebar:

```ruby
# app/avo/resources/product.rb
class Avo::Resources::Product < Avo::BaseResource
  self.audit_logging = {
    activity: true
  }

  def fields
    panel do # [!code ++]
      card do # [!code ++]
        field :id, as: :id, link_to_record: true
        field :name, as: :text, link_to_record: true
        field :price, as: :number, step: 1
      end # [!code ++]

      sidebar do # [!code ++]
        tool Avo::ResourceTools::Timeline # [!code ++]
      end # [!code ++]
    end # [!code ++]

    field :avo_activities, as: :has_many
  end

  def actions
    action Avo::Actions::ChangePrice
  end
end
```

### View and navigate activity logs

Each entry shows a compact relative time — hover over an entry to reveal its full date and time. Clicking an entry opens a detailed page displaying the full payload.

<Image src="/assets/img/4_0/audit-logging/hover-activities.webp" dark-src="/assets/img/4_0/audit-logging/hover-activities-dark.webp" width="356" height="422" alt="The History activity timeline card showing compact relative timestamps" />

### Enable change logs and revert changes

By default, update activities do not display a change log, and there is no way to revert changes. This is because PaperTrail has not yet been enabled on the model. The change log and revert action are `paper_trail`-only — if you're using `audited`, activities are still tracked, but this section doesn't apply. To enable it, simply add `has_paper_trail` to the model:

```ruby
# app/models/product.rb
class Product < ApplicationRecord
  has_paper_trail # [!code ++]

  belongs_to :user, optional: true

  validates_presence_of :price
end
```

Once enabled, the changelog will be visible, along with an action to revert changes.

<Image src="/assets/img/4_0/audit-logging/activity-details.webp" dark-src="/assets/img/4_0/audit-logging/activity-details-dark.webp" width="2848" height="2114" alt="An update activity detail page showing the changeset diff and payload, with breadcrumbs and title" />

:::warning Missing `changeset` field
If the `changeset` field in the versions table consistently appears as `nil`, ensure you add the following configuration in your `application.rb` file:

```ruby
# config/application.rb
config.active_record.yaml_column_permitted_classes = [Symbol, Date, Time, ActiveSupport::TimeWithZone, ActiveSupport::TimeZone]
```
:::

### Show all activity by an author

We've already covered how to view all activity on a specific record. Now, let's display a table within `Avo::Resources::User` to view all tracked activity for a particular user.

<Image src="/assets/img/4_0/audit-logging/authored.webp" dark-src="/assets/img/4_0/audit-logging/authored-dark.webp" width="1960" height="1138" alt="Authored table image" />

:::warning
If you're using a model other than `User`, make sure you have already [configured the author models](#configure-author-models).
:::

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :id, as: :id, link_to_record: true
    field :email, as: :text, link_to_record: true
    field :products, as: :has_many
    field :avo_authored, as: :has_many, name: "Activity" # [!code ++]
  end
end
```

### Show an overview of all activities

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
# app/avo/resources/product.rb
class Avo::Resources::Product < Avo::BaseResource
  self.audit_logging = {
    activity: true,
    actions: { # [!code ++]
      edit: false, # [!code ++]
      show: false # [!code ++]
    } # [!code ++]
  }

  def fields
    panel do
      card do
        field :id, as: :id, link_to_record: true
        field :name, as: :text, link_to_record: true
        field :price, as: :number, step: 1
      end

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
end
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
