---
version: 2.32
license: community
betaStatus: Open beta
---

# Area

The `Area` field is used to display one or more Polygons on a map.

```ruby
field :center_area, as: :area
```

<img :src="('/assets/img/fields/area-field.png')" alt="Area field" class="border mb-4" />

:::warning
You need to add the `mapkick-rb` (not `mapkick`) gem to your `Gemfile` and have the `MAPBOX_ACCESS_TOKEN` environment variable with a valid [Mapbox](https://account.mapbox.com/auth/signup/) key.
:::

## Description

By default, the area field is attached to a database column of type `:json` that has the Polygon- or Multi-Polygon coordinates stored in a nested Array as specified by the GeoJSON format. On the <Show /> view you'll get in interactive map and on the edit you'll get one field where you can edit the coordinates.

For Polygons:

```ruby
[[[10.0,11.2], [10.5, 11.9],[10.8, 12.0], [10.0,11.2]]]
```

Or Multi-Polygons:

```ruby
[[[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]], [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]], [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]]]
```

## Options

<Option name="`geometry`">

#### Default

`:polygon`

#### Possible values

`:polygon` or `:multi_polygon`

</Option>
<Option name="`mapkick_options`">

For example:

```ruby
mapkick_options: { style: 'mapbox://styles/mapbox/satellite-v9', controls: true },
```

#### Default

`{}`

#### Possible values

Accepts the options as [specified in the Mapkick-gem](https://github.com/ankane/mapkick#options).

</Option>
<Option name="`datapoint_options`">

Fore example:

```ruby
datapoint_options: { label: 'Paris City Center',
                     tooltip: 'Bonjour mes amis!',
                     color: '#009099' }
```

#### Default

`{}`

#### Possible values

Besides the general options related to the map, the area-field also accepts [datapoint-options](https://github.com/ankane/mapkick#area-map).

</Option>

## Options combined

```ruby
field :center_area,
  as: :area,
  geometry: :polygon,
  mapkick_options: {
    style: 'mapbox://styles/mapbox/satellite-v9',
    controls: true
  },
  datapoint_options: {
    label: 'Paris City Center',
    tooltip: 'Bonjour mes amis!',
    color: '#009099'
  }
```

This will render a map like this:

<img :src="('/assets/img/fields/area-field-with-options.png')" alt="Area field with options" class="border mb-4" />
