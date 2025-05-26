# Several fields in a cluster

<VersionReq version="3.18.0" class="mt-2" />

:::info
To fully understand this section, you should be familiar with the [`stacked`](./field-wrappers.html#stacked) field option and [`resource panels`](./resource-panels.html). These concepts will help you structure and customize your fields effectively.
:::

The `cluster` DSL allows you to group multiple fields horizontally within a [`panel`](./resource-panels.html#computed-panels-vs-manual-customization). This is useful for organizing related fields in a structured layout.

To enhance readability and maintain a well-organized UI, it is recommended to use the [`stacked`](./field-wrappers.html#stacked) option for fields inside clusters.

<Image src="/assets/img/row.png" width="1028" height="230" alt="Cluster" />

```ruby{4-18}
# app/avo/resources/person.rb
class Avo::Resources::Person < Avo::BaseResource
  def fields
    panel "Address" do
      cluster do
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


<Option name="`divider`">

<VersionReq version="3.21.0" class="mt-2" />

Adds a horizontal divider between fields.

```ruby{5}
# app/avo/resources/person.rb
class Avo::Resources::Person < Avo::BaseResource
  def fields
    panel "Address" do
      cluster divider: true do # [!code focus]
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

<Image src="/assets/img/cluster_with_divider.png" width="1944" height="404" alt="Cluster with divider" />

##### Default value

`false`

#### Possible values

`true`, `false`

</Option>