---
license: community
version: '2.6.0'
demoVideo: https://youtu.be/DKKSjNUvuBA
---

# Tags field

Adding a list of things to a record is something we need to do pretty frequently; that's why having the `tags` field is helpful.

```ruby
field :skills, as: :tags
```

<img :src="('/assets/img/fields/tags-field/basic.gif')" alt="Avo tags field" class="border mb-4" />

## Options

:::option `suggestions`

You can give suggestions to your users to pick from which will be displayed to the user as a dropdown under the field.

```ruby{4,10-12}
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :skills, as: :tags, suggestions: -> { record.skill_suggestions }
  end
end

# app/models/course.rb
class Course < ApplicationRecord
  def skill_suggestions
    ['example suggestion', 'example tag', self.name]
  end
end
```

<img :src="('/assets/img/fields/tags-field/suggestions.gif')" alt="Avo tags field" class="border mb-4" />

#### Default

`[]`

#### Possible values

The `suggestions` option can be an array of strings, an object with the keys `value`, `label`, and (optionally) `avatar`, or a lambda that returns an array of that type of object.

The lambda is run inside a [`ExecutionContext`](./../execution-context.html), so it has access to the `record`, `resource`, `request`, `params`, `view`, and `view_context` along with other things.

```ruby{5-21}
# app/models/post.rb
class Post < ApplicationRecord
  def self.tags_suggestions
    # Example of an array of more advanced objects
    [
      {
        value: 1,
        label: 'one',
        avatar: 'https://images.unsplash.com/photo-1560363199-a1264d4ea5fc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop',
      },
      {
        value: 2,
        label: 'two',
        avatar: 'https://images.unsplash.com/photo-1567254790685-6b6d6abe4689?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop',
      },
      {
        value: 3,
        label: 'three',
        avatar: 'https://images.unsplash.com/photo-1560765447-da05a55e72f8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=256&h=256&fit=crop',
      },
    ]
  end
end
```

:::

:::option `dissallowed`
The `disallowed` param works similarly to `suggestions`. Use it to prevent the user from adding specific values.

```ruby{3}
field :skills,
  as: :tags,
  disallowed: ["not", "that"]
```

<img :src="('/assets/img/fields/tags-field/disallowed.gif')" alt="Avo tags field" class="border mb-4" />

#### Default

`[]`

#### Possible values

An array of strings representing the value that can't be stored in the database.
:::

:::option `enforce_suggestions`
Set whether the field should accept other values outside the suggested ones. If set to `true` the user won't be able to add anything else than what you posted in the `suggestions` option.

```ruby{4}
field :skills,
  as: :tags,
  suggestions: %w(one two three),
  enforce_suggestions: true
```

<img :src="('/assets/img/fields/tags-field/enforce_suggestions.gif')" alt="Avo tags field" class="border mb-4" />

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `suggestions_max_items`
Set of suggestions that can be displayed at once. The excessive items will be hidden and the user will have to narrow down the query to see them.

```ruby{4}
field :skills,
  as: :tags,
  suggestions: %w(one two three),
  suggestions_max_items: 2
```

<img :src="('/assets/img/fields/tags-field/suggestions_max_items.gif')" alt="Avo tags field - suggestions max items option" class="border mb-4" />

#### Default

`20`

#### Possible values

Integers

:::option `close_on_select`
Set whether the `suggestions` dropdown should close after the user makes a selection.

```ruby{4}
field :items,
  as: :tags,
  suggestions: -> { Post.tags_suggestions },
  close_on_select: true
```

<img :src="('/assets/img/fields/tags-field/close_on_select.gif')" alt="Avo tags field" class="border mb-4" />

<!-- @include: ./../common/default_boolean_false.md-->
:::

:::option `acts_as_taggable_on`
Set the field the `acts_as_taggable_on` is set.

#### Default

`nil`

#### Possible values

Any string or symbol you have configured on your corresponding model.
:::

:::option `disallowed`
#### Default

`false`

#### Possible values

`true`, `false`
:::

:::option `delimiters`

Set the characters that will cut off the content into tags when the user inputs the tags.

```ruby{3}
field :skills,
  as: :tags,
  delimiters: [",", " "]
```

<img :src="('/assets/img/fields/tags-field/delimiters.gif')" alt="Avo tags field" class="border mb-4" />

#### Default

`[","]`

#### Possible values

`[",", " "]`

Valid values are comma `,` and space ` `.

:::


:::option `mode`

By default, the tags field produces an array of items (ex: categories for posts), but in some scenarios you might want it to produce a single value (ex: dynamically search for users and select just one). Use `mode: :select` to make the field produce a single value as opposed to an array of values.

```ruby{3}
field :skills,
  as: :tags,
  mode: :select
```

#### Default

`nil`

#### Possible values

Valid values are `nil` for array values and `select` for a single value.

![](/assets/img/fields/tags-field/mode-select.gif)

:::

<Option name="`fetch_values_from`">

There might be cases where you want to dynamically fetch the values from an API. The `fetch_values_from` option enables you to pass a URL from where the field should suggest values.

This options works wonderful when used in [Actions](./../actions.md).

