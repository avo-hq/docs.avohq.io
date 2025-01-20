---
feedbackId: 834
---

# Field options

Avo fields are dynamic and can be configured using field options.

There are quite a few **common field options** described on this page that will work with most fields (but some might not support them), and some **custom field options** that only some fields respond to that are described on each field page.


### Common field option example

```ruby
# disabled will disable the field on the `Edit` view
field :name, as: :text, disabled: true
field :status, as: :select, disabled: true
```

### Custom field option example

```ruby
# options will set the dropdown options for a select field
field :status, as: :select, options: %w[first second third]
```

## Change field name

To customize the label, you can use the `name` property to pick a different label.

```ruby
field :is_available, as: :boolean, name: "Availability"
```

<Image src="/assets/img/fields-reference/naming-convention-override.png" width="938" height="158" alt="Field naming convention override" />

## Showing / Hiding fields on different views

There will be cases where you want to show fields on different views conditionally. For example, you may want to display a field in the <New /> and <Edit /> views and hide it on the <Index /> and <Show /> views.

For scenarios like that, you may use the visibility helpers `hide_on`, `show_on`, `only_on`, and `except_on` methods. Available options for these methods are: `:new`, `:edit`, `:index`, `:show`, `:forms` (both `:new` and `:edit`) and `:all` (only for `hide_on` and `show_on`).

Version 3 introduces the `:display` option that is the opposite of `:forms`, referring to both, `:index` and `:show`

Be aware that a few fields are designed to override those options (ex: the `id` field is hidden in <Edit /> and <New />).

```ruby
field :body, as: :text, hide_on: [:index, :show]
```

Please read the detailed [views](./views.html) page for more info.

## Field Visibility

You might want to restrict some fields to be accessible only if a specific condition applies. For example, hide fields if the user is not an admin.

