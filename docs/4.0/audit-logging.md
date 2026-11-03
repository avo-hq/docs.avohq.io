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

:::info Already installed? Upgrade instead
A first install writes **one** migration, with every column this version knows about. An app that installed an earlier version needs only what came after it:

```bash
bin/rails generate avo:audit_logging upgrade
bin/rails db:migrate
```

Today that is the [activity origin](#where-an-activity-came-from) columns. `install` does the same thing — it looks at your `db/migrate` and writes only what is missing, never touching a migration you have already run — so re-running it is safe too; `upgrade` is the same code path under a name that says so.
:::

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

Each entry shows a compact relative time — hover over an entry to reveal its full date and time. Clicking an entry opens a detailed page, with the payload when the entry has one.

<Image src="/assets/img/4_0/audit-logging/hover-activities.webp" dark-src="/assets/img/4_0/audit-logging/hover-activities-dark.webp" width="356" height="422" alt="The History activity timeline card showing compact relative timestamps" />

### Keep secrets out of the payload

<VersionReq package="avo-audit_logging" version="4.3.2" /> Avo masks the payload with your app's [`filter_parameters`](https://guides.rubyonrails.org/configuring.html#config-filter-parameters), the list Rails uses for your log file, and with the columns the record's model filters, which include its [`encrypts`](https://guides.rubyonrails.org/active_record_encryption.html) columns. A password typed into a form is stored as `[FILTERED]`, at any depth, whether the entry came from the panel, an action, an AI client or your own `Avo::AuditLogging.record` call. To mask another key, add it to that list. New Rails apps list `:email` there, so emails show as `[FILTERED]` in the payload too, while the [change log](#enable-change-logs-and-revert-changes) still shows them.

The list matches keys, as it does in your logs. Keys inside a value stored as a JSON string, such as a [key-value field](./fields/key_value.html)'s, aren't matched. The [change log](#enable-change-logs-and-revert-changes) comes from PaperTrail and isn't masked, so keep a sensitive column out of it with PaperTrail's [`skip` option](https://github.com/paper-trail-gem/paper_trail#2c-choosing-attributes-to-monitor).

If a block you added to `filter_parameters` raises, the entry is saved without its payload and the error's class goes to the Rails log, so the request still finishes and nothing unmasked is stored.

The AI assistant adds `code`, `state` and `token` to that list, and the MCP server adds `code` and its OAuth tokens, so with those installed a field with one of those names shows as `[FILTERED]` too.

Entries written before this version keep what they stored, and their pages still show it. Run this once in a console to mask them:

```ruby
Rails.application.eager_load!
filters = Rails.application.config.filter_parameters | ActiveRecord::Base.descendants.flat_map(&:filter_attributes)
filter = ActiveSupport::ParameterFilter.new(filters)

Avo::AuditLogging::Activity.where.not(payload: nil).find_each do |activity|
  payload = JSON.parse(activity.payload)
  activity.update_column(:payload, filter.filter(payload).to_json) if payload.is_a?(Hash)
rescue JSON::ParserError
  next # A row written by hand may not hold JSON.
end
```

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

With [authorization](./authorization.html) enabled, reverting asks the record's policy: [`update?`](./authorization-api.html#update) on the record, found through its policy scope, or [`create?`](./authorization-api.html#create) to bring back a destroyed record. Users the policy refuses don't see the revert action. The changeset diff and the payload leave out fields the user's [field policy](./authorization.html#hide-fields-from-a-user) withholds.

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

## Where an activity came from

Most activities come from somebody clicking in the panel, and those carry no origin — a marker on every row would say nothing. Anything else names itself, so you can tell a change your team made from a change something else made on their behalf.

Three of Avo's own add-ons name themselves, each after the record the entry points back to:

| Add-on | `origin` | Reads as | Links to |
| --- | --- | --- | --- |
| [MCP server](./mcp.html) | `mcp_connection` | *through MCP connection* | The connection |
| [REST API](./rest-api.html) | `api_token` — or `api` when your own scheme let the request in without a token | *through API token* / *through API* | The token |
| [Avo AI](./ai.html) | `ai_chat` | *through AI chat* | The chat |

In every case the author is still the person: the admin who authorized the connection, the token's owner, the chat's owner — whose permissions the change was made with. The record's timeline says *through MCP connection* on the author's own line — "Ada Lovelace through MCP connection" — and the activity's own page carries an **Origin** field whose whole text links to the connection.

Two columns hold it:

| Column          | Holds                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------- |
| `origin`        | A short name for what acted — `"mcp_connection"`, `"api_token"`, `"ai_chat"`, or a name of your own. `nil` for the panel. |
| `origin_record` | Optional, polymorphic: the thing that acted. Linked from the activity's page where it still exists. |

Filter the activity index by **Origin** to see everything one kind of actor did, or scope a query directly:

```ruby
Avo::AuditLogging::Activity.from_origin("mcp_connection")   # everything MCP clients did
Avo::AuditLogging::Activity.originating_from(connection)    # everything one actor did
```

### Mark your own origins

Anything of yours that records activities through Avo — an importer, a background job, a rake task — can name itself the same way. Wrap the work:

```ruby
# app/jobs/nightly_import_job.rb
class NightlyImportJob < ApplicationJob
  def perform(import)
    Avo::AuditLogging::Origin.with("nightly_importer", record: import) do
      # anything in here that records an activity records it as the importer's
      import.run!
    end
  end
end
```

The origin lasts exactly as long as the block and cannot leak into the next request or job. The panel labels it from `avo.audit_logging.origins.<name>` where you define one, and humanizes the name where you don't — `"nightly_importer"` renders as *Nightly importer*:

```yaml
# config/locales/en.yml
en:
  avo:
    audit_logging:
      origins:
        nightly_importer: "Nightly import"
```

:::info
Activities recorded before you upgraded have no origin, and neither do activities recorded by an app that hasn't run the new migration yet. Both keep working — they just read as the panel's own.
:::

### Record activity from your own code

<VersionReq package="avo-audit_logging" version="4.3.2" />

Changes made outside the panel, such as in a background job, an importer, or a service object, aren't logged on their own unless the resource [logs changes made outside Avo](#log-changes-made-outside-avo). Record them with `Avo::AuditLogging.record`:

```ruby
# app/services/price_updater.rb
class PriceUpdater
  def call(product, price, user)
    product.update!(price: price)

    Avo::AuditLogging.record(
      action: :update,
      record: product,
      author: user,
      payload: {price: price}
    )
  end
end
```

Avo finds the record's resource and links the activity to the record, so it shows up on the record's timeline like a change made in the panel. `payload` can be any hash; Avo stores it as JSON, [with secrets masked](#keep-secrets-out-of-the-payload).

Like the panel, it only records for resources that opted in with [`self.audit_logging`](#enable-specific-resources-and-actions), and it asks your `activity` block and `actions` the same way. It returns the activity, or `nil` when audit logging is switched off or the opt-in says no. It raises `ArgumentError` when the record's model has no Avo resource, or when the record hasn't been saved yet. The activity and its link to the record are saved together, or not at all.

The `actions` switches cover the panel's own actions: `index`, `new`, `create`, `edit`, `update`, `show`, `destroy`, `attach`, `detach` and `handle`. Any other action, such as `:publish`, returns `nil` unless you add it to your resource's `actions` (`actions: {publish: true}`) or pass `force: true`.

Inside your `activity` block, `current_user` is the `author:` you pass, so a job gets the same answer the panel would give that user. With no `author:` it falls back to the signed-in user, which is `nil` in a job, so make the block handle `nil` if you record without an author. To record regardless of the opt-in, pass `force: true`:

```ruby
Avo::AuditLogging.record(
  action: :update,
  record: product,
  author: user,
  force: true
)
```

`force` skips only the resource's opt-in. Nothing is recorded while audit logging is switched off globally.

### Record changes no person made

A background job or an importer usually has no user behind it. Leave out `author`, and let the [origin](#mark-your-own-origins) say what made the change. You don't need a placeholder user:

```ruby
# app/jobs/nightly_import_job.rb
class NightlyImportJob < ApplicationJob
  def perform(import)
    Avo::AuditLogging::Origin.with("nightly_importer", record: import) do
      import.products.each do |product|
        product.update!(price: import.price_for(product))

        Avo::AuditLogging.record(
          action: :update,
          record: product,
          payload: {price: product.price}
        )
      end
    end
  end
end
```

The record's timeline names the origin as the author, so these entries read *Nightly importer*. You can pass `origin:` (and `origin_record:`) to `Avo::AuditLogging.record` instead of wrapping the work in `Origin.with`; `origin_record:` without `origin:` raises `ArgumentError`. With no author and no origin, it raises `ArgumentError`, because the entry would not say who or what made the change. It raises the same way in an app that hasn't run the [origin migration](#_3-migrate) yet, because the origin couldn't be stored.

### Log changes made outside Avo

<VersionReq package="avo-audit_logging" version="4.3.2" />

Calling `Avo::AuditLogging.record` yourself works when you know where the changes happen. To log every create, update, and delete on a model wherever it happens (a job, an importer, another API, the console), set `outside_avo: true` on its resource:

```ruby
# app/avo/resources/product.rb
class Avo::Resources::Product < Avo::BaseResource
  self.audit_logging = {
    activity: true,
    outside_avo: true # [!code ++]
  }
end
```

It's off by default. It needs [PaperTrail](#enable-change-logs-and-revert-changes) on the model, because the entry is written when PaperTrail writes the change's version:

```ruby
# app/models/product.rb
class Product < ApplicationRecord
  has_paper_trail
end
```

Each change gets its own entry, linked to its version, so its page shows the [change log and the revert action](#enable-change-logs-and-revert-changes) like a change made in the panel. A create's page shows what the record was created with, and no revert, since there's nothing to go back to. The entry is saved in the same transaction as the change, so a change that's rolled back leaves no entry. The payload is empty, because what changed is in the change log.

The resource that sets `outside_avo` is the one whose settings are asked and whose timeline shows the entries, even when another resource uses the same model. In the panel or through the API, a change the panel logs links its version to the panel's own entry, as before. A version written while the panel logs the request, even a `show` visit, links to that entry. A change made where the panel logs nothing, such as an action that doesn't opt in, is logged by `outside_avo` under the signed-in user.

The resource's opt-in is asked the same way the panel asks it. The `create`, `update`, and `destroy` switches in [`actions`](#disable-specific-actions-logging) turn single events off, and your `activity` block runs for each change. In a job or the console `current_user` is `nil`, so make the block handle `nil`. A block that raises logs the error and records nothing.

PaperTrail decides what counts as a change, so its own options apply: `only:`, `ignore:`, `if:`, and `unless:` on `has_paper_trail`, and `PaperTrail.request(enabled: false) { ... }` around an import you don't want in the log. An update that changed only `created_at` or `updated_at`, such as a `touch` from a `belongs_to ..., touch: true` child or an attached file, records nothing.

A few PaperTrail settings change what the log can show:

- A version whose event you renamed with `paper_trail_event` keeps that name when `outside_avo` logs it on its own, so it needs its own switch in `actions`, such as `actions: {import: true}`. An entry the panel records links it like any other version, and so does a create the AI chat or an MCP client records. An update or delete those two record leaves a renamed version to be logged on its own, and so does a create when your versions table has no `object` column. A renamed delete has no revert action.
- The change log needs PaperTrail's `object_changes` column, which its installer adds with `--with-changes`. Without it, entries have no change log, and a touch can't be told from a real update, so it's logged too.
- With `version_limit`, an entry whose version PaperTrail pruned keeps no change log.

When the change is made through Avo (the panel, the API, the AI chat, or an MCP client), the author is the user Avo acted for. A change made through the AI chat or an MCP client also names the chat or the connection, as Avo's own entries for them do. Elsewhere the entry has no author. It carries the origin set with [`Origin.with`](#mark-your-own-origins) when there is one, and otherwise names what was running when the record was saved:

| Saved in                        | The timeline shows                    |
| ------------------------------- | ------------------------------------- |
| A job (Active Job)              | *Background job (Import products)*    |
| Your own controllers, not Avo's | *App (Orders)*                        |
| `rails console`                 | *Developer console*                   |
| A rake task, such as `db:seed`  | *Script (db:seed)*                    |
| Anything else                   | *System*                              |

A job's own saves name it, its `rescue_from` handlers included, but not saves on threads it starts. A save after a job your controller ran inline with `perform_now` names the controller. Hover the name to see the full job, controller, or task, such as `ImportProductsJob` or `Admin::OrdersController#update`. The origin is stored the same way (`job:ImportProductsJob`, `request:Admin::OrdersController#update`, `console`, `rake:db:seed`, or `model`), which is what `from_origin` takes. A rake task is stored by name only, without the arguments in brackets, since those can hold a password. To word the labels for your admins, set them in your locale file:

```yaml
# config/locales/en.yml
en:
  avo:
    audit_logging:
      origins:
        job: "Scheduled task"
        request: "Storefront"
```

On a resource that sets `outside_avo`, the panel's create, the AI chat, and MCP clients claim the saves they record. Each entry they record links the version of its own change (a create's, the destroy, or the first update), so it has the change log. Every other version written during the claim is logged by `outside_avo` on its own, as it would be outside one: another record a callback changes, an earlier save of the same record, or the records an action changes when the action doesn't opt in. That holds even when the writer raises after saving.

When your own code records a change with `Avo::AuditLogging.record` on a resource that sets `outside_avo`, claim the save the same way, or the change is logged twice:

```ruby
Avo::AuditLogging::Recorder.claiming do
  product.update!(price: price)
  Avo::AuditLogging.record(action: :update, record: product, author: user, payload: {price: price})
end
```

An STI subclass is logged under its own resource when that one sets `outside_avo`, and otherwise under its base class's resource when that one does. A model with PaperTrail but no Avo resource is skipped. If recording fails, the error is logged and the change is kept.

Writes PaperTrail doesn't version aren't logged: `update_column`, `update_columns`, `update_all`, `insert_all`, `upsert_all`, `delete`, `delete_all`, and `dependent: :delete_all`. Use `update!` and `destroy` where the log has to see the change, or `record.paper_trail.update_columns(...)` to skip callbacks and still write a version. A model that has PaperTrail version its destroys after the delete (`paper_trail.on_destroy(:after)`) has its deletes skipped, because the row is gone by then.

### Pause logging for a block of code

<VersionReq version="4.3.2" />

Bulk imports, data backfills, and test setup can write thousands of activities you don't need. Wrap that work in `Avo::AuditLogging.disabled` to record nothing inside the block:

```ruby
# lib/tasks/backfill.rake
task backfill_prices: :environment do
  Avo::AuditLogging.disabled do
    Product.find_each do |product|
      product.update!(price: product.price * 100)
    end
  end
end
```

Nothing is recorded inside the block from any source: the panel, `Avo::AuditLogging.record` (which returns `nil`), `has_avo_audit_log`, the API, the AI chat, or MCP, and PaperTrail or Audited versions written inside it aren't linked to an activity. A model change counts as inside the block when it was saved inside it, even if its transaction commits after the block ends. Logging resumes when the block ends, even if it raises. The block only affects the current thread, so other requests keep recording.

A background job enqueued inside the block runs later, outside it, so its changes are logged. Wrap the job's own work in `Avo::AuditLogging.disabled` if they shouldn't be.

To switch logging off everywhere, for example in the test environment, set `config.enabled = false`.

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
