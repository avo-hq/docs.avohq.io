<Option name="`searchable`">

<div class="space-x-2">
  <LicenseReq license="pro" />
  <DemoVideo demo-video="https://youtu.be/KLI_sVTPX-Q" />
</div>

Turns the attach field/modal from a `select` input to a searchable experience

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
  Avo uses the **search feature** behind the scenes, so **make sure the target resource has the [`search_query`](./../search) option configured**.
:::

```ruby{3-7}
# app/avo/resources/course_link.rb
class Avo::Resources::CourseLink < Avo::BaseResource
  self.search = {
    query: -> {
      query.ransack(id_eq: params[:q], link_cont: params[:q], m: "or").result(distinct: false)
    }
  }
end
```

#### Default

`false`

#### Possible values

`true`, `false`
</Option>
