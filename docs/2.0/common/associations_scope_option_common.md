<Option name="`scope`">
Scope out the records displayed in the table.

#### Default

`nil`

#### Possible values

```ruby{3}
field :user,
  as: :belongs_to,
  scope: -> { query.approved }
```

Pass in a block where you attach scopes to the `query` object. The block gets executed in the [`AssociationScopeHost`](./../evaluation-hosts.html#associationscopehost), so follow the docs to see what variables you have access to.
</Option>
