---
license: community
description: "Country field generates a Select field on Edit view that includes all ISO 3166-1 countries."
fieldTags: [choice]
outline: [2, 3]
api_docs: ./country-api.html
---

# Country

The `Country` field renders a [Select](./select.html) dropdown on forms with [ISO 3166-1](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes) countries supplied by the `countries` gem. It stores the country code in the database and displays the country name in Avo.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :country, as: :country
  end
end
```

By default, country names appear in the dropdown and on **Index** and **Show** views. The dropdown is sorted by country name and prompts users to choose a country.

## Enable country selection

:::warning
Add the `countries` gem to your `Gemfile` so the field can load the country list.

```ruby
# Gemfile
gem "countries"
```
:::

## Display country codes instead of names {#display_code}

<span id="display-code"></span>

If your users work with country codes, set [`display_code`](./country-api.html#display_code) to `true`. This changes the labels in the dropdown as well as the values displayed on **Index** and **Show** views. It does not change the stored code.

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :country, as: :country, display_code: true
  end
end
```

## Offer an empty selection {#include_blank}

<span id="include-blank"></span>

Use [`include_blank`](./country-api.html#include_blank) to control the dropdown's first, empty option. For example, give it a label that explains what leaving the country empty means:

```ruby
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  def fields
    field :country, as: :country, include_blank: "No country selected"
  end
end
```

See also the [Select field's `include_blank` documentation](./select.html#include_blank).

## Customize shared field behavior

For labels, help text, placeholders, visibility, and other options shared across fields, see [Common field options](../field-options.html).
