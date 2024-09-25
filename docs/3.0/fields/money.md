---
version: '3.6'
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

<Image src="/assets/img/money-field.png" width="1005" height="59" alt="" />

<Image src="/assets/img/money-field2.png" width="1005" height="123" alt="" />

### Example on show with currencies USD

<Image src="/assets/img/money-field-show.png" width="689" height="54" alt="" />

### Example on show with currencies RON

<Image src="/assets/img/money-field-show-lei.png" width="689" height="55" alt="" />

### Example on index

<Image src="/assets/img/money-field-index.png" width="208" height="299" alt="" />

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
