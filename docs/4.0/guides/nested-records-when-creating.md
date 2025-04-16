---
demo: https://main.avodemo.com/avo/resources/fish/new
---

# Nested records when creating

<Image src="/assets/img/3_0/guides/nested-records-when-creating/nested-records-demo.gif" width="1024" height="640" alt="" />

A lot of you asked for the ability to create nested `has_many` records on the <New /> view. Although it's fairly "easy" to implement using `accepts_nested_attributes_for` for simple cases, it's a different story to extract it, make it available, and cover most edge cases for everyone.
That's why Avo and no other similar gems dont't offer this feature as a first-party feature.
But, that doesn't mean that it's impossible to implement it yourself. It's actually similar to how you'd implement it for your own app.

We prepared this scenario where a `Fish` model `has_many` `Review`s. I know, it's not the `Slider` `has_many` `Item`s example, but you'll get the point.

## Full set of changes

The full code is available in Avo's [dummy app](https://github.com/avo-hq/avo/tree/main/spec/dummy) and the changes in [this PR](https://github.com/avo-hq/avo/pull/1472).

## Guide to add it to your app

You can add this functionality using these steps.

### 1. Add `accepts_nested_attributes_for` on your parent model

```ruby{4}
class Fish < ApplicationRecord
  has_many :reviews, as: :reviewable

  accepts_nested_attributes_for :reviews
end
```

:::warning
Ensure you have the `has_many` association on the parent model.
:::

### 2. Add a JS helper package that dynamically adds more review forms

`yarn add stimulus-rails-nested-form`

In your JS file register the controller.

```js{3,6}
// Probably app/javascript/avo.custom.js
import { Application } from '@hotwired/stimulus'
import NestedForm from 'stimulus-rails-nested-form'

const application = Application.start()
application.register('nested-form', NestedForm)
```

:::info
Use [this guide](./../custom-asset-pipeline.html#add-custom-js-code-and-stimulus-controllers) to add custom JavaScript to your Avo app.
:::

### 3. Generate a new resource tool

`bin/rails generate avo:resource_tool nested_fish_reviews`

This will generate two files. The `NestedFishReviews` ruby file you'll register on the `Avo::Resources::Fish` file and we'll edit the template to contain our fields.

### 4. Register the tool on the resource

We'll display it only on the <New /> view.

```ruby{7}
class Avo::Resources::Fish < Avo::BaseResource
  # other fields actions, filters and more

  def fields
    field :reviews, as: :has_many

    tool Avo::ResourceTools::NestedFishReviews, only_on: :new
  end
end
```

### 5. Create a partial for one new review

This partial will have the fields for one new review which we'll add more on the page.

```erb
<!-- app/views/avo/partials/_fish_review.html.erb -->
<%= render Avo::PanelComponent.new do |c| %>
  <% c.with_body do %>
    <div class="nested-form-wrapper divide-y" data-new-record="<%= f.object.new_record? %>">
      <%= avo_edit_field :body, as: :trix, form: f, help: "What should the review say", required: true %>
      <%= avo_edit_field :user, as: :belongs_to, form: f, help: "Who created the review", required: true %>
    </div>
  <% end %>
<% end %>
```

### 6. Update the resource tool partial

It's time to put it all together. In the resource tool partial we're wrapping the whole thing with the `nested-form` controller div, creating a new `form` helper to reference the nested fields with `form.fields_for` and wrapping the "new" template so we can use replicate it using the `nested-form` package.
In the footer we'll also add the button that will add new reviews on the page.

```erb
<!-- app/views/avo/resource_tools/_nested_fish_reviews.html.erb -->
<div class="flex flex-col">
  <%= content_tag :div,data: { controller: 'nested-form', nested_form_wrapper_selector_value: '.nested-form-wrapper' } do %>
    <%= render Avo::PanelComponent.new(name: "Reviews", description: "Create some reviews for this fish") do |c| %>
      <% c.with_bare_content do %>
        <% if form.present? %>
          <template data-nested-form-target="template">
            <%= form.fields_for :reviews, Review.new, multiple: true, child_index: 'NEW_RECORD' do |todo_fields| %>
              <%= render "avo/partials/fish_review", f: todo_fields %>
            <% end %>
          </template>
          <div class="space-y-4">
            <%= form.fields_for :reviews, Review.new, multiple: true do |todo_fields| %>
              <%= render "avo/partials/fish_review", f: todo_fields %>
            <% end %>
            <div data-nested-form-target="target"></div>
          </div>
        <% end %>
      <% end %>
      <% c.with_footer_tools do %>
        <div class="mt-4">
          <%= a_link 'javascript:void(0);', icon: 'plus', color: :primary, style: :outline, data: {action: "click->nested-form#add"} do %>
            Add another review
          <% end %>
        </div>
      <% end %>
    <% end %>
  <% end %>
</div>
```

### 7. Permit the new nested params

There's one more step we need to do and that's to whitelist the new `reviews_attributes` params to be passed to the model.

```ruby{2}
class Avo::Resources::Fish < Avo::BaseResource
  self.extra_params = [reviews_attributes: [:body, :user_id]]

  # other fields actions, filters and more
  def fields
    field :reviews, as: :has_many

    tool Avo::ResourceTools::NestedFishReviews, only_on: :new
  end
end
```

## Conclusion

There you have it!

Apart from the resource tool and the `extra_params` attribute, we wrote regular Rails code that we would have to write to get this functionality in our app.

<Image src="/assets/img/3_0/guides/nested-records-when-creating/nested-records-demo.gif" width="1024" height="640" alt="" />
