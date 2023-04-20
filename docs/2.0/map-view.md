# Map view

<br />

Some resources that contain geospatial data can benefit from being displayed on a map. For
resources that have a `Location` field named `coordinates` the map view offers this capability.

## Enable map view

To enable map view for a resource, you need to add configuration to the `map` class attribtue. That will add the view switcher to the **Index** view.

```ruby
class CityResource < Avo::BaseResource
  # ...
  self.map = {
    mapkick_options: {
      controls: true
    },
    record_marker: ->(record:) {
      latitude: record.coordinates.first,
      longitude: record.coordinates.last,
      tooltip: record.name
    },
    table: {
      visible: true,
      layout: :right
    }
  }
end
```

<img :src="('/assets/img/view-switcher.jpg')" alt="Avo view switcher" class="border mb-4" />

Most of the options line up with the options accepted by the [mapkick gem](https://github.com/ankane/mapkick**.

The `table` config controls whether and where to render a table of resources along with the map.

The `record_marker` config option contains a proc that accepts a record param and returns a Hash representing a map marker for that record. If not provided, the default marker handles lat/long only. See the mapkick gem for more marker options.

## Make default view

To make the map the default way of viewing a resource **Index**, we have to use the `default_view_type` class attribute.

```ruby{7}
class CityResource < Avo::BaseResource
  self.default_view_type = :map
end
```
