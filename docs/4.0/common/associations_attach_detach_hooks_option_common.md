<Option name="`before_attach`, `after_attach`, `before_detach`, `after_detach`" id="attach-detach-hooks">

<VersionReq package="avo" version="4.3.11" />

Run your own code when a user attaches or detaches a record from the association, for example to send a notification or write an audit entry.

```ruby-vue{3-5}
field :{{ $frontmatter.field_type === 'has_one' ? 'member' : 'members' }},
  as: :{{ $frontmatter.field_type }},
  after_attach: -> {
    Rails.logger.info "#{current_user&.id} added #{record.id}"
  }
```

Each block is executed in the [`ExecutionContext`](./../execution-context), so `current_user` and `params` are available, along with these locals:

| Local | Value |
| ----- | ----- |
| `parent` | The record whose page holds the association. |
| `record` | The record being attached or detached. When `after_detach` runs it is already deleted on a `has_many` with `dependent: :destroy` or `:delete_all`, and on a `has_one` with `dependent: :destroy` or `:delete`, unless the association is `:through`. `:through` and `has_and_belongs_to_many` associations only remove the join row. |
| `resource` | The parent record's resource. |
| `field` | The association field. |

When each hook runs:

| Hook | Runs |
| ---- | ---- |
| `before_attach` | Before each selected record is attached, inside the transaction that attaches all of them. |
| `after_attach` | After that transaction commits, once for every record attached. Skipped when the attach fails. |
| `before_detach` | Before the record is detached, inside the transaction that detaches it. |
| `after_detach` | After that transaction commits. Skipped when the detach fails. |

When a user selects several records at once, `before_attach` and `after_attach` run once for each of them. A `has_one` shows **Attach** only while it's empty, but an attach can still reach one that holds a record, for example from a page opened before someone else attached one. The attach then replaces that record, so the replaced record goes through `before_detach` and `after_detach`. Attaching a record that is already attached runs the attach hooks again; on `has_many :through` and `has_and_belongs_to_many` it also adds a second join row, unless a unique index or validation on the join model refuses it, which fails the attach. A detach request for a record that isn't attached to the parent changes nothing and runs no hooks.

#### Stop an attach or a detach

The block's return value is ignored. Raise an error to stop the change:

```ruby-vue{3-5}
field :{{ $frontmatter.field_type === 'has_one' ? 'member' : 'members' }},
  as: :{{ $frontmatter.field_type }},
  before_attach: -> {
    raise "#{record.id} is archived" if record.try(:archived?)
  }
```

Raising in `before_attach` rolls back the whole attach, including records already attached in the same request, and shows the error's message to the user. Raising in `before_detach` from the **Detach** button rolls back the detach, but the user gets an error response instead of a message. When `before_detach` runs because a `has_one` attach replaces the current record, it fails like `before_attach`: the attach is rolled back and the message is shown. To keep users from attaching or detaching in the first place, use the [`attach_{association}?` and `detach_{association}?` policy methods](./../authorization.html#authorize-association-controls). Replacing the record on a `has_one` checks only `attach_{association}?`.

`after_attach` and `after_detach` run after the change is saved, so an error raised there doesn't undo it. The user gets an error response, and the hooks that would run after it, for the remaining records or the `after_attach` of a `has_one` replace, don't run. Rescue errors inside the block if a failing side effect, like a notification, shouldn't reach the user.

:::warning
Raise a regular error, not `ActiveRecord::Rollback`. In `before_attach` and `before_detach`, Rails swallows `ActiveRecord::Rollback`, so the change is undone but the user only sees a generic failure message, without the reason. In `after_attach` and `after_detach` there is no transaction left to roll back: the change stays saved and the user gets an error response.
:::

#### Where the hooks run

:::warning
The hooks run only from the association's **Attach** and **Detach** buttons. They don't run when a record is created from the association's **Create** button, when records are added or removed through the field's nested form, when a `belongs_to` is changed on a form, when a record is deleted, or when the association is changed from code, an action, or an add-on such as the API. Hooks set on a `belongs_to` field are ignored.
:::

#### Default value

`nil`

#### Possible values

A lambda.
</Option>