You can use the `visible` block to do that. It can be a `boolean` or a lambda.
Inside the lambda, we have access to the [`context`](./customization.html#context) object and the current `resource`. The `resource` has the current `record` object, too (`resource.record`).

```ruby
field :is_featured, as: :boolean, visible: -> { context[:user].is_admin? }  # show field based on the context object
field :is_featured, as: :boolean, visible: -> { resource.name.include? 'user' } # show field based on the resource name
field :is_featured, as: :boolean, visible: -> { resource.record.published_at.present? } # show field based on a record attribute
```

:::warning
On form submissions, the `visible` block is evaluated in the `create` and `update` controller actions. That's why you have to check if the `resource.record` object is present before trying to use it.
:::


```ruby
# `resource.record` is nil when submitting the form on resource creation
field :name, as: :text, visible -> { resource.record.enabled? }

# Do this instead
field :name, as: :text, visible -> { resource.record&.enabled? }
```

## Computed Fields

You might need to show a field with a value you don't have in a database row. In that case, you may compute the value using a block that receives the `record` (the actual database record), the `resource` (the configured Avo resource), and the current `view`. With that information, you can compute what to show on the field in the <Index /> and <Show /> views.

```ruby
field 'Has posts', as: :boolean do
  record.posts.present?
rescue
  false
end
```

:::info
Computed fields are displayed only on the <Show /> and <Index /> views.
:::

This example will display a boolean field with the value computed from your custom block.

## Fields Formatter

Sometimes you will want to process the database value before showing it to the user. You may do that using `format_using` block.

Notice that this block will have effect on **all** views.

You have access to a bunch of variables inside this block, all the defaults that [`Avo::ExecutionContext`](./execution-context.html) provides plus `value`, `record`, `resource`, `view` and `field`.

```ruby
field :is_writer, as: :text, format_using: -> {
  if view.form?
    value
  else
    value.present? ? '👍' : '👎'
  end
}
```

This example snippet will make the `:is_writer` field generate `👍` or `👎` emojis instead of `1` or `0` values on display views and the values `1` or `0` on form views.

<Image src="/assets/img/fields-reference/fields-formatter.png" width="943" height="156" alt="Fields formatter" />

Another example:

```ruby
field :company_url,
  as: :text,
  format_using: -> {
    if view == :new || view == :edit
      value
    else
      link_to(value, value, target: "_blank")
    end
  } do
  main_app.companies_url(record)
end
```

## Formatting with Rails helpers

You can also format using Rails helpers like `number_to_currency` (note that `view_context` is used to access the helper):

```ruby
field :price, as: :number, format_using: -> { view_context.number_to_currency(value) }
```

## Parse value before update
When it's necessary to parse information before storing it in the database, the `update_using` option proves to be useful. Inside the block you can access the raw `value` from the form, and the returned value will be saved in the database.

```ruby
field :metadata,
  as: :code,
  update_using: -> do
    ActiveSupport::JSON.decode(value)
  end
```

## Sortable fields

One of the most common operations with database records is sorting the records by one of your fields. For that, Avo makes it easy using the `sortable` option.

Add it to any field to make that column sortable in the <Index /> view.

```ruby
field :name, as: :text, sortable: true
```

<Image src="/assets/img/fields-reference/sortable-fields.png" width="406" height="363" alt="Sortable fields" />

**Related:**
  - [Add an index on the `created_at` column](./best-practices#add-an-index-on-the-created-at-column)

## Custom sortable block

When using computed fields or `belongs_to` associations, you can't set `sortable: true` to that field because Avo doesn't know what to sort by. However, you can use a block to specify how the records should be sorted in those scenarios.

```ruby{4-7}
class Avo::Resources::User < Avo::BaseResource
  field :is_writer,
    as: :text,
    sortable: -> {
      # Order by something else completely, just to make a test case that clearly and reliably does what we want.
      query.order(id: direction)
    },
    hide_on: :edit do
      record.posts.to_a.size > 0 ? "yes" : "no"
    end
end
```

The block receives the `query` and the `direction` in which the sorting should be made and must return back a `query`.

In the example of a `Post` that `has_many` `Comment`s, you might want to order the posts by which one received a comment the latest.

You can do that using this query.

::: code-group

```ruby{5} [app/avo/resources/post.rb]
class Avo::Resources::Post < Avo::BaseResource
  field :last_commented_at,
    as: :date,
    sortable: -> {
      query.includes(:comments).order("comments.created_at #{direction}")
    }
end
```

```ruby{4-6} [app/models/post.rb]
class Post < ApplicationRecord
  has_many :comments

  def last_commented_at
    comments.last&.created_at
  end
end
```

:::

## Placeholder

Some fields support the `placeholder` option, which will be passed to the inputs on <Edit /> and <New /> views when they are empty.

```ruby
field :name, as: :text, placeholder: 'John Doe'
```

<Image src="/assets/img/fields-reference/placeholder.png" width="946" height="160" alt="Placeholder option" />

## Required
To indicate that a field is mandatory, you can utilize the `required` option, which adds an asterisk to the field as a visual cue.

Avo automatically examines each field to determine if the associated attribute requires a mandatory presence. If it does, Avo appends the asterisk to signify its mandatory status. It's important to note that this option is purely cosmetic and does not incorporate any validation logic into your model. You will need to manually include the validation logic yourself, such as (`validates :name, presence: true`).


```ruby
field :name, as: :text, required: true
```

<Image src="/assets/img/fields-reference/required.png" width="949" height="156" alt="Required option" />

<DemoVideo demo-video="https://youtu.be/peKt90XhdOg?t=937" />

You may use a block as well. It will be executed in the `Avo::ExecutionContext` and you will have access to the `view`, `record`, `params`, `context`, `view_context`, and `current_user`.

```ruby
field :name, as: :text, required: -> { view == :new } # make the field required only on the new view and not on edit
```

## Disabled

When you need to prevent the user from editing a field, the `disabled` option will render it as `disabled` on <New /> and <Edit /> views and the value will not be passed to that record in the database. This prevents a bad actor to go into the DOM, enable that field, update it, and then submit it, updating the record.


```ruby
field :name, as: :text, disabled: true
```

<Image src="/assets/img/fields-reference/readonly.png" width="953" height="164" alt="Disabled option" />


### Disabled as a block

<VersionReq version="2.14" class="mt-2" />

You may use a block as well. It will be executed in the `Avo::ExecutionContext` and you will have access to the `view`, `record`, `params`, `context`, `view_context`, and `current_user`.

```ruby
field :id, as: :number, disabled: -> { view == :edit } # make the field disabled only on the new edit view
```

## Readonly

When you need to prevent the user from editing a field, the `readonly` option will render it as `disabled` on <New /> and <Edit /> views. This does not, however, prevent the user from enabling the field in the DOM and send an arbitrary value to the database.


```ruby
field :name, as: :text, readonly: true
```

<Image src="/assets/img/fields-reference/readonly.png" width="953" height="164" alt="Readonly option" />

## Default Value

When you need to give a default value to one of your fields on the <New /> view, you may use the `default` block, which takes either a fixed value or a block.

```ruby
# using a value
field :name, as: :text, default: 'John'

# using a callback function
field :level, as: :select, options: { 'Beginner': :beginner, 'Advanced': :advanced }, default: -> { Time.now.hour < 12 ? 'advanced' : 'beginner' }
```

## Help text

Sometimes you will need some extra text to explain better what the field is used for. You can achieve that by using the `help` method.
The value can be either text or HTML.

```ruby
# using the text value
field :custom_css, as: :code, theme: 'dracula', language: 'css', help: "This enables you to edit the user's custom styles."

# using HTML value
field :password, as: :password, help: 'You may verify the password strength <a href="http://www.passwordmeter.com/">here</a>.'
```

<Image src="/assets/img/fields-reference/help-text.png" width="954" height="271" alt="Help text" />

## Nullable

When a user uses the **Save** button, Avo stores the value for each field in the database. However, there are cases where you may prefer to explicitly instruct Avo to store a `NULL` value in the database row when the field is empty. You do that by using the `nullable` option, which converts `nil` and empty values to `NULL`.

You may also define which values should be interpreted as `NULL` using the `null_values` method.

```ruby
# using default options
field :updated_status, as: :status, failed_when: [:closed, :rejected, :failed], loading_when: [:loading, :running, :waiting], nullable: true

# using custom null values
field :body, as: :textarea, nullable: true, null_values: ['0', '', 'null', 'nil', nil]
```

## Link to record

Sometimes, on the <Index /> view, you may want a field in the table to be a link to that resource so that you don't have to scroll to the right to click on the <Show /> icon. You can use `link_to_record` to change a table cell to be a link to that record.

```ruby
# for id field
field :id, as: :id, link_to_record: true

# for text field
field :name, as: :text, link_to_record: true

# for gravatar field
field :email, as: :gravatar, link_to_record: true
```

<Image src="/assets/img/fields-reference/as-link-to-resource.jpg" width="694" height="166" alt="As link to resource" />

You can add this property on [`id`](./fields/id.html), [`text`](./fields/text.html), and [`gravatar`](./fields/gravatar.html) fields.

Optionally you can enable the global config `id_links_to_resource`. More on that on the [id links to resource docs page](./customization.html#id-links-to-resource).

**Related:**
 - [ID links to resource](./customization#id-links-to-resource)
 - [Resource controls on the left side](./customization#resource-controls-on-the-left-side)

## Align text on Index view

It's customary on tables to align numbers to the right. You can do that using the `html` option.

```ruby{2}
class Avo::Resources::Project < Avo::BaseResource
  field :users_required, as: :number, html: {index: {wrapper: {classes: "text-right"}}}
end
```

<Image src="/assets/img/fields/index_text_align.jpg" width="632" height="476" alt="Index text align" />

## Stacked layout

For some fields, it might make more sense to use all of the horizontal area to display it. You can do that by changing the layout of the field wrapper using the `stacked` option.

```ruby
field :meta, as: :key_value, stacked: true
```

#### `inline` layout (default)

<Image src="/assets/img/fields/field_wrapper_layout_inline.jpg" width="808" height="117" alt="" />

#### `stacked` layout

<Image src="/assets/img/fields/field_wrapper_layout_stacked.jpg" width="815" height="179" alt="" />

## Global `stacked` layout

You may also set all the fields to follow the `stacked` layout by changing the `field_wrapper_layout` initializer option from `:inline` (default) to `:stacked`.

```ruby
Avo.configure do |config|
  config.field_wrapper_layout = :stacked
end
```

Now, all fields will have the stacked layout throughout your app.

## Field options

<Option name="`use_resource`">
<!-- TODO: this -->
WIP
</Option>

<Option name="`components`">

The field's `components` option allows you to customize the view components used for rendering the field in all, `index`, `show` and `edit` views. This provides you with a high degree of flexibility.

### Ejecting the field components
To start customizing the field components, you can eject one or multiple field components using the `avo:eject` command. Ejecting a field component generates the necessary files for customization. Here's how you can use the `avo:eject` command:

#### Ejecting All Components for a Field

`$ rails g avo:eject --field-components FIELD_TYPE --scope admin`

Replace `FIELD_TYPE` with the desired field type. For instance, to eject components for a Text field, use:

`$ rails g avo:eject --field-components text --scope admin`

This command will generate the files for all the index, edit and show components of the Text field, for each field type the amount of components may vary.

For more advanced usage check the [eject documentation](./eject-views.html).

:::warning Scope
If you don't pass a `--scope` when ejecting a field view component, the ejected component will override the default components all over the project.

Check [eject documentation](./eject-views.html) for more details.
:::

### Customizing field components using `components` option

Here's some examples of how to use the `components` option in a field definition:

::: code-group
```ruby [Hash]
field :description,
  as: :text,
  components: {
    index_component: Avo::Fields::Admin::TextField::IndexComponent,
    show_component: Avo::Fields::Admin::TextField::ShowComponent,
    edit_component: "Avo::Fields::Admin::TextField::EditComponent"
  }
```

```ruby [Block]
field :description,
  as: :text,
  components: -> do
    {
      show_component: Avo::Fields::Admin::TextField::ShowComponent,
      edit_component: "Avo::Fields::Admin::TextField::EditComponent"
    }
  end
```
:::

The components block it's executed using `Avo::ExecutionContent` and gives access to a bunch of variables as: `resource`, `record`, `view`, `params` and more.

`<view>_component` is the key used to render the field's `<view>`'s component, replace `<view>` with one of the views in order to customize a component per each view.

:::warning Initializer
It's important to keep the initializer on your custom components as the original field view component initializer.
:::

</Option>

<Option name="`html`">
### Attach HTML attributes

Using the `html` option you can attach `style`, `classes`, and `data` attributes. The `style` attribute adds the `style` tag to your element, `classes` adds the `class` tag, and the `data` attribute the `data` tag to the element you choose.

Pass the `style` and `classes` attributes as strings, and the `data` attribute a Hash.

```ruby{4-11}
field :name, as: :text, html: {
  edit: {
    wrapper: {
      style: "background: red; text: white;" # string
      classes: "absolute h-[41px] w-full" # string
      data: {
        action: "input->resource-edit#toggle",
        resource_edit_toggle_target_param: "skills_tags_wrapper",
      } # Hash
    }
  }
}
```
</Option>

#### Declare the fields from the outside in

When you add these attributes, you need to think from the outside in. So first the `view` (`index`, `show`, or `edit`), next the element to which you add the attribute (`wrapper`, `label`, `content` or `input`), and then the attribute `style`, `classes`, or `data`.

**The `edit` value will be used for both the `Edit` and `New` views.**

There are two notations through which you can attach the attributes; `object` or `block` notation.

### The `object` notation

This is the simplest way of attaching the attribute. You usually use this when you want to add _static_ content and params.

```ruby{3-9}
field :has_skills,
  as: :boolean,
  html: {
    edit: {
      wrapper: {
        classes: "hidden"
      }
    }
  }
```

In this example, we're adding the `hidden` class to the field wrapper on the `Edit` and `New` views.

### The `block` notation

You can use the' block' notation if you need to do a more complex transformation to add your attributes. You'll have access to the `params`, `current_user`, `record`, and `resource` variables. It's handy in multi-tenancy scenarios and when you need to scope out the information across accounts.

```ruby{3-18}
field :has_skills,
  as: :boolean,
  html: -> do
    edit do
      wrapper do
        classes do
          "hidden"
        end
        data do
          if current_user.admin?
            {
              action: "click->admin#do_something_admin"
            }
          else
            {
              record: record,
              resource: resource,
            }
          end
        end
      end
    end
  end
```

For the `data`, `style`, and `classes` options, you may use the `method` notation alongside the block notation for simplicity.

```ruby{6,7}
field :has_skills,
  as: :boolean,
  html: -> do
    edit do
      wrapper do
        classes("hidden")
        data({action: "click->admin#do_something_admin"})
      end
    end
  end
```

### Where are the attributes added?

You can add attributes to the wrapper element for the `index`, `show`, or `edit` blocks.

### Index field wrapper

```ruby
field :name, as: :text, html: {
  index: {
    wrapper: {}
  }
}
```

<Image src="/assets/img/stimulus/index-field-wrapper.jpg" width="1642" height="864" alt="Index field wrapper" />

### Show field wrapper

```ruby
field :name, as: :text, html: {
  show: {
    wrapper: {}
  }
}
```

<Image src="/assets/img/stimulus/show-field-wrapper.jpg" width="763" height="331" alt="Show field wrapper" />

### Show label target

```ruby
field :name, as: :text, html: {
  show: {
    label: {}
  }
}
```

<Image src="/assets/img/stimulus/show-label-target.jpg" width="763" height="331" alt="Show label target" />

### Show content target

```ruby
field :name, as: :text, html: {
  show: {
    content: {}
  }
}
```

<Image src="/assets/img/stimulus/show-content-target.jpg" width="763" height="331" alt="Show content target" />

### Edit field wrapper

```ruby
field :name, as: :text, html: {
  edit: {
    wrapper: {}
  }
}
```

<Image src="/assets/img/stimulus/edit-field-wrapper.jpg" width="1634" height="766" alt="Edit field wrapper" />

### Edit label target

```ruby
field :name, as: :text, html: {
  edit: {
    label: {}
  }
}
```

<Image src="/assets/img/stimulus/edit-label-target.jpg" width="763" height="331" alt="Edit label target" />

### Edit content target

```ruby
field :name, as: :text, html: {
  edit: {
    content: {}
  }
}
```

<Image src="/assets/img/stimulus/edit-content-target.jpg" width="763" height="331" alt="Edit content target" />

### Edit input target

```ruby
field :name, as: :text, html: {
  edit: {
    input: {}
  }
}
```

<Image src="/assets/img/stimulus/edit-input-target.jpg" width="1646" height="784" alt="Index field wrapper" />

</Option>

<Option name="`summarizable`">

```ruby
field :status, as: :select, summarizable: true
# or
field :status, as: :badge, summarizable: true
```
This section is WIP.
</Option>

<Option name="`for_attribute`">

Allows to specify the target attribute on the model for each field. By default the target attribute is the field's id.

<!-- <VersionReq version="3.6.2" /> -->

Usage example:

```ruby
field :status, as: :select, options: [:one, :two, :three], only_on: :forms

field :secondary_field_for_status,
  as: :badge,
  for_attribute: :status,
  options: {info: :one, :success: :two, warning: :three},
  except_on: :forms,
  help: "Secondary field for status using the for_attribute option"
```
</Option>

<Option name="`meta`">

This handy option enables you to send arbitrary information to the field. It's especially useful when you're building your own [custom fields](./custom-fields) or you are using [custom components](#components) for the built-in fields.

<!-- <VersionReq version="3.10" /> -->

Usage example:

```ruby{4,9-11}
# meta as a hash
field :status,
  as: :custom_status,
  meta: {foo: :bar}

# meta as a block
field :status,
  as: :badge,
  meta: -> do
    record.statuses.map(&:id)
  end
```

Within your field template you can now access the `@field.meta` attribute.

```erb{2}
<%= field_wrapper **field_wrapper_args do %>
  <% if @field.meta[:foo] %>
    <%= @resource.record.foo_value %>
  <% else %>
    <%= @field.value %>
  <% end %>
<% end %>
```
</Option>

<Option name="`copyable`">

<VersionReq version="3.15.6" class="mt-2" />

The `copyable` option enables users to copy the field's value to their clipboard. When set to `true`, a clipboard icon appears when hovering over the field value, allowing easy copying. This feature can be particularly useful for fields such as unique identifiers, URLs, or other text-based content that users may frequently need to copy.

```ruby
field :name, as: :text, copyable: true
```

The `copyable` option is available for text-based fields such as `:text`, `:textarea`, and others that render text values.

</Option>
