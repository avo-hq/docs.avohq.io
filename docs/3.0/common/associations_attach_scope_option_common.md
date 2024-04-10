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

Pass in a block where you attach scopes to the `query` object. The block is executed in the [`ExecutionContext`](./../execution-context).

:::

```ruby{3}
field :members,
  as: :has_many,
  through: :team_memberships,
  searchable: true,
  attach_scope: -> { query.where.not(team_id: parent.id) }
  ```
This example ensures that when attaching members to a team, only those who are not already members of that team will appear in the list of options.
