---
license: community
feedbackId: 837
outline: deep
---

# Action Generator

Avo provides a powerful Rails generator to create action files quickly and efficiently.

## Basic Generator Usage

Generate a new action file using the Rails generator:

```bash
bin/rails generate avo:action toggle_inactive
```

This command creates a new action file at `app/avo/actions/toggle_inactive.rb` with the following structure:

```ruby
# app/avo/actions/toggle_inactive.rb
class Avo::Actions::ToggleInactive < Avo::BaseAction
  self.name = "Toggle Inactive"
  # self.visible = -> do
  #   true
  # end

  # def fields
  #   # Add Action fields here
  # end

  def handle(query:, fields:, current_user:, resource:, **args)
    query.each do |record|
      # Do something with your records.
    end
  end
end
```

## Generator Options

### `--standalone`

By default, actions require at least one record to be selected before they can be triggered, unless specifically configured as standalone actions.

The `--standalone` option creates an action that doesn't require record selection. This is particularly useful for:
- Generating reports
- Exporting all records
- Running global operations

```bash
bin/rails generate avo:action export_users --standalone
```

You can also make an existing action standalone by manually setting `self.standalone = true` in the action class:

```ruby{5}
# app/avo/actions/export_users.rb

class Avo::Actions::ExportUsers < Avo::BaseAction
  self.name = "Export Users"
  self.standalone = true

  # ... rest of the action code
end
```

## Best Practices

When generating actions, consider the following:

1. Use descriptive names that reflect the action's purpose (e.g., `toggle_published`, `send_newsletter`, `archive_records`)
2. Follow Ruby naming conventions (snake_case for file names)
3. Group related actions in namespaces using subdirectories
4. Use the `--standalone` flag when the action doesn't operate on specific records

## Examples

```bash
# Generate a regular action
bin/rails generate avo:action mark_as_featured

# Generate a standalone action
bin/rails generate avo:action generate_monthly_report --standalone

# Generate an action in a namespace
bin/rails generate avo:action admin/approve_user
```
