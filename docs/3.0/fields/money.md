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

You can explore the implementation of the money field in [avodemo](https://main.avodemo.com/avo/resources/products/new) and it's corresponding code on GitHub [here](https://github.com/avo-hq/main.avodemo.com/blob/main/app/avo/resources/product.rb)

### Example on new

<img :src="('/assets/img/money-field.png')" class="border mb-4" />

<img :src="('/assets/img/money-field2.png')" class="border mb-4" />

### Example on show with currencies USD

<img :src="('/assets/img/money-field-show.png')" class="border mb-4" />

### Example on show with currencies RON

<img :src="('/assets/img/money-field-show-lei.png')" class="border mb-4" />

### Example on index

<img :src="('/assets/img/money-field-index.png')" class="border mb-4" />

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
