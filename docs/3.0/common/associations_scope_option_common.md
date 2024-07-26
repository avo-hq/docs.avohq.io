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

Pass in a block where you attach scopes to the `query` object. The block gets executed in the [`ExecutionContext`](./../execution-context).
</Option>
