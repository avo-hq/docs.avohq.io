---
license: community
BetaStatus: Beta
---

# Money

The `Money` field is used to display a monetary value.

```ruby
field :price, as: :money, currencies: %w[EUR USD RON PEN]
```
## Money Field Example

You can explore the implementation of the money field in [avodemo](https://main.avodemo.com/avo/resources/products/new) and it's corresponding code on GitHub [here](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/product.rb)

### Example on new

<Image src="/assets/img/4_0/fields/money/form.png" dark-src="/assets/img/4_0/fields/money/form-dark.png" width="1520" height="236" alt="An Avo create-form card containing a money field: an amount input showing 0.00 beside a currency selector set to USD." prompt="on create page" />

### Example on show

<Image src="/assets/img/4_0/fields/money/show-inline.png" dark-src="/assets/img/4_0/fields/money/show-inline-dark.png" width="1776" height="254" alt="An Avo show-view card using the standard description-list layout: Price RON showing 1,499.00 Lei and Price USD showing $199.00 on separate rows with label left and value right." prompt="show page with Price RON and Price USD on separate lines in the same card" />

### Example on index

<Image src="/assets/img/4_0/fields/money/index.png" dark-src="/assets/img/4_0/fields/money/index-dark.png" width="1776" height="570" alt="An Avo index table with three columns — ID, Title and Price — where the Price column shows each product's money field formatted as a currency value such as $199.00." prompt="index table with ID, Title and Price columns" />

## Installation

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
monetize :price_cents
```

Without this step, the money field may not behave as expected, and the field might not render.
:::

## Options

<Option name="`currencies`">

The `currencies` option controls which currencies will be visible on the dropdown.


```ruby
field :price, as: :money, currencies: %w[EUR USD RON PEN]
```

#### Default

By default it's going to be an empty array.

`[]`

#### Possible values

Add an array of currencies by the ISO code.

`%w[EUR USD RON PEN]`
</Option>
