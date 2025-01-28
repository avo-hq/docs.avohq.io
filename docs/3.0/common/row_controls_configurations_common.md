##### Optional

`true`

##### Default value

```ruby{1-5}
{
  placement: :right,
  float: false,
  show_on_hover: false,
}.freeze
```

#### Possible values

You can define the configuration using the following keys:

- `:placement`
  Defines the position of the row controls. Possible values are:
  - `:left` - Places the controls on the left side of the resource row.
  - `:right` - Places the controls on the right side of the resource row.
  - `:both` - Displays controls on both sides of the resource row.

- `:float`
  Determines whether the row controls should float over the row or not.
  Possible values:
  - `true` - Enables floating behavior.
  - `false` - Disables floating behavior (default).

- `:show_on_hover`
  Controls whether the row controls should be displayed only on hover.
  Possible values:
  - `true` - Displays the controls on hover only.
  - `false` - Always shows the controls (default).
