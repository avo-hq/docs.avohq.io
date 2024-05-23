---
version: '3.6'
license: community
betaStatus: Beta
---

# Money

The `Money` field is used to display a monetary value.

```ruby
field :price, as: :money, currencies: %w[EUR USD RON PEN]
```
## Money Field Example

Here is how you can see the money field in the [avodemo](https://main.avodemo.com/avo/resources/products/new)

### Example

<img :src="('/assets/img/money-field.png')" class="border mb-4" />

<img :src="('/assets/img/money-field2.png')" class="border mb-4" />

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

## Options

:::option `currencies`

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
:::
