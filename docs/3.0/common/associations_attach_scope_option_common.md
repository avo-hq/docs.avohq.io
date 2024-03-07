:::option `attach_scope`
Scope out the records the user sees on the Attach modal.

#### Default

`nil`

#### Possible values

```ruby{3}
field :user,
  as: :belongs_to,
  attach_scope: -> { query.non_admins }
```

Pass in a block where you attach scopes to the `query` object and `parent` object, which is the actual record where you want to assign the association. The block is executed in the [`ExecutionContext`](./../execution-context).
:::

:::warning
The `attach_scope` will not filter the records in the listing from `has_many` or `has_and_belongs_to_many` associations.
Use [`scope`](#scope) or a [Pundit policy `Scope`](./../authorization#scopes) for that.
:::
