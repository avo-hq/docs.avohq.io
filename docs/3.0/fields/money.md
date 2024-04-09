---
version: '3.6'
license: community
betaStatus: Beta
---

# Money

The `Money` field is used to a monetary value.

:::info Add this field to the `Gemfile`
```ruby
# Gemfile

gem "avo-money_field"
```
:::

Docs are WIP.

```ruby
field :price, as: :money, currencies: %w[EUR USD RON PEN]
```
