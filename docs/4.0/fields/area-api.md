---
license: community
outline: [2, 3]
guide: ./area.html
prev:
  text: "Area"
  link: "./area.html"
next: false
---

# Area API

Per-option reference for the `area` field. For setup and worked examples, see the [Area guide](./area.html).

Options are passed to the field declaration in an Avo resource's `fields` method:

```ruby
field :city_center_area, as: :area, geometry: :polygon
```

For labels, visibility, placeholders, and other shared settings, see [Common field options](../field-options.html).

## Geometry selection

<Option name="`geometry`">

Sets the GeoJSON geometry type for the stored coordinates. Avo converts the value to a string and classifies it, so `:multi_polygon` becomes `"MultiPolygon"`.

```ruby
field :city_center_area, as: :area, geometry: :multi_polygon
```

| Value | Behavior |
| --- | --- |
| `:polygon` | Produces a `Polygon`; coordinates are an array of linear rings, with the exterior ring first and any holes after it. |
| `:multi_polygon` | Produces a `MultiPolygon`; coordinates are an array of polygon coordinate arrays. |

- **Type:** `Symbol` or `String`.
- **Default:** `:polygon`; blank values also fall back to this default.
- **Values:** `:polygon` and `:multi_polygon`, or their string equivalents.
- **Validation:** Avo does not validate the geometry type or coordinate structure.

</Option>

## Map rendering

<Option name="`mapkick_options`">

Options forwarded as keyword arguments to Mapkick's `area_map` helper. Avo merges these over `{style: Avo::MapStyles.light}`, so a supplied `style` overrides the resolved light style.

```ruby
field :city_center_area, as: :area, mapkick_options: {controls: true}
```

- **Type:** `Hash` with symbol keys.
- **Default:** `{}` before merging with Avo's default style.
- **Values:** Options supported by [Mapkick](https://github.com/ankane/mapkick#options).
- **Validation:** No Avo validation of Mapkick options; nonblank values must support Hash merging.

The resolved styles come from [`config.map_view`](../customization-api.html#styles). With no global override, Avo uses OpenFreeMap's `"https://tiles.openfreemap.org/styles/positron"` in light mode and `"https://tiles.openfreemap.org/styles/dark"` in dark mode. When `MAPBOX_ACCESS_TOKEN` is present, those defaults become `"mapbox://styles/mapbox/light-v11"` and `"mapbox://styles/mapbox/dark-v11"`.

:::info
A nonblank `style` opts this map out of automatic light/dark style switching. Without a custom style, Avo follows the configured color scheme using the resolved style pair.
:::

</Option>

<Option name="`datapoint_options`">

Options merged into the area's data point after Avo constructs its `geometry`. These can supply a label, tooltip, or color.

```ruby
field :city_center_area, as: :area, datapoint_options: {label: "Paris City Center", color: "#009099"}
```

- **Type:** `Hash` with symbol keys.
- **Default:** `{}`.
- **Values:** Data point options supported by [Mapkick area maps](https://github.com/ankane/mapkick#area-map), including `label`, `tooltip`, and `color`.
- **Validation:** No Avo validation of data point options; nonblank values must support Hash merging.

:::warning
The merge is shallow. A `geometry` key in `datapoint_options` replaces the generated geometry entirely.
:::

</Option>
