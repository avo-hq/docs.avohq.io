# Audit Logging

Avo's Audit Logging feature provides a seamless way to track and visualize user activity and changes within your Avo-powered applications. It supports integrations with popular versioning gems, including [`audited`](https://github.com/collectiveidea/audited) and [`paper_trail`](https://github.com/paper-trail-gem/paper_trail), and offers flexible installation and customization options.

Captures user's activities on resources and actions, recording details like the author and the action performed. These activities are stored in the `avo_activities` table, with the `avo_activity_pivots` table handling associations to the affected records.

These tables will be created and migrated as part of the installation process.

Three types of installation are supported:
  - Avo audit logging
    - Logs only avo related activity
  - Avo audit logging with `audited` integration
    - Logs avo related activity and records changes using [`audited`](https://github.com/collectiveidea/audited) gem
  - Avo audit logging with `paper_trail` integration
    - Logs avo related activity and records changes using [`paper_trail`](https://github.com/paper-trail-gem/paper_trail) gem

## Installation

During the installation the generator will generate the required migrations, models, and resources to track Avo-related activities, such as viewing a resource's index or show page. If the `--gem` option is used, extra files will be generated for the gems integration.

### 1. Generate Audit Logging

Run the following command to install audit logging and generate the necessary files in your app:

```shell
bin/rails generate avo:audit install
```

Use the `--gem` option to integrate avo audit logging with one of the supported gems:

- [`audited`](https://github.com/collectiveidea/audited)

```shell
bin/rails generate avo:audit install --gem audited
```

- [`paper_trail`](https://github.com/paper-trail-gem/paper_trail)

```shell
bin/rails generate avo:audit install --gem paper-trail
```

### 2. Run Migrations
After generation, migrate your database:

```shell
rails db:migrate
```

### 3. Enable the Feature
To activate audit logging, enable the feature in your Avo initializer

`config/initializers/avo.rb`:

```ruby
Avo.configure do |config|
  # ...
end

Avo::AuditLogging.configure do |config|
  config.enabled = true
end
```

## Enable Activity Track
To enable audit logging for a particular resource or action, add the following to the resource:

```ruby{2-4}
class Avo::Resources::Product < Avo::BaseResource
  self.audit_logging = {
    activity: true
  }
end
```

To display associated activities for a resource, include `avo_activities` field, when `--gem` option was used include `audits` field for `audited` gem and `versions` field for `paper-trail` gem

```ruby{2-4,9,11-12,14-15}
class Avo::Resources::Product < Avo::BaseResource
  self.audit_logging = {
    activity: true
  }

  def fields
    #...

    field :avo_activities, as: :has_many

    # ONLY when `--gem audited` was used
    field :audits, as: :has_many, use_resource: Avo::Resources::Audited

    # ONLY when `--gem paper-trail` was used
    field :versions, as: :has_many, use_resource: Avo::Resources::PaperTrail
  end
end
```

Image representations of each field:


```ruby
field :avo_activities, as: :has_many
```

<Image src="/assets/img/3_0/audits/avo_activities.png" width="1912" height="682" alt="Avo activities table image" />


```ruby
# ONLY when `--gem audited` was used
field :audits, as: :has_many, use_resource: Avo::Resources::Audited
```

<Image src="/assets/img/3_0/audits/auditeds.png" width="1913" height="443" alt="Auditeds table image" />

```ruby
# ONLY when `--gem paper-trail` was used
field :versions, as: :has_many, use_resource: Avo::Resources::PaperTrail
```

<Image src="/assets/img/3_0/audits/versions.png" width="2025" height="517" alt="Paper trails table image" />


## Author

For tracking the author of activities and to show them, use:

```ruby{4,8}
class Avo::Resources::User < Avo::BaseResource
  self.audit_logging = {
    activity: true,
    author: true
  }

  def fields
    field :avo_authored, as: :has_many
  end
end
```

<Image src="/assets/img/3_0/audits/authored.png" width="1926" height="739" alt="Authored table image" />


## Display on Menu
To display audit activities in the menu:

```ruby{3-5}
Avo.configure do |config|
  config.main_menu = -> {
    section "Audit logging", icon: "presentation-chart-bar" do
      resource :avo_activity
    end
  }
end
```

<Option name="`audit_logging`">

Option to tweak audit on each resource / action

### Default value

```ruby
{
  activity: false,
  author: false,
  actions: {
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
}
```

### Disable activity per action / resource

For example, to disable the `edit` activity audit in `Avo::Resources::Product`, use the following:

```ruby{4-6}
class Avo::Resources::Product < Avo::BaseResource
  self.audit_logging = {
    activity: true,
    actions: {
      edit: false
    }
  }
end

```
</Option>
