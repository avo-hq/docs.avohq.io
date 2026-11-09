---
license: community
betaStatus: Beta
description: "The Money field is used to display a monetary value."
fieldTags: [number]
outline: [2, 3]
---

# Money

The `Money` field edits a monetized amount with an optional currency selector and displays a formatted monetary value on index and show pages.

```ruby
# app/avo/resources/product.rb
field :price, as: :money, currencies: %w[EUR USD RON PEN]
```

Without field-specific options, the currency selector is enabled but its list is empty. The currency column name follows the `money-rails` currency postfix, normally `_currency`.

## Install the field and monetize the attribute

This field is a standalone gem.
You have to add it to your `Gemfile` alongside the `money-rails` gem.

:::info Add this field to the `Gemfile`
```ruby
# Gemfile

gem "avo-money_field"
gem "money-rails", "~> 1.12"
```
:::

:::warning Important: Monetization Requirement
In order to fully utilize the money field's features, you must monetize the associated attribute at the model level using the `monetize` method from the `money-rails` gem. ([Usage example](https://github.com/RubyMoney/money-rails?tab=readme-ov-file#usage-example))

For example:

```ruby
# app/models/product.rb
monetize :price_cents
```

Without this step, the money field may not behave as expected, and the field might not render.
:::

## Choose the available currencies {#currencies}

Pass `currencies` as an array of ISO currency-code strings, as in the opening example. It defaults to `[]`, so provide the choices you want users to see in the dropdown. This controls the form's choices, not model-level validation.

## Edit the amount without changing the currency {#enable_currency}

If the currency is managed elsewhere, set `enable_currency` to `false`. This hides the selector and leaves the record's currency column untouched when saving the amount. The option accepts `true` or `false` and defaults to `true`.

```ruby
# app/avo/resources/product.rb
field :price, as: :money, enable_currency: false
```

## Use a different currency column suffix {#currency_suffix}

If your monetized attribute uses a different currency column name, set `currency_suffix` to the suffix appended to the field's ID. For example, `price` with `"_currency"` targets `price_currency`; `"_currency_code"` targets `price_currency_code`.

The option accepts a string or symbol. It defaults to the `money-rails` currency column postfix (normally `"_currency"`), or `:_currency` when `MoneyRails` is not defined. It must match the currency attribute configured on your model.

```ruby
# app/avo/resources/product.rb
field :price, as: :money, currency_suffix: "_currency"
```

## Preview the field in each view

Explore the money field in [avodemo](https://main.avodemo.com/avo/resources/products/new) and its [resource code on GitHub](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/product.rb).

### Create a record

<Image src="/assets/img/4_0/fields/money/form.webp" dark-src="/assets/img/4_0/fields/money/form-dark.webp" width="1520" height="236" alt="An Avo create-form card containing a money field: an amount input showing 0.00 beside a currency selector set to USD." prompt="on create page" />

### View a record

<Image src="/assets/img/4_0/fields/money/show-inline.webp" dark-src="/assets/img/4_0/fields/money/show-inline-dark.webp" width="1776" height="254" alt="An Avo show-view card using the standard description-list layout: Price RON showing 1,499.00 Lei and Price USD showing $199.00 on separate rows with label left and value right." prompt="show page with Price RON and Price USD on separate lines in the same card" />

### Browse records

<Image src="/assets/img/4_0/fields/money/index.webp" dark-src="/assets/img/4_0/fields/money/index-dark.webp" width="1776" height="570" alt="An Avo index table with three columns — ID, Title and Price — where the Price column shows each product's money field formatted as a currency value such as $199.00." prompt="index table with ID, Title and Price columns" />

## Configure shared field behavior

For options shared with other fields, see [Common field options](../field-options.html).
