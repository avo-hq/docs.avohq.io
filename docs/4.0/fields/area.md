---
license: community
description: "The Area field is used to display a geographical area on a map."
fieldTags: [maps]
---

# Area

The `Area` field is used to display a geographical area on a map.

```ruby
field :city_center_area, as: :area
```

:::warning
You need to add the `mapkick-rb` (not `mapkick`) gem to your `Gemfile` and have the `MAPBOX_ACCESS_TOKEN` environment variable with a valid [Mapbox](https://account.mapbox.com/auth/signup/) key.
:::

## Description

The field reads a [GeoJSON](https://geojson.org) `coordinates` array from one database column (a `json` column works great) and renders it as an interactive area map on the <Show /> view.

```ruby
# Sample value for a polygon
[[[2.3342, 48.8674], [2.3396, 48.8600], [2.3253, 48.8567], [2.3245, 48.8639], [2.3342, 48.8674]]]
```

On the <Edit /> view you'll get a text input where you can edit the coordinates as JSON.

The field is hidden on the <Index /> view by default.

## Options

<Option name="`geometry`">

The type of [GeoJSON geometry](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1) the column holds.

#### Default value

`:polygon`

#### Possible values

`:polygon` or `:multi_polygon`

```ruby
field :city_center_area, as: :area, geometry: :multi_polygon
```
</Option>

<Option name="`mapkick_options`">

The `mapkick_options` option allows you to customize the appearance and behavior of the map.

Using this option, you can provide a hash of configuration settings supported by the Mapkick gem, such as specifying the map style or enabling controls.

#### Default value

`{}`

#### Possible values

Accepts the options as [specified in the Mapkick gem](https://github.com/ankane/mapkick#options).

```ruby{3-6}
field :city_center_area,
  as: :area,
  mapkick_options: {
    style: "mapbox://styles/mapbox/satellite-v9",
    controls: true
  }
```
</Option>

<Option name="`datapoint_options`">

Options attached to the area itself, such as a label, a tooltip, and a color, as [specified in the Mapkick gem](https://github.com/ankane/mapkick#area-map).

#### Default value

`{}`

#### Possible values

A hash with `label`, `tooltip`, and `color` keys.

```ruby{3-7}
field :city_center_area,
  as: :area,
  datapoint_options: {
    label: "Paris City Center",
    tooltip: "Bonjour mes amis!",
    color: "#009099"
  }
```
</Option>

## Full example

```ruby
field :city_center_area,
  as: :area,
  geometry: :polygon,
  mapkick_options: {
    style: "mapbox://styles/mapbox/satellite-v9",
    controls: true
  },
  datapoint_options: {
    label: "Paris City Center",
    tooltip: "Bonjour mes amis!",
    color: "#009099"
  }
```
