---
license: community
betaStatus: "Open beta"
description: "The Location field is used to display a point on a map."
fieldTags: [maps]
outline: [2, 3]
api_docs: ./location-api.html
---

# Location

The `Location` field displays a point on a map and lets users edit its latitude and longitude.

```ruby
# app/avo/resources/city.rb
field :coordinates, as: :location, stored_as: [:latitude, :longitude]
```

By default, the field is hidden on the index view and displays an interactive map on the show view. Without `stored_as`, it uses the field's own attribute and renders one text input for editing coordinates.

<Image src="/assets/img/4_0/fields/location/show-map.webp" dark-src="/assets/img/4_0/fields/location/show-map-dark.webp" width="1192" height="1060" alt="An Avo Map card on the Dashy dashboard showing an embedded Google Maps view of Manhattan with an Open in Maps link and map navigation controls." prompt="page with navigation map" />

## Display an interactive map

Add `mapkick-rb` (not `mapkick`) to your application:

```ruby
# Gemfile
gem "mapkick-rb"
```

Avo renders maps with [OpenFreeMap](https://openfreemap.org) by default: no registration, no API key, no request limit, and attribution is handled for you.

If you'd rather use Mapbox, set the `MAPBOX_ACCESS_TOKEN` environment variable to a valid [Mapbox](https://account.mapbox.com/auth/signup/) key. Avo then defaults to Mapbox styles. Pin either provider, or your own light/dark pair, with [`config.map_view`](../customization-api.html#styles).

## Edit coordinates in separate columns {#stored_as}

If your model stores coordinates in two columns, use [`stored_as`](./location-api.html#stored_as) as in the opening example. List latitude first and longitude second; the column names can be different from `latitude` and `longitude`.

This displays two separate text inputs on the edit form and uses those attributes to position the map.

<Image src="/assets/img/4_0/fields/location/stored-as.webp" dark-src="/assets/img/4_0/fields/location/stored-as-dark.webp" width="1520" height="236" alt="An Avo edit-form card showing a location field with stored_as configured: separate Latitude and Longitude text inputs side by side, prefilled with Paris coordinates." prompt="todo" />

### Use a single coordinate attribute

Omit `stored_as` if your model already exposes a coordinate pair through one attribute:

```ruby
# app/avo/resources/city.rb
field :coordinates, as: :location
```

The edit input accepts comma-separated coordinates such as `44.427946,26.102451`, in latitude/longitude order. On submission, Avo splits that text into an array before assigning it to the model. The attribute must return an indexable coordinate pair for map rendering, such as `[44.427946, 26.102451]`.

:::warning Coordinate storage
A plain text column containing `"44.427946,26.102451"` is not split when the map is displayed. Use an array-compatible attribute, a model getter/setter that converts the stored value, or two columns with `stored_as`.
:::

## Customize the map's appearance

<span id="zoom"></span>

Set [`zoom`](./location-api.html#zoom) to change the initial zoom level of the interactive map:

```ruby
# app/avo/resources/city.rb
field :coordinates, as: :location, stored_as: [:latitude, :longitude], zoom: 12
```

<span id="mapkick_options"></span>

For other map settings, pass [`mapkick_options`](./location-api.html#mapkick_options). For example, choose a style for this field:

```ruby
# app/avo/resources/city.rb
field :coordinates,
  as: :location,
  stored_as: [:latitude, :longitude],
  mapkick_options: {
    style: "https://tiles.openfreemap.org/styles/liberty",
    controls: true
  }
```

See the [Mapkick options](https://github.com/ankane/mapkick#options) for other settings.

:::info Dark mode
Avo follows the color scheme and swaps between the configured light and dark styles automatically. An explicit `mapkick_options[:style]` disables that automatic switching for this map.
:::

## Display a static map {#static}

If you want an image instead of an interactive map, enable [`static`](./location-api.html#static):

```ruby
# app/avo/resources/city.rb
field :coordinates,
  as: :location,
  stored_as: [:latitude, :longitude],
  static: true,
  mapkick_options: {
    style: "mapbox://styles/mapbox/satellite-v9"
  }
```

:::warning Mapbox required
Static maps use Mapbox's Static Images API, which OpenFreeMap has no equivalent for. Add the [mapkick-static](https://github.com/ankane/mapkick-static) gem to your `Gemfile` and set `MAPBOX_ACCESS_TOKEN` to a valid [Mapbox](https://account.mapbox.com/auth/signup/) key.

The <Preview /> view always renders a static map, even when `static` is not enabled.
:::

## Options reference

See the [Location API](./location-api.html) for field-specific options and the [common field options](../field-options.html) for shared settings.
