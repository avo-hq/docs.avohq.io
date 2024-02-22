:::option Reloadable

<VersionReq version="3.3.6" />

The reloadable option adds a reload icon next to the association title so users can easily reload just that turbo-frame instead of doing a full page reload.

#### Usage
To enable the reloadable feature, you have two options:

1. Direct Boolean Value:

Provide a boolean value directly to the reloadable option. This sets a default behavior where the reloadable feature is either enabled or disabled based on this boolean value.

```ruby-vue
field :reviews, as: :{{ $frontmatter.field_type }}, reloadable: true
```

2. Dynamic Conditions with a Block:

For more dynamic behavior, you can provide a block to the reloadable option. Within this block, you can specify conditions under which the reloadable should be displayed.

```ruby-vue
field :reviews, as: :{{ $frontmatter.field_type }},
  reloadable: -> {
    current_user.is_admin?
  }
```

In the above example, the reloadable will be visible if the current_user is an admin.

#### ExecutionContext
The reloadable block executes within the [`ExecutionContext`](./../execution-context), granting access to all default methods and attributes.

<img :src="('/assets/img/reloadable.png')" alt="Reloadable" class="border mb-4" />
