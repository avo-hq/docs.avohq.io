::::option `searchable`

<div class="space-x-2">
  <LicenseReq license="pro" />
  <DemoVideo demo-video="https://youtu.be/KLI_sVTPX-Q" />
</div>

Turns the attach field/modal from a `select` input to a searchable experience

```ruby{4}
class CourseLink < Avo::BaseResource
  field :links,
    as: :has_many,
    searchable: true
end
```

:::warning
  Avo uses the **search feature** behind the scenes, so **make sure the target resource has the [`search_query`](./../search) option configured**.
:::

```ruby{3-5}
# app/avo/resources/course_link_resource.rb
class CourseLinkResource < Avo::BaseResource
  self.search_query = -> do
    query.ransack(id_eq: params[:q], link_cont: params[:q], m: "or").result(distinct: false)
  end
end
```

#### Default

`false`

#### Possible values

`true`, `false`
::::
