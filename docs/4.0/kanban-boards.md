---
license: add_on
betaStatus: Beta
outline: [2,3]
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
It will use the `self.search[:query]` block to search for the records. It will send two `for_kanban_board` and `board_id` arguments to the block so you can customize the query.

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

1. Generate a policy for the `Board` resource by running:
```bash
rails generate pundit:policy board
```

### Authorization Methods

You can control access to various parts of the Kanban board by defining the following methods in your `BoardPolicy`:

- `manage_column?`

  Controls the visibility of the three-dot menu on each column (used for column management).

- `edit?`

  Controls the "Edit board" button on the board itself.
  :::warning
    Also controls the ability to edit the board in the resource view.
  :::

- `add_item?`

  Controls the visibility of the "Add item" button on the board, which allows users to add new items to a column.
  :::warning
    Doesn't impact the ability to add items via the bottom of each column.
  :::
