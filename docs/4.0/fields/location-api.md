---
license: community
outline: [2, 3]
guide: ./location.html
prev:
  text: "Location"
  link: "./location.html"
next: false
---

# Location API

Per-option reference for the `Location` field. For setup and worked examples, see the [Location guide](./location.html).

Options are passed to the field declaration in your resource's `fields` method, for example in `app/avo/resources/city.rb`:

```ruby
field :coordinates, as: :location, stored_as: [:latitude, :longitude]
```

Shared settings are documented in [Common field options](../field-options.html).

## Coordinate storage

<Option name="`stored_as`">

The model attributes backing the coordinate pair, in latitude/longitude order. An array of exactly two entries enables separate edit inputs and reads and writes those two attributes instead of the field's own attribute.

```ruby
field :coordinates, as: :location, stored_as: [:latitude, :longitude]
```

- **Type:** `Array` of two attribute names (`Symbol` or `String`), or `nil`.
- **Default:** `nil`.
- **Validation:** No explicit argument validation. The separate-input behavior requires an array of exactly two entries; the model must provide readers and writers for both attributes.

:::warning Storage contract
With `nil`, the edit input accepts comma-separated text, which is split into an array on submission; map rendering reads elements `0` and `1` from the attribute value without splitting it. See [single-attribute storage](./location.html#use-a-single-coordinate-attribute).

Malformed `stored_as` values are not a supported fallback: other assignment paths iterate the configured value as attribute names.
:::

</Option>

## Map rendering

<Option name="`mapkick_options`">

A hash merged over the map defaults and forwarded to Mapkick. Its keys override Avo's defaults, including `zoom` and `style`.

```ruby
field :coordinates, as: :location, mapkick_options: {controls: false}
```

- **Type:** `Hash` with symbol keys.
- **Default:** `nil` (no overrides).
- **Values:** Options supported by [Mapkick](https://github.com/ankane/mapkick#options) or, for static maps, [mapkick-static](https://github.com/ankane/mapkick-static).
- **Validation:** Avo does not validate Mapkick option values; the options are merged and forwarded to the selected renderer.

The effective defaults depend on the renderer:

| Renderer | Defaults before merging |
| --- | --- |
| Interactive | `{id: "location-map", zoom: 15, controls: true, style: Avo::MapStyles.light}` |
| Static (including preview) | `{width: 300, height: 300}` |

The interactive `zoom` default becomes the field's [`zoom`](#zoom) value when provided. The light style follows [`config.map_view[:styles]`](../customization-api.html#styles); without that setting, it is `"https://tiles.openfreemap.org/styles/positron"`, or `"mapbox://styles/mapbox/light-v11"` when `MAPBOX_ACCESS_TOKEN` is present.

:::info Theme switching
Interactive maps automatically switch between the configured light and dark styles unless a nonblank `mapkick_options[:style]` is supplied. An explicit style is left unchanged in dark mode.
:::

</Option>

<Option name="`zoom`">

The initial zoom level used in the interactive map defaults. It does not affect static maps and is overridden by `mapkick_options[:zoom]`.

```ruby
field :coordinates, as: :location, zoom: 12
```

- **Type:** `Integer`, or a value responding to `to_i`.
- **Default:** `15` (when omitted or `nil`).
- **Values:** Zoom levels supported by the selected map style.
- **Validation:** Converted with `to_i`; no range validation is performed by Avo.

</Option>

<Option name="`static`">

Selects the static map renderer instead of the interactive renderer. The preview action always uses a static map regardless of this option.

```ruby
field :coordinates, as: :location, static: true
```

- **Type:** `Boolean`.
- **Default:** `nil` (interactive outside preview).

:::warning Static map requirements
Static maps require [mapkick-static](https://github.com/ankane/mapkick-static) and a valid `MAPBOX_ACCESS_TOKEN`. OpenFreeMap does not provide the Mapbox Static Images API used by this renderer.
:::

</Option>
