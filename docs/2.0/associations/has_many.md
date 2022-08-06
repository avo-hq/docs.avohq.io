# Has Many

The `HasMany` field is visible, by default, only on the **Show** page. Below the regular fields panel, you will see a new panel with the model's associated records.

```ruby
field :projects, as: :has_many
```

<img :src="('/assets/img/associations/has-many-table.jpg')" alt="Has many table" class="border mb-4" />

Here you may attach more records by clicking the "Attach" button.

<img :src="('/assets/img/associations/has-many-attach-modal.jpg')" alt="Has many attach" class="border mb-4" />

In a similar fashion, you may detach a model using the detach button.

<img :src="('/assets/img/associations/has-many-detach.jpg')" alt="Has many detach" class="border mb-4" />

<!--@include: ./common/show_on_edit_common.md-->

## Has Many Through

The `HasMany` association also supports the `:through` option.

```ruby
field :members, as: :has_many, through: :memberships
```

### Show on edit screens

By default, `has_many` is only visible on the **Show** page. If you want to enable it on the **Form** pages as well you need to add the `show_on: :edit` option.

**Adding associations on the `New` screen is not supported at the moment. The association needs some information form the parent record that hasn't been created yet (because the user is on the `New` screen).**

You may use the [redirect helpers](./../resources#customize-what-happens-after-record-is-created-edited) to have the following flow:

1. User on the `New` screen. They can't see the association panels yet.
1. User creates the record. They get redirected to the `Show`/`Edit` screen where they can see the association panels.
1. User attaches associations.

<!--@include: ./common/scopes_common.md-->
<!--@include: ./common/show_hide_buttons_common.md-->
