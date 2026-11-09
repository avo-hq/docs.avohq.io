---
license: community
description: "The Area field is used to display a geographical area on a map."
fieldTags: [maps]
outline: [2, 3]
api_docs: ./area-api.html
---

# Area

The `Area` field displays a geographical area as an interactive map on the <Show /> view and provides a text input for editing its coordinates on forms.

```ruby
# app/avo/resources/city.rb
field :city_center_area, as: :area
```

By default, the field treats the coordinates as a polygon, adds no labels or custom colors, and is hidden on the <Index /> view. Maps follow Avo's light and dark color schemes using the configured map styles, or OpenFreeMap when no provider is configured and no Mapbox token is set.

## Enable maps

Add the `mapkick-rb` gem (not `mapkick`) to your `Gemfile`:

```ruby
# Gemfile
gem "mapkick-rb"
```

Avo renders maps with [OpenFreeMap](https://openfreemap.org) by default: no registration, no API key, no request limit, and attribution is handled for you.

If you'd rather use Mapbox, set the `MAPBOX_ACCESS_TOKEN` environment variable to a valid [Mapbox](https://account.mapbox.com/auth/signup/) key and Avo will default to Mapbox styles instead. Pin either provider, or your own light/dark pair, with [`config.map_view`](../customization-api.html#styles). To override a single map, see [Customize the map](#mapkick_options).

## Store and edit coordinates {#description}

Store a [GeoJSON](https://geojson.org) `coordinates` array in one database column, such as a `json` column. Store just the coordinates, not a complete GeoJSON geometry or Feature object. Coordinates use longitude, latitude order.

For example, this polygon outlines an area in central Paris:

```json
[[[2.3342, 48.8674], [2.3396, 48.8600], [2.3253, 48.8567], [2.3245, 48.8639], [2.3342, 48.8674]]]
```

On the <Edit /> view, edit the coordinates as JSON in the text input. A blank value renders a dash instead of a map on the <Show /> view.

## Configure the area {#options}

### Display multiple polygons {#geometry}

If your column holds several polygons, set [`geometry`](./area-api.html#geometry) to `:multi_polygon` and store an array of polygon coordinate arrays. For a single polygon, store its exterior ring followed by any holes. See the [GeoJSON geometry specification](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1) for the coordinate structure.

```ruby
# app/avo/resources/city.rb
field :city_center_area, as: :area, geometry: :multi_polygon
```

:::warning
Avo does not validate the geometry type or coordinates. The coordinates must match the selected geometry, and each linear ring must be closed by repeating its first position at the end.
:::

### Customize the map {#mapkick_options}

<span id="mapkick-options"></span>

Use [`mapkick_options`](./area-api.html#mapkick_options) to change the map's appearance or enable controls. For example, choose a different style for this field and add navigation controls:

```ruby
# app/avo/resources/city.rb
field :city_center_area,
  as: :area,
  mapkick_options: {
    style: "https://tiles.openfreemap.org/styles/liberty",
    controls: true
  }
```

:::info
Avo follows the color scheme and swaps the map between its light and dark styles automatically. Pass your own `style` and Avo leaves the map exactly as you set it, dark mode included.
:::

### Label and color the area {#datapoint_options}

<span id="datapoint-options"></span>

Use [`datapoint_options`](./area-api.html#datapoint_options) to attach a label, tooltip, or color to the area:

```ruby
# app/avo/resources/city.rb
field :city_center_area,
  as: :area,
  datapoint_options: {
    label: "Paris City Center",
    tooltip: "Bonjour mes amis!",
    color: "#009099"
  }
```

## Full example

```ruby
# app/avo/resources/city.rb
field :city_center_area,
  as: :area,
  geometry: :polygon,
  mapkick_options: {
    style: "https://tiles.openfreemap.org/styles/liberty",
    controls: true
  },
  datapoint_options: {
    label: "Paris City Center",
    tooltip: "Bonjour mes amis!",
    color: "#009099"
  }
```

For labels, visibility, placeholders, and other shared field settings, see [Common field options](../field-options.html).
