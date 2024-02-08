:::option Reloadable

<VersionReq version="2.28" />

The reloadable option adds a reload icon next to the association title so users can easily reload just that turbo-frame instead of doing a full page reload.

#### Usage
To enable the `reloadable` feature, provide a block to the reloadable option when defining the field. Within this block, specify conditions under which the reloadable should be displayed.

```ruby
field :reviews, as: :has_many,
  reloadable: -> {
    current_user.is_admin?
  }
```
```ruby
field :reviews, as: :has_many, reloadable: true
  ```
In the above example, the reloadable will be visible if the current_user is an admin.

#### ExecutionContext
The reloadable block executes within the ExecutionContext, granting access to all default ExecutionContext methods and attributes. This allows for flexible conditions based on the current [`ExecutionContext`](./../execution-context).

#### Options
The reloadable option supports the following structure:

- **Default value**: `false`
- **Possible values**:
  - `true`: Enables the reloadable feature unconditionally.
  - `false`: Disables the reloadable feature.
  - `Proc`: Accepts a block that evaluates conditions for displaying the reloadable feature.

<img :src="('/assets/img/reloadable.png')" alt="Reloadable" class="border mb-4" />
