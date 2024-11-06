---
license: audit_logging
betaStatus: Beta
outline: [2,3]
---


# Audit Logging

Avo's Audit Logging feature provides a seamless way to track and visualize user activity and changes within your applications. It supports integrations with [`audited`](https://github.com/collectiveidea/audited) and [`paper_trail`](https://github.com/paper-trail-gem/paper_trail), and offers flexible installation and customization options.

Captures user's activities on Avo resources and actions, recording details like the author and the performed event.

The installation process will automatically generate the necessary migrations, resources, and controllers that powers activity tracking. Additionally, the chosen versioning gem, either [`audited`](https://github.com/collectiveidea/audited) or [`paper_trail`](https://github.com/paper-trail-gem/paper_trail) will be installed if it is not already present in your project.

## Requirements

- `avo-advanced`

## Installation

:::info
When installing `avo-audit_logging` on a application, we strongly recommend following this documentation page step-by-step without skipping sections, as it was designed with that approach in mind.
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

### 2. Select the audit gem

Prior to running the installer, choose the gem you want to use for record versioning:

- [`audited`](https://github.com/collectiveidea/audited)
- [`paper_trail`](https://github.com/paper-trail-gem/paper_trail)

Once you've chosen a gem, proceed by running the installation command:

:::code-group
```bash [audited]
bin/rails generate avo:audit_logging install --gem audited

```

```bash [paper_trail]
bin/rails generate avo:audit_logging install --gem paper_trail
```
:::

### 3. Migrate

At this stage, all migrations, resources, and controllers required for the audit logging feature are set up and ready, it's time to migrate:

```bash
bin/rails db:migrate
```

## Enable and configure audit logging

### Global enable

After installation, audit logging is disabled by default. To enable it, navigate to your `avo.rb` initializer file and update the configuration for the `Avo::AuditLogging` module.

Set `config.enabled` to `true` within this configuration.

```ruby{7-9}
# config/initializers/avo.rb # [!code focus]

Avo.configure do |config|
  # ...
end

Avo::AuditLogging.configure do |config| # [!code focus]
  # config.enabled = false # [!code --] # [!code focus]
  config.enabled = true # [!code ++] # [!code focus]
end # [!code focus]
```

:::info
Setting this configuration to `false` will disable the audit logging feature entirely, overriding any other specific settings. We'll cover those specific settings in the next step.
:::

### Configure author models

:::info
If `User` is your only author model, you can skip this step as it will be automatically set by default.
:::

Avo needs to identify the author possible models to properly set up associations behind the scenes. This will allow to fetch all activities for a specific author using the `avo_authored` association. To mark a model as an author use the `config.author_model` or for multiples models use `config.author_models`

```ruby
# config/initializers/avo.rb # [!code focus]

Avo.configure do |config|
  # ...
end

Avo::AuditLogging.configure do |config| # [!code focus]
  config.enabled = true

  # config.author_models = ["User"] # [!code --] # [!code focus]
  config.author_model = "User" # [!code ++] # [!code focus]

  # Or if multiples # [!code focus]
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

At this point, all resources and actions with audit logging activity enabled are being tracked.

But these activities aren't visible yet, right? Let's look at how to display them in the next step.

## Display logged activities

### Table with detailed activities
After installing and enabling audit logging, it's time to display the tracked activities. By default, they will appear like this, using the generated resource, which you can customize as needed.

<Image src="/assets/img/3_0/audit-logging/avo-activities.png" width="1912" height="682" alt="Avo activities table image" />

To display this table as an association view, add the `:avo_activities` field to resources that have audit logging enabled.

```ruby
class Avo::Resources::Product < Avo::BaseResource # [!code focus]
  self.audit_logging = {
    activity: true
  }

  def fields # [!code focus]
    field :id, as: :id, link_to_record: true
    field :name, as: :text, link_to_record: true
    field :price, as: :number, step: 1
    field :avo_activities, as: :has_many # [!code ++] # [!code focus]
  end # [!code focus]

  def actions
    action Avo::Actions::ChangePrice
  end
end # [!code focus]
```

:::info
This table is displayed using the `Avo::Resources::AvoActivity` generated during installation. You have full control to customize it as desired.
:::

### Sidebar with compact activities

During installation, a resource tool called `Avo::ResourceTools::Timeline` was also generated. This tool is designed for use in the sidebar, providing a compact view of activities that looks like this:

<Image src="/assets/img/3_0/audit-logging/sidebar-activities.png" width="1934" height="733" alt="Avo compact activities on sidebar image" />

This can be achieved by configuring the resource to ensure that the main menu sidebar includes the resource tool:

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

### Overview of all activities

We've covered how to view activity for specific records and how to review all actions by a particular author. However, having an overview of all activities in one place can also be useful. This can be achieved by configuring the menu to include a section with an entry for all activities.

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

## Display author logged activities

We’ve already covered how to view all activity on a specific record. Now, let’s display a table within `Avo::Resources::User` to view all tracked activity for a particular user.

<Image src="/assets/img/3_0/audit-logging/authored.png" width="1926" height="739" alt="Authored table image" />

:::warning
If you're using a model other than `User`, make sure you have already [configured the author models](#_2-configure-author-models).
:::

```ruby
class Avo::Resources::User < Avo::BaseResource # [!code focus]
  def fields # [!code focus]
    field :id, as: :id, link_to_record: true
    field :email, as: :text, link_to_record: true
    field :products, as: :has_many
    field :avo_authored, as: :has_many # [!code ++] # [!code focus]
  end # [!code focus]
end # [!code focus]
```

## Display Record Versions

During installation, you chose between [`audited`](https://github.com/collectiveidea/audited) and [`paper_trail`](https://github.com/paper-trail-gem/paper_trail). Now, let's enable tracking for record changes and display them.

### 1. Enable record versioning

Each gem has its own method for enabling versioning, which needs to be configured at the model level:


:::code-group
```ruby [audited]
# app/models/product.rb # [!code focus]

class Product < ApplicationRecord # [!code focus]
  audited # [!code ++] # [!code focus]

  belongs_to :user, optional: true

  validates_presence_of :price
end # [!code focus]
```

```ruby [paper_trail]
# app/models/product.rb # [!code focus]

class Product < ApplicationRecord # [!code focus]
  has_paper_trail # [!code ++] # [!code focus]

  belongs_to :user, optional: true

  validates_presence_of :price
end # [!code focus]
```
:::

### 2. Display Record Versions

To show record changes, you'll need to use one of the resources generated during installation. The resource name and structure will vary based on the gem you selected:

:::code-group
```ruby [audited]{22}
class Avo::Resources::Product < Avo::BaseResource # [!code focus]
  self.audit_logging = {
    activity: true,
    actions: {
      edit: false,
      show: false
    }
  }

  def fields # [!code focus]
    main_menu do
      field :id, as: :id, link_to_record: true
      field :name, as: :text, link_to_record: true
      field :price, as: :number, step: 1

      sidebar do
        tool Avo::ResourceTools::Timeline
      end
    end

    field :avo_activities, as: :has_many
    field :audits, as: :has_many, use_resource: Avo::Resources::Audited # [!code ++] # [!code focus]
  end # [!code focus]

  def actions
    action Avo::Actions::ChangePrice
  end
end # [!code focus]
```

```ruby [paper_trail]{22}
class Avo::Resources::Product < Avo::BaseResource # [!code focus]
  self.audit_logging = {
    activity: true,
    actions: {
      edit: false,
      show: false
    }
  }

  def fields # [!code focus]
    main_menu do
      field :id, as: :id, link_to_record: true
      field :name, as: :text, link_to_record: true
      field :price, as: :number, step: 1

      sidebar do
        tool Avo::ResourceTools::Timeline
      end
    end

    field :avo_activities, as: :has_many
    field :versions, as: :has_many, use_resource: Avo::Resources::PaperTrail # [!code ++] # [!code focus]
  end # [!code focus]

  def actions
    action Avo::Actions::ChangePrice
  end
end # [!code focus]
```
:::

## Conclusion

With Avo’s Audit Logging, you now have the ability to track and visualize user actions and records changes across your application. By following each setup step and configuring logging as needed, you can create a robust audit system.

For more advanced configurations, consider exploring the extended documentation (not available yet, work in progress) to gain further control over your audit logging setup.

Happy auditing!
