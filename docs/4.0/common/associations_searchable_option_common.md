<Option name="`searchable`">

<div class="space-x-2">
  <LicenseReq license="pro" />
  <DemoVideo demo-video="https://youtu.be/KLI_sVTPX-Q" />
</div>

Turns the attach field/modal from a `select` input to a searchable picker.

```ruby{5}
class Avo::Resources::CourseLink < Avo::BaseResource
  def fields
    field :links,
      as: :has_many,
      searchable: true
  end
end
```

:::warning
  Avo uses the **resource search feature** behind the scenes, so **make sure the target resource has the [`search[:query]`](./../search/resource-search) option configured**.
:::

```ruby{3-7}
# app/avo/resources/course_link.rb
class Avo::Resources::CourseLink < Avo::BaseResource
  self.search = {
    query: -> {
      query.ransack(id_eq: q, link_cont: q, m: "or").result(distinct: false)
    }
  }
end
```

### Per-picker overrides (hash form)

You can pass a hash to `searchable:` instead of `true` to override the target resource's defaults for that one picker. The hash accepts four keys, all optional:

```ruby
field :user,
  as: :belongs_to,
  searchable: {
    query: -> { query.ransack(first_name_cont: q).result(distinct: false) },  # tighter scope than the User resource's default
    suggestions: -> { query.where.not(id: parent_record&.user_id).order(created_at: :desc) },  # focus-empty defaults
    limit: 5,                                                                  # cap results
    enabled: -> { current_user.admin? }                                        # gate visibility
  }
```

| Key | Purpose | Falls back to |
|---|---|---|
| `query:` | Filter when the user types | Target resource's `self.search[:query]` |
| `suggestions:` | Records to show on focus-empty (picker only — see [resource search](./../search/resource-search)) | Target resource's `self.search[:suggestions]` |
| `limit:` | Max rows to display | Resource `results_count` → `Avo.configuration.search_results_count` |
| `enabled:` | Whether the picker is searchable for this request | `true` |
</Option>
