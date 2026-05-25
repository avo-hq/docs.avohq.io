---
version: "4.0"
license: community
---

# Checkbox List

<Image src="/assets/img/fields/checkbox_list/checkbox_list_field.gif" width="800" height="546" alt="Checkbox List field" />

The `CheckboxList` field renders a list of checkboxes for selecting multiple values from a finite set of options.

Use it when the available options are already known and users should see the choices directly instead of opening a select.

```ruby
field :team_member_ids,
  as: :checkbox_list,
  options: -> {
    User.active.order(:name).map do |user|
      {
        id: user.id,
        title: user.name,
        avatar_url: user.avatar_url,
        image_format: :circle,
        description: user.email
      }
    end
  },
  inline_search: true
```

The field submits an array of selected option ids. This works well with Rails collection writers like `team_member_ids=`.

## Options

<Option name="`options`">

The `options` attribute is required and accepts an array or a proc that returns an array.

Each option should be a hash with these keys:

| Key                         | Description                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------ |
| `id`                        | The submitted value for the checkbox                                                 |
| `title`                     | The visible title                                                                    |
| `description`               | Optional supporting text shown below the title                                       |
| `avatar_url` or `image_url` | Optional image shown before the title                                                |
| `avatar_alt` or `image_alt` | Optional alt text for the image                                                      |
| `image_format`              | Optional image shape. Use `:circle`, `:rounded`, or `:square`. Defaults to `:circle` |

```ruby
field :role_ids,
  as: :checkbox_list,
  options: [
    {id: 1, title: "Admin", description: "Can manage the account"},
    {id: 2, title: "Editor", description: "Can update content"},
    {id: 3, title: "Viewer", description: "Can read content"}
  ]
```

Computed options run inside [`Avo::ExecutionContext`](../execution-context), so they have access to `record`, `resource`, `view`, `field`, `params`, `request`, `view_context`, and the other execution context helpers.

```ruby{4-13}
field :user_ids,
  as: :checkbox_list,
  options: -> {
    users = User.order(:name)

    users.map do |user|
      {
        id: user.id,
        title: user.name,
        avatar_url: user.avatar_url,
        description: user.email
      }
    end
  }
```

</Option>

<Option name="`inline_search`">

Set `inline_search: true` to add a client-side search input above the checkbox list.

The search filters the options that were already rendered on the page. It does not make server requests, so use it for small and medium option sets.

```ruby{4}
field :team_member_ids,
  as: :checkbox_list,
  options: -> { User.active.order(:name).map { |user| {id: user.id, title: user.name} } },
  inline_search: true
```

<!-- @include: ./../common/default_boolean_false.md-->
</Option>
