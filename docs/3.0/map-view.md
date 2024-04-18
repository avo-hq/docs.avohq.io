---
feedbackId: 835
---

# Map view

Some resources that contain geospatial data can benefit from being displayed on a map. For
resources to be displayed to the map view they require a `coordinates` field, but that's customizable.

## Enable map view

To enable map view for a resource, you need to add the `map_view` class attribute to a resource. That will add the view switcher to the <Index /> view.

<img :src="('/assets/img/map-view.png')" alt="Avo view switcher" class="border mb-4" />

```ruby
class Avo::Resources::City < Avo::BaseResource
  # ...
  self.map_view = {
    mapkick_options: {
      controls: true
    },
    record_marker: -> {
      {
        latitude: record.coordinates.first,
        longitude: record.coordinates.last,
        tooltip: record.name
      }
    },
    table: {
      visible: true,
      layout: :right
    }
  }
end
```

:::warning
You need to add the `mapkick-rb` (not `mapkick`) gem to your `Gemfile` and have the `MAPBOX_ACCESS_TOKEN` environment variable with a valid [Mapbox](https://account.mapbox.com/auth/signup/) key.
:::

:::option `mapkick_options`
The options you pass here are forwarded to the [`mapkick` gem](https://github.com/ankane/mapkick).
:::

:::option `record_marker`
This block is being applied to all the records present in the current query to fetch the coordinates of off the record.

You may use this block to fetch the coordinates from other places (API calls, cache queries, etc.) rather than the database.

This block has to return a hash compatible with the [`PointMap` items](https://github.com/ankane/mapkick#point-map). Has to have `latitude` and `longitude` and optionally `tooltip`, `label`, or `color`.
:::

:::option `table`
This is the configuration for the adjacent table. You can set the visibility to `true` or `false`, and set the position of the table `:top`, `:right`, `:bottom`, or `:left`.
:::

## Make it the default view

To make the map view the default way of viewing a resource on <Index />, we have to use the `default_view_type` class attribute.

```ruby{7}
class Avo::Resources::City < Avo::BaseResource
  self.default_view_type = :map
end
```
