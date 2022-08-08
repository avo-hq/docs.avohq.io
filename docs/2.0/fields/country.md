---
version: '1.0'
license: community
---

# Country

`Country` field generates a [Select](#select) field on **Edit** view that includes all [ISO 3166-1](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) countries. The value stored in the database will be the country code, and the value displayed in Avo will be the name of the country.


```ruby
field :country, as: :country, display_code: true
```

## Options

:::option `display_code`

You can easily choose to display the `code` of the country on **Index** and **Show** views by declaring `display_code` to `true`.

### Default value

`false`

### Possible values

`true`, `false`
:::
