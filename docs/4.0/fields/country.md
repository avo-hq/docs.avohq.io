---
license: community
description: "Country field generates a Select field on Edit view that includes all ISO 3166-1 countries."
fieldTags: [choice]
---

# Country

`Country` field generates a [Select](./select.html) field on **Edit** view that includes all [ISO 3166-1](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) countries. The value stored in the database will be the country code, and the value displayed in Avo will be the name of the country.

:::warning
You must manually require the `countries` gem in your `Gemfile`.

```ruby
# All sorts of useful information about every country packaged as convenient little country objects.
gem "countries"
```
:::

```ruby
field :country, as: :country, display_code: true
```

## Options

<Option name="`display_code`">

You can easily choose to display the `code` of the country on **Index** and **Show** views by declaring `display_code` to `true`.

#### Default value

`false`

#### Possible values

`true`, `false`
</Option>

<Option name="`include_blank`">

Because `Country` renders as a [`Select`](./select.html) field, it also accepts the `include_blank` option to control the first, empty option in the dropdown. See the [`Select` field's `include_blank` documentation](./select.html#include_blank) for the full behavior.

#### Default value

`nil`

#### Possible values

`nil`, `true`, `false`, or a string to be used as the first option.
</Option>
