<Option name="`per_page`">

Sets how many records the association table shows per page, for this field only. Use it when one association needs a different page size than the global [`via_per_page`](./../customization-api.html#via_per_page).

```ruby
field :certifications, as: :has_many, per_page: 24
```

The page size is picked in this order:

1. A `per_page` value picked from the per-page dropdown (the `?per_page=` param)
2. The value saved in the session, when [session persistence](./../customization-api.html#persistence) is on
3. The field's `per_page`
4. `config.via_per_page`

The per-page dropdown on that table lists the field's `per_page` value, so users can always switch back to it.

:::info
With session persistence on, the saved page size is keyed by the parent resource and the associated resource, not by field. Two fields on the same parent that point at the same resource share it.
:::

#### Default value

`nil`. The table uses `config.via_per_page`.

#### Possible values

Any positive integer.
</Option>