```ruby{3}
field :skills,
  as: :tags,
  fetch_values_from: "/avo/resources/skills/skills_for_user"
```

When the user searches for a record, the field will perform a request to the server to fetch the records that match that query.

![](/assets/img/fields/tags-field/mode-select.gif)

#### Default

`nil`

#### Possible values

Valid values are `nil`, a string, or a block that evaluates to a string. The string should resolve to an enddpoint that returns an array of objects with the keys `value` and `label`.

::: code-group

```ruby{2-10} [app/controllers/avo/skills_controller.rb]
class Avo::SkillsController < Avo::ResourcesController
  def skills_for_user
    skills = Skill.all.map do |skill|
      {
        value: skill.id,
        label: skill.name
      }
    end
    render json: skills
  end
end
```

```ruby{13} [config/routes.rb]
Rails.application.routes.draw do
  # your routes

  authenticate :user, ->(user) { user.is_admin? } do
    mount Avo::Engine, at: Avo.configuration.root_path
  end
end

if defined? ::Avo
  Avo::Engine.routes.draw do
    scope :resources do
      # Add route for the skills_for_user action
      get "skills/skills_for_user", to: "skills#skills_for_user"
    end
  end
end
```

:::info
When using the `fetch_labels_from` pattern, on the <Show /> and <Index /> views you will see the `id` of those options instead of the label.
That is expected, because you are storing the `id`s in the database and the field can't know what labels those `id`s have.

To mitigate that use the `fetch_labels` option.
:::

</Option>

:::option `fetch_labels`
:::warning
Deprecated since <Version version="3.10" /> in favor of [`format_using`](tags#format_using)
:::

The `fetch_labels` option allows you to pass an array of custom strings to be displayed on the tags field. This option is useful when Avo is displaying a bunch of IDs and you want to show some custom label from that ID's record.

```ruby{4-6}
field :skills,
  as: :tags,
  fetch_values_from: "/avo/resources/skills/skills_for_user",
  fetch_labels: -> {
    Skill.where(id: record.skills).pluck(:name)
  }
```

In the above example, `fetch_labels` is a lambda that retrieves the names of the skills stored in the record's `skills` property.

When you use `fetch_labels`, Avo passes the current `resource` and `record` as arguments to the lambda function. This gives you access to the hydrated resource and the current record.

#### Default

Avo's default behavior on tags

#### Possible values

- Array of strings

:::option `format_using`
:::info
Since <Version version="3.10" />
:::

The `format_using` option allows you to pass an array of custom strings or hashes to be displayed on the tags field. This option is useful when Avo is displaying a bunch of IDs and you want to show some custom label from that ID's record.

```ruby{4-11}
field :skills,
  as: :tags,
  fetch_values_from: "/avo/resources/skills/skills_for_user",
  format_using: -> {
    Skill.find(value).map do |skill|
      {
        value: skill.id,
        label: skill.name
      }
    end
  }
```

In the above example, `format_using` is a lambda that retrieves the names and the ids of the skills stored in the record's `skills` property.

When you use `format_using`, Avo passes the `value`, current `resource` and `record` as arguments to the lambda function. This gives you access to the hydrated resource and the current record.

#### Default

Avo's default behavior on tags

#### Possible values

- Array of strings, notice that this will replace the DB values
- Array of hashes with `value` and `label` keys. WIll show the `label` and store the `value`

## PostgreSQL array fields

You can use the tags field with the PostgreSQL array field.

```ruby{11}
# app/avo/resources/course.rb
class Avo::Resources::Course < Avo::BaseResource
  def fields
    field :skills, as: :tags
  end
end

# db/migrate/add_skills_to_courses.rb
class AddSkillsToCourses < ActiveRecord::Migration[6.0]
  def change
    add_column :courses, :skills, :text, array: true, default: []
  end
end
```

## Acts as taggable on

One popular gem used for tagging is [`acts-as-taggable-on`](https://github.com/mbleigh/acts-as-taggable-on). The tags field integrates very well with it.

You need to add `gem 'acts-as-taggable-on', '~> 9.0'` in your `Gemfile`, add it to your model `acts_as_taggable_on :tags`, and use `acts_as_taggable_on` on the field.

```ruby{6}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :tags,
      as: :tags,
      acts_as_taggable_on: :tags,
      close_on_select: false,
      placeholder: 'add some tags',
      suggestions: -> { Post.tags_suggestions },
      enforce_suggestions: true,
      help: 'The only allowed values here are `one`, `two`, and `three`'
  end
end

# app/models/post.rb
class Post < ApplicationRecord
  acts_as_taggable_on :tags
end
```

That will let Avo know which attribute should be used to fill with the user's tags.

:::info Related
You can set up the tags as a resource using [this guide](./../guides/act-as-taggable-on-integration).
:::

## Array fields

We haven't tested all the scenarios, but the tags field should play nicely with any array fields provided by Rails.

```ruby{10-12,14-16}
# app/avo/resources/post.rb
class Avo::Resources::Post < Avo::BaseResource
  def fields
    field :items, as: :tags
  end
end

# app/models/post.rb
class Post < ApplicationRecord
  def items=(items)
    puts ["items->", items].inspect
  end

  def items
    %w(1 2 3 4)
  end
end
```
