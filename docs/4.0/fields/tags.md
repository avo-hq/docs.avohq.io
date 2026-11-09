---
license: community
demoVideo: https://youtu.be/DKKSjNUvuBA
description: "Displays and manages a list of tags on a record."
fieldTags: [choice]
outline: [2, 3]
api_docs: ./tags-api.html
---

# Tags field

The `tags` field displays a list of values as tags and lets users add or remove them on forms. Use it for skills, categories, or other attributes backed by an array.

```ruby
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :skills, as: :tags
  end
end
```

Without additional configuration, users can enter their own tags, commas separate tags, and no suggestions are supplied. The field normally writes an array; single-value selection is also available.

<Image src="/assets/img/4_0/fields/tags/create-save.webm" dark-src="/assets/img/4_0/fields/tags/create-save-dark.webm" width="760" height="493" alt="An Avo create form with a tags field: the animation opens the suggestions dropdown, picks one and two, saves the record, and shows the tags on the Show view." prompt="gif on the create form adding tags from suggestions and saving to see them on show" />

## Suggest tags to users

<span id="suggestions"></span>

Provide [`suggestions`](./tags-api.html#suggestions) to show a dropdown of choices. If the choices depend on the record, use a lambda:

```ruby
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :skills, as: :tags, suggestions: -> { record.skill_suggestions }
  end
end

# app/models/course.rb
class Course < ApplicationRecord
  def skill_suggestions
    ['example suggestion', 'example tag', name].compact
  end
end
```

The lambda runs in an [ExecutionContext](../execution-context.html), with `record` available. For labels that differ from stored values, return hashes with `value` and `label`. Add `avatar` to show an image in the dropdown:

```ruby
# app/models/post.rb
class Post < ApplicationRecord
  def self.tags_suggestions
    [
      {
        value: 1,
        label: 'one',
        avatar: 'https://images.unsplash.com/photo-1560363199-a1264d4ea5fc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop'
      },
      {
        value: 2,
        label: 'two',
        avatar: 'https://images.unsplash.com/photo-1567254790685-6b6d6abe4689?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop'
      },
      {
        value: 3,
        label: 'three',
        avatar: 'https://images.unsplash.com/photo-1560765447-da05a55e72f8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop'
      }
    ]
  end
end

# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :items, as: :tags, suggestions: -> { Post.tags_suggestions }
  end
end
```

### Restrict the choices

<span id="enforce_suggestions"></span>
<span id="enforce-suggestions"></span>
<span id="disallowed"></span>

If users must choose from the list, enable [`enforce_suggestions`](./tags-api.html#enforce_suggestions). To reject particular values while still allowing other new tags, use [`disallowed`](./tags-api.html#disallowed).

```ruby
# app/avo/resources/course.rb
field :skills, as: :tags, suggestions: %w(one two three), enforce_suggestions: true
field :topics, as: :tags, disallowed: %w(not that)
```

:::warning Validate on the server
These restrictions apply to the browser input. Add model validations when the same restrictions must apply to direct requests or other writers.
:::

### Adjust the dropdown

<span id="suggestions_max_items"></span>
<span id="suggestions-max-items"></span>
<span id="close_on_select"></span>
<span id="close-on-select"></span>

If the list is long, reduce [`suggestions_max_items`](./tags-api.html#suggestions_max_items); users can narrow the query to see other matches. Enable [`close_on_select`](./tags-api.html#close_on_select) to dismiss the dropdown after picking a tag.

```ruby
# app/avo/resources/course.rb
field :skills, as: :tags,
  suggestions: %w(one two three),
  suggestions_max_items: 2,
  close_on_select: true
```

## Separate tags while typing

<span id="delimiters"></span>

If users enter space-separated tags, include a space in [`delimiters`](./tags-api.html#delimiters):

```ruby
# app/avo/resources/course.rb
field :skills, as: :tags, delimiters: [",", " "]
```

## Select a single value

<span id="mode"></span>

If an attribute stores one value rather than an array, set [`mode`](./tags-api.html#mode) to `:select`. This also works with remote suggestions.

```ruby
# app/avo/resources/course.rb
field :primary_skill, as: :tags,
  suggestions: %w(Ruby Rails JavaScript),
  enforce_suggestions: true,
  mode: :select
```

## Search for suggestions remotely

<span id="fetch_values_from"></span>
<span id="fetch-values-from"></span>

Use [`fetch_values_from`](./tags-api.html#fetch_values_from) when choices come from an endpoint rather than a preloaded list. This is also useful in [Actions](../actions.html).

```ruby
# app/avo/resources/course.rb
field :skills, as: :tags, fetch_values_from: "/avo/resources/skills/skills_for_user"
```

The endpoint receives the search text in `params["q"]` and returns JSON objects with `value` and `label`:

::: code-group

```ruby [app/controllers/avo/skills_controller.rb]
# app/controllers/avo/skills_controller.rb
class Avo::SkillsController < Avo::ResourcesController
  def skills_for_user
    skills = Skill.where("name ILIKE ?", "%#{Skill.sanitize_sql_like(params[:q].to_s)}%")
      .limit(20)
      .map { |skill| {value: skill.id, label: skill.name} }
    render json: skills
  end
end
```

```ruby [config/routes.rb]
# config/routes.rb
Rails.application.routes.draw do
  authenticate :user, ->(user) { user.is_admin? } do
    mount_avo
  end
end

if defined? ::Avo
  Avo::Engine.routes.draw do
    scope :resources do
      get "skills/skills_for_user", to: "skills#skills_for_user"
    end
  end
end
```
:::

Apply your application's authorization and record scoping to the endpoint before returning suggestions. The query above uses PostgreSQL's `ILIKE` operator.

### Display labels instead of stored IDs

Remote suggestions do not automatically resolve labels on <Show /> and <Index /> views. To display names for stored IDs, use the shared `format_display_using` option described in [Common field options](../field-options.html). Return hashes with symbol keys `value` and `label`:

```ruby
# app/avo/resources/course.rb
field :skills, as: :tags,
  fetch_values_from: "/avo/resources/skills/skills_for_user",
  format_display_using: -> {
    Skill.where(id: Array.wrap(value)).map do |skill|
      {value: skill.id, label: skill.name}
    end
  }
```

<span id="format_using"></span>
<span id="format-using"></span>

If labels are also needed in the edit input, use `format_using` instead. It applies to all views and has `value`, `resource`, and `record` available in its execution context. Returning strings replaces the values used in the input; returning hashes keeps the stored `value` separate from the visible `label`.

## Store tags in a PostgreSQL array

Back the attribute with an array column:

```ruby
# db/migrate/20260101000000_add_skills_to_courses.rb
class AddSkillsToCourses < ActiveRecord::Migration[7.0]
  def change
    add_column :courses, :skills, :text, array: true, default: []
  end
end
```

Then declare `field :skills, as: :tags` in `app/avo/resources/course.rb`, as in the opening example. Other array-backed attributes can work too, provided the model reads an array and accepts the submitted values through its writer.

## Integrate with acts-as-taggable-on

<span id="acts_as_taggable_on"></span>
<span id="acts-as-taggable-on"></span>

The field integrates with [`acts-as-taggable-on`](https://github.com/mbleigh/acts-as-taggable-on). Install the gem and follow its setup instructions, then configure the model's tagging context with [`acts_as_taggable_on`](./tags-api.html#acts_as_taggable_on):

```ruby
# Gemfile
gem 'acts-as-taggable-on', '~> 9.0'
```

```ruby
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :tags,
      as: :tags,
      acts_as_taggable_on: :tags,
      placeholder: 'add some tags',
      suggestions: %w(one two three),
      enforce_suggestions: true,
      help: 'The only allowed values here are one, two, and three'
  end
end

# app/models/post.rb
class Post < ApplicationRecord
  acts_as_taggable_on :tags
end
```

Use a field name matching the tagging association, such as `:tags` for the `tag_list=` writer.

:::info Related
You can set up the tags as a resource using [this guide](../guides/act-as-taggable-on-integration).
:::

## Common field options

For placeholders, help text, formatting, and other shared settings, see [Common field options](../field-options.html).
