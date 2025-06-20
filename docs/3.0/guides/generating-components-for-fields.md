---
license: community
outline: [2,3]
---

# Generating a custom component for a field

Each field in Avo has a component for each [view](../views) that is responsible for rendering the field in that [view](../views).

Some fields, like the `textarea` field, don't have a component for certain views by default. For example, the `textarea` field doesn't have a component for the [Index](../views#index) view. This guide shows you how to create one by using an existing field's component as a starting point.

## Using the Text field as a base

Instead of starting from scratch, it's easier to use the `text` field's index component as a base since it handles text content display well.

### Step 1: Eject the Text field component

In this step we're using the [eject](../eject-views) feature to generate the component files for the `text` field.

Run the following command to eject the text field's index component:

```bash
rails g avo:eject --field-components text --view index
```

This will generate the component files in your application.

### Step 2: Rename the component directory

Rename the generated directory from `text_field` to `textarea_field` to match the field type you're creating the component for.

```bash
mv app/components/avo/fields/text_field/ app/components/avo/fields/textarea_field/
```

### Step 3: Update the class reference

In the generated component file, update the class reference from:

```ruby
Avo::Fields::TextField::IndexComponent
```

to:

```ruby
Avo::Fields::TextareaField::IndexComponent
```

### Step 4: Customize the ERB template

Replace the ERB content with something appropriate for textarea content. For example, to truncate long text:

```erb
<%= index_field_wrapper(**field_wrapper_args) do %>
  <%= @field.value.truncate(60) %>
<% end %>
```

### Step 5: Enable index visibility

By default, `textarea` fields are hidden on the index view. You need to explicitly show them by adding the `show_on: :index` option to your textarea fields:

```ruby
field :body, as: :textarea, show_on: :index
```

## Global configuration for all textarea fields

If you want all `textarea` fields in your application to show on the index view by default, you can extend the base resource and override the `field` method:

```ruby
# app/avo/base_resource.rb
module Avo
  class BaseResource < Avo::Resources::Base
    def field(id, **args, &block)
      if args[:as] == :textarea
        args[:show_on] = :index
      end

      super(id, **args, &block)
    end
  end
end
```

For more information about extending the base resource, see the [Extending Avo::BaseResource](../resources.html#extending-avo-baseresource) documentation.

## Related documentation

- [Field components](../field-options.html#components) - Learn how to eject and override existing field components
- [Ejecting views](../eject-views.html) - Learn how to eject and override existing views
- [Extending Avo::BaseResource](../resources.html#extending-avo-baseresource)
- [Views](../views.html) - Understanding different view types in Avo
