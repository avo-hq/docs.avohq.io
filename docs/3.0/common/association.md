:::option `association`

<VersionReq version="3.4.5" />

The `association` option allows to specify the association used for a certain field. This option make possible to define same association with different scopes and different name several times on the same resource.

#### Usage
```ruby-vue
field :reviews,
  as: :{{ $frontmatter.field_type }}

field :special_reviews,
  as: :{{ $frontmatter.field_type }},
  association: :reviews,
  scope: -> { query.special_reviews }
```
