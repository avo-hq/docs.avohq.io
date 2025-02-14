# Several fields in a row

:::info
To fully understand this section, you should be familiar with the [`stacked`](./field-wrappers.html#stacked) field option and [`resource panels`](./resource-panels.html). These concepts will help you structure and customize your fields effectively.
:::

The `row` DSL allows you to group multiple fields horizontally within a [`panel`](./resource-panels.html#computed-panels-vs-manual-customization). This is useful for organizing related fields in a structured layout.

To enhance readability and maintain a well-organized UI, it is recommended to use the [`stacked`](./field-wrappers.html#stacked) option for fields inside rows.

<Image src="/assets/img/row.png" width="1028" height="230" alt="Field naming convention" />

```ruby{4-18}
# app/avo/resources/user.rb
class Avo::Resources::Person < Avo::BaseResource
  def fields
    panel "Address" do
      row do
        field :street_address, stacked: true do
          "1234 Elm Street"
        end

        field :city, stacked: true do
          "Los Angeles"
        end

        field :zip_code, stacked: true do
          "15234"
        end
      end
    end
  end
end
```
