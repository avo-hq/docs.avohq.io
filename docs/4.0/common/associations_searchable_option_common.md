<Option name="`searchable`">

<LicenseReq license="pro" />

Turns the attach field/modal from a `<select>` into a search-as-you-type picker.

```ruby{4}
class Avo::Resources::CourseLink < Avo::BaseResource
  def fields
    field :links,
      searchable: true
  end
end
```

See [Searchable associations](./../associations/searchable) for setup requirements, the hash form (`searchable: { query:, suggestions:, limit:, enabled: }`), proc locals, and precedence rules.

#### Default

`false`

#### Possible values

`true`, `false`, `Hash`
</Option>
