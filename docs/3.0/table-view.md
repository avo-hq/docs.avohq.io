---
outline: [2,3]
---

# Table View

The table view is the default way to display resources in Avo. It provides a powerful, tabular layout that supports searching, sorting, filtering, and pagination out of the box.

<Image src="/assets/img/table-view.png" width="1919" height="1122" alt="Table view" />

## Row controls configuration
:::info
The configuration options for row controls depend on the version of Avo you are using.

**If you are using a version earlier than <Version version="3.16.3" />**, refer to the following pages for guidance:

- [How to adjust resource controls globally for all resources](customization.html#resource-controls-on-the-left-or-both-sides)
- [Customize the placement of controls for individual resources](resources.html#self.controls_placement)
:::

By default, resource controls are positioned on the right side of record rows. However, if the table contains many columns, these controls may become obscured. In such cases, you may prefer to move the controls to the left side for better visibility.

<VersionReq version="3.16.3" /> Avo provides configuration options that allow you to customize row controls placement, floating behavior, and visibility on hover either globally or individually for each resource.


### Global configuration

`resource_row_controls_config` defines the default settings for row controls across all resources. These global configurations will apply to each resource unless explicitly overridden.

This option can be configured on `config/initializers/avo.rb` and defaults to the following:

```ruby{3-7}
# config/initializers/avo.rb
Avo.configure do |config|
  config.resource_row_controls_config = {
    placement: :right,
    float: false,
    show_on_hover: false
  }
end
```

### Resource configuration

`row_controls_config` option allows you to customize the row controls for a specific resource, overriding the global configuration.

This option can be configured individually for each resource and defaults to the global configuration value defined in `resource_row_controls_config`.


```ruby{3-7}
# app/avo/resources/user.rb
class Avo::Resources::User < Avo::BaseResource
  self.row_controls_config = {
    placement: :right,
    float: false,
    show_on_hover: false,
  }
end
```

<Option name="`placement`">

Defines the position of the row controls.

##### Optional

`true`

##### Default value

`:right`

#### Possible values

- `:left` - Places the controls on the **left side** of the resource row.
- `:right` - Places the controls on the **right side** of the resource row.
- `:both` - Displays controls on **both sides** of the resource row.


:::warning
The `float` and `show_on_hover` options are designed to function optimally when `placement` is set to `:right`. While Avo does not restrict its usage with `:left` or `:both`, the applied styles are specifically intended for use with `:right`, and unexpected behavior may occur with other placements.
:::
</Option>

<Option name="`float`">

Determines whether the row controls should float over the row.

##### Optional

`true`

##### Default value

`false`

#### Possible values

- `true` - Enables floating behavior.
- `false` - Disables floating behavior (default).
</Option>

<Option name="`show_on_hover`">

Controls whether the row controls should be displayed only on hover.

##### Optional

`true`

##### Default value

`false`

#### Possible values

- `true` - Displays the controls on hover only.
- `false` - Always shows the controls (default).
</Option>
