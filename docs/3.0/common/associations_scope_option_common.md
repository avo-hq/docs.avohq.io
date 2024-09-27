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

With version 2.5.0, you'll also have access to the `parent` record so that you can use that to scope your associated models even better.

Starting with version 3.12, access to `resource` and `parent_resource` was additionally provided.
</Option>
