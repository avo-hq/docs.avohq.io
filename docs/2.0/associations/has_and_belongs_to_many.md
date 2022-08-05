# Has And Belongs To Many

The `HasAndBelongsToMany` association works similarly to `HasMany`.

```ruby
field :users, as: :has_and_belongs_to_many
```

<!--@include: ./show_on_edit.md-->

### Searchable `has_many`

<div class="flex gap-2 mt-2">
  <VersionReq version="1.25" />
  <LicenseReq license="pro" title="Searchable associations are available as a pro feature" />
</div>


Similar to [`belongs_to`](#searchable-belongs-to), the `has_many` associations support the `searchable` option.

```ruby{2}
class CourseLink < Avo::BaseResource
  field :links, as: :has_many, searchable: true, placeholder: "Click to choose a link"
end
```

:::warning
  Avo uses the **search feature** behind the scenes, so **make sure the target resource has the [`search_query`](search) option configured**.
:::

```ruby{3-5}
# app/avo/resources/course_link_resource.rb
class CourseLinkResource < Avo::BaseResource
  self.search_query = ->(params:) do
    scope.ransack(id_eq: params[:q], link_cont: params[:q], m: "or").result(distinct: false)
  end
end
```

<!--@include: ./scopes.md-->
<!--@include: ./show_hide_buttons.md-->