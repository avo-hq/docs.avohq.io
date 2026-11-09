---
license: community
description: "The CheckboxList field renders a list of checkboxes for selecting multiple values from a finite set of options."
fieldTags: [choice]
outline: [2, 3]
api_docs: ./checkbox_list-api.html
---

# Checkbox List

The `CheckboxList` field renders a list of checkboxes for selecting multiple values from a finite set of options. Use it when users should see the choices directly instead of opening a select.

```ruby
# app/avo/resources/team.rb
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

You must supply [`options`](./checkbox_list-api.html#options); there is no default list. Without [`inline_search`](./checkbox_list-api.html#inline_search), the field displays the choices without a search input. Images are circular unless you choose another shape.

<Image src="/assets/img/4_0/fields/checkbox_list/select.webm" dark-src="/assets/img/4_0/fields/checkbox_list/select-dark.webm" width="760" height="478" alt="An Avo edit-form card containing a checkbox_list field: an animation that checks three team members one after another from an initially empty selection." prompt="a gif where we select multiple options" />

## Define a fixed set of choices {#options}

For choices that do not depend on the record or request, pass an array of hashes. Give each choice an [`id`](./checkbox_list-api.html#id) to submit and a [`title`](./checkbox_list-api.html#title) to display. Add a [`description`](./checkbox_list-api.html#description) when users need help distinguishing similar choices.

```ruby
# app/avo/resources/user.rb
field :role_ids,
  as: :checkbox_list,
  options: [
    {id: 1, title: "Admin", description: "Can manage the account"},
    {id: 2, title: "Editor", description: "Can update content"},
    {id: 3, title: "Viewer", description: "Can read content"}
  ]
```

## Load choices from records

Use a lambda when the choices come from a query. Computed options run inside [`Avo::ExecutionContext`](../execution-context), with access to `record`, `resource`, `view`, `field`, `params`, `request`, `view_context`, and the other execution context helpers.

```ruby
# app/avo/resources/team.rb
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

## Add images to choices

Provide [`avatar_url`](./checkbox_list-api.html#avatar_url) or [`image_url`](./checkbox_list-api.html#image_url) to show an image before the title. Set [`image_format`](./checkbox_list-api.html#image_format) to `:rounded` or `:square` for non-circular images. Use [`image_alt`](./checkbox_list-api.html#image_alt) or [`avatar_alt`](./checkbox_list-api.html#avatar_alt) to customize the alt text; otherwise the title is used.

## Help users find a choice {#inline_search}

Enable inline search to filter the options already rendered on the page by title and description. Search is case-insensitive and does not make server requests, so use it for small and medium option sets. Checked choices stay selected and are still submitted when hidden by search.

```ruby
# app/avo/resources/team.rb
field :team_member_ids,
  as: :checkbox_list,
  options: -> { User.active.order(:name).map { |user| {id: user.id, title: user.name} } },
  inline_search: true
```

You can also use a lambda to decide whether to show the search input in the field's [execution context](./../execution-context.html). It must return `true` to enable search.

## Explain a limited set of results

If your query intentionally limits the available choices, add a [`hint`](./checkbox_list-api.html#hint) entry to explain that limit. Its title appears below the list, without a checkbox. The hint does not load more records.

```ruby
# app/avo/resources/team.rb
field :user_ids,
  as: :checkbox_list,
  options: -> {
    User.order(:name).limit(50).map { |user| {id: user.id, title: user.name} } +
      [{title: "Showing up to 50 users", hint: true}]
  }
```

## Save multiple selections

The field submits an array of selected option ids as strings. This works well with Rails collection writers like `team_member_ids=`. Integer and string ids match the same stored selection, and blank submitted values are removed before assignment. Clearing all checkboxes assigns an empty array.

For configuration shared with other fields, see [Shared field options](../field-options.html).
