## Show on edit screens

By default, `has_and_belongs_to_many` is only visible on the **Show** page. If you want to enable it on the **Edit** page, too, you need to add the `show_on: :edit` option.

:::warning
  Adding associations on the `New` screen is not currently supported. The association needs some information from the parent record that hasn't been created yet (because the user is on the `New` screen).
:::

You may use the [redirect helpers](./../resources#customize-what-happens-after-record-is-created-edited) to have the following flow:

1. User is on the `New` view. They can't see the association panels yet.
1. User creates the record.
1. They get redirected to the `Show`/`Edit` view where they can see the association panels.
1. User attaches associations.