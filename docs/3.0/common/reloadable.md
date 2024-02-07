## Reloadable

Starting from this version (I don't know), Avo introduces the option to enable a `reloadable` feature for association tables. This feature allows users to manually refresh the content of association table.

### Usage
To enable the `reloadable`feature, provide a block to the reloadable option when defining the field. Within this block, specify conditions under which the reloadable should be displayed.
```
field :reviews, as: :has_many,
      reloadable: -> {
        current_user.is_admin?
      }
```
In the above example, the `reloadable` will be visible if the current_user is an admin.

### ExecutionContext
The reloadable block executes within the ExecutionContext, granting access to all default ExecutionContext methods and attributes. This allows for flexible conditions based on the current [`ExecutionContext`](./../execution-context).
<img :src="('/assets/img/reloadable.png')" alt="Reloadable" class="border mb-4" />
