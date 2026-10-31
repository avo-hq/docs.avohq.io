<Option name="`before_attach`, `after_attach`, `before_detach`, `after_detach`">

<VersionReq version="4.3.11" />

Run your own code when a user attaches or detaches a record from the association, for example to send a notification or write an audit entry.

```ruby-vue{3-5}
field :members,
  as: :{{ $frontmatter.field_type }},
  after_attach: -> {
    Rails.logger.info "#{current_user&.id} added #{record.id}"
  }
```

Each block is executed in the [`ExecutionContext`](./../execution-context), so `current_user` and `params` are available, along with these locals:

| Local | Value |
| ----- | ----- |
| `parent` | The record whose page holds the association. |
| `record` | The record being attached or detached. On a `has_many` or `has_one` that isn't `:through`, with `dependent: :destroy`, `:delete_all` or `:delete`, it is already deleted when `after_detach` runs. `:through` and `has_and_belongs_to_many` associations only remove the join row. |
| `resource` | The parent record's resource. |
| `field` | The association field. |

When each hook runs:

| Hook | Runs |
| ---- | ---- |
| `before_attach` | Before each selected record is attached, inside the transaction that attaches all of them. |
| `after_attach` | After that transaction commits, once for every record attached. Skipped when the attach fails. |
| `before_detach` | Before the record is detached, inside the transaction that detaches it. |
| `after_detach` | After that transaction commits. Skipped when the detach fails. |

When a user selects several records at once, `before_attach` and `after_attach` run once for each of them. Attaching a record to a `has_one` that already holds one replaces it, so the replaced record goes through `before_detach` and `after_detach`. Attaching a record that is already attached runs the attach hooks again. A detach request for a record that isn't attached to the parent changes nothing and runs no hooks.

#### Stop an attach or a detach

The block's return value is ignored. Raise an error to stop the change:

```ruby-vue{3-5}
field :members,
  as: :{{ $frontmatter.field_type }},
  before_attach: -> {
    raise "#{record.id} is archived" if record.try(:archived?)
  }
```

Raising in `before_attach` rolls back the whole attach, including records already attached in the same request, and shows the error's message to the user. Raising in `before_detach` rolls back the detach, but the user gets an error page instead of a message. To keep users from attaching or detaching in the first place, use the [`attach_{association}?` and `detach_{association}?` policy methods](./../authorization.html#authorize-association-controls).

`after_attach` and `after_detach` run after the change is saved, so an error raised there doesn't undo it. The user gets an error page, and the hook doesn't run for the remaining records. Rescue errors inside the block if a failing side effect, like a notification, shouldn't reach the user.

:::warning
Raise a regular error, not `ActiveRecord::Rollback`. Rails swallows `ActiveRecord::Rollback`, so the change is undone but the user only sees a generic failure message, without the reason.
:::

#### Where the hooks run

:::warning
The hooks run only from the association's **Attach** and **Detach** buttons. They don't run when a record is created from the association's **Create** button, when a `belongs_to` is changed on a form or a nested form, when a record is deleted, or when the association is changed from code or an action. Hooks set on a `belongs_to` field are ignored.
:::

#### Default value

`nil`

#### Possible values

A lambda.
</Option>
