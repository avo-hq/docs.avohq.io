---
license: add_on
betaStatus: Beta
outline: [2, 3]
---

# Kanban boards

:::warning
The feature and docs are both work in progress. Please read the `info` sections below.
:::

Having a kanban board is a great way to organize your work and keep track of your records.

## Overview

The Kanban Board feature is a way to create a kanban board for your resources. They support multiple resources. Think about GitHub's Projects. You can have Issues, PRs, and simple tasks on them.

The boards and columns and items are database backed and you can create them on the fly.

## Requirements

Some of these requirements might change over time.

- We tested this on an app with Avo Advanced license
- [`acts_as_list`](https://github.com/brendon/acts_as_list) gem (comes automatically as a requirement)
- [`hotwire_combobox`](https://github.com/josefarias/hotwire_combobox) gem (comes automatically as a requirement)

## Installation

To install the `avo-kanban` gem, follow the steps below:

1. Add the following line to your Gemfile:

   ```ruby
   gem "avo-kanban", source: "https://packager.dev/avo-hq/"
   ```

2. Run the `bundle install` command to install the gem:

   ```bash
   bundle install
   ```

3. Generate the necessary resources and controllers by running:

   ```bash
   rails generate avo:kanban install
   ```

   This command will create pre-configured resources and controllers for managing boards, columns, and items in your application. You can further customize the generated code to suit your needs.

   This command will also generate the item's partial and a migration.

4. Run the migration to apply the database changes:
   ```bash
   rails db:migrate
   ```

## DB schema

`Avo::Kanban::Board` -> has_many `Avo::Kanban::Column` -> has_many `Avo::Kanban::Item`

The `Avo::Kanban::Column` has a polymorphic `belongs_to` association with any other model you might have in your app.

## Create a kanban board

We can create a kanban board by going to the Boards resource and clicking on the `Create board` button.

Once you create the board, add it to the menu using the `link_to` option (for now. we'll add `board` soon).

## Create columns

For now you can create the columns from the resource view.

By default, each column will have a `name` and `value` assigned to it. It will also have a `position` that you can use to sort the columns.

The `value` is what is being used to update the record when it's dropped into a new column.

## Configure the board

Each board has a configuration attached to it.
We can configure what kind of resources can be added to the board.

Similar we can change the column names and the value from the settings screen.

## Adding items to the board

This is best done on the board. Under each column you'll find the new field. This will search throught the resources that you've selected in the configuration.
It will use the `self.search[:query]` block to search for the records. Alongside the usual `params` and `query`, the block receives these locals so you can customize the query for the board:

- `search_type` — set to `:kanban` (the same contract the other search surfaces use: `:resource` for the index search bar, `:global` for the navbar palette, and `:association` for the association picker).
- `q` — the stripped search term the user typed.

```ruby
# app/avo/resources/project.rb
class Avo::Resources::Project < Avo::BaseResource
  self.search = {
    query: -> {
      if search_type == :kanban
        # tailor the scope for the board picker
        query.where(active: true).ransack(name_cont: q).result
      else
        query.ransack(name_cont: q).result
      end
    }
  }
end
```

When an item is added to the a column, it will have an `Avo::Kanban::Item` record created for it. This `Item` record is responsible for keeping track of the board, column, position properties and more.

When an item is added to the a column it will update the property on the record to the column's `value`. More on what this means in the next section.

## How does it work?

<!-- Let's take a look -->

Each board updates one `property` on the `record`, and each column represents a `value`.
The record is the actual record from the database (User, Project, To Do, etc.).

Let's say we are replicating the GitHub Projects boards.

### `Board` and `Column`s

We should have a `Board` record with the following columns:

- `No status` with an empty string as value
- `Backlog` with the value `backlog`
- `In progress` with the value `in_progress`
- `Done` with the value `done`

The board has the `property` option set to `status` so we ensure that the `status` property of the record is updated when we move the item to a new column.

### `Resource`s and `Item`s

We should have `Issue`, `PullRequest`, and `ToDo` models and resources. The resources should have the `self.search[:query]` block configured.

Each resource must have the `self.title` method configured. This title will be used as a label to identify records throughout the kanban board, including in the search box and on individual entries.

Next in our board we should select these resources as allowed from the board settings.

### Add items to the board

At the bottom of the `No status` column we can search for an `Issue`. When we select that issue, an `Avo::Kanban::Item` record will be created for it with references to the board, column, and record (that issue).
This automatically triggers the issue to change the status to an empty string because we added it to the `No status` column which has the `value` set to an empty string.

If we were to add it to the `Backlog` column, it would change the status to `backlog`.

### Move items between columns

Now, if we move the item to the `In progress` column, it will change the status to `in_progress`.

### Items without that property

Some models might belong on the same board but have different properties to show the status.
Some models might use a timestamp like `published_at` to show the status.
Or some models might belong to a a status but that isn't dictated by a single property but a collection of properties.

In order to mitigate that we can create virtual properties on the model.

Let's imagine that a new board that displays the posts in columns based on their "published" status. the board uses the `status` property to but the `Post` model doesn't have the `status` property as a column in the database.
We can create a virtual property on the model.

```ruby
class Post < ApplicationRecord
  def status
    if published_at.present?
      "published"
    elsif published_status == "draft"
      "draft"
    else
      "private"
    end
  end

  def status=(value)
    if value == "published"
      published_at = Time.now
      published_status = "draft"
    elsif value == "draft"
      published_at = nil
      published_status = "draft"
    elsif value == "draft"
      published_at = nil
      published_status = nil
    end

    save!
  end
end
```

## Customize the card

:::warning
This might change in the future.
:::

In order to customize the card, you can eject the `Avo::Kanban::Items::ItemComponent` component.

```bash
rails generate avo:eject --component Avo::Kanban::Items::ItemComponent
```

Then customize it at `app/components/avo/kanban/items/item_component.html.erb`

```erb
<%= item.record.name %>
```

The `item` is the `Avo::Kanban::Item` and the `record` is the actual record from the database.

## Authorization

This section assumes that you have already set up [authorization](authorization.html) in your application using Pundit.

The kanban board is backed by the `Avo::Kanban::Board` model, so its policy must be namespaced to match: `Avo::Kanban::BoardPolicy`, in `app/policies/avo/kanban/board_policy.rb`.

```ruby
# app/policies/avo/kanban/board_policy.rb
class Avo::Kanban::BoardPolicy < ApplicationPolicy
  def show? = true
  def edit? = true
  def add_column? = true
  def add_item? = true
  def manage_column? = true

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end
end
```

:::info
Each method maps to an `authorize_action(:action)` call in the board's controllers and components, which resolves to the matching `action?` predicate. Methods you don't define fall back to your `ApplicationPolicy`.
:::

### Authorization Methods

You can control access to various parts of the Kanban board by defining the following methods in your `Avo::Kanban::BoardPolicy`:

- `show?`

  Controls access to the board page itself. When this returns `false` the board can't be visited.

- `edit?`

  Controls the "Edit board" button on the board itself.
  :::warning
  Also controls the ability to edit the board in the resource view.
  :::

- `add_column?`

  Controls the "Add column" button on the board and guards the `add_column` action that creates a new column.

- `add_item?`

  Controls the visibility of every "Add a card" button — on the board header, on each column header, and at the bottom of each column.

- `manage_column?`

  Controls the visibility of the three-dot menu on each column (remove column, remove all items, and column settings).

## Customizing kanban models for your business logic

Sometimes, the default kanban models aren't quite enough for your specific use case. Let's say you're building a project management system where kanban boards need to belong to specific teams, and each column represents a workflow stage that needs to track additional metadata like SLA targets or approval requirements.

In this scenario, you might need to extend the kanban models to add custom associations, validations, or callbacks that align with your business logic. Here's how you can safely extend the `Avo::Kanban::Board`, `Avo::Kanban::Column`, and `Avo::Kanban::Item` models:

```ruby{7-54}
# config/initializers/avo.rb
Avo.configure do |config|
  config.root_path = '/admin'
  # ... other config options ...
end

Rails.configuration.to_prepare do
  Avo::Kanban::Board.class_eval do
    belongs_to :team, optional: true
    has_many :board_watchers, dependent: :destroy

    validates :name, presence: true, uniqueness: { scope: :team_id }
  end

  Avo::Kanban::Column.class_eval do
    belongs_to :workflow_stage, optional: true
    has_one :sla_config, dependent: :destroy

    after_update :notify_stage_change

    private

    def notify_stage_change
      # Custom logic to notify team members of stage changes
      BoardNotificationService.new(self).notify_stage_update
    end
  end

  Avo::Kanban::Item.class_eval do
    has_many :item_comments, dependent: :destroy
    belongs_to :assignee, class_name: 'User', optional: true

    after_destroy :cleanup_item_data
    before_update :track_movement_history

    private

    def cleanup_item_data
      # Clear any business-specific property when item is removed
      record.update!("#{board.property}": nil)
    end

    def track_movement_history
      if column_id_changed?
        ItemMovementTracker.create!(
          item: self,
          from_column_id: column_id_was,
          to_column_id: column_id,
          moved_at: Time.current
        )
      end
    end
  end
end
```

This approach allows you to seamlessly integrate the kanban functionality with your existing domain models while maintaining the flexibility to add custom business logic as your application grows.
