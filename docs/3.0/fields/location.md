---
version: '2.30'
license: community
betaStatus: Open beta
---

# Location

The `Location` field is used to display a point on a map.

```ruby
field :coordinates, as: :location
```

<Image src="/assets/img/fields/location-field.png" width="2564" height="1730" alt="Location field" />

:::warning
You need to add the `mapkick-rb` (not `mapkick`) gem to your `Gemfile` and have the `MAPBOX_ACCESS_TOKEN` environment variable with a valid [Mapbox](https://account.mapbox.com/auth/signup/) key.
:::

## Description

By default, the location field is attached to one database column that has the coordinates in plain text with a comma `,` joining them (`latitude,longitude`).
Ex: `44.427946,26.102451`

Avo will take that value, split it by the comma and use the first element as the `latitude` and the second one as the `longitude`.

On the <Show /> view you'll get in interactive map and on the edit you'll get one field where you can edit the coordinates.

## Options

<Option name="`stored_as`">

It's customary to have the coordinates in two distinct database columns, one named `latitude` and another `longitude`.

You can instruct Avo to use those two with the `stored_as` option

#### Default value

`nil`

#### Possible values

`nil`, or `[:latitude, :longitude]`.

```ruby
field :coordinates, as: :location, stored_as: [:latitude, :longitude]
```

By using this notation, Avo will grab the `latitude` and `longitude` from those particular columns to compose the map.

This will also render the <Edit /> view with two separate fields to edit the coordinates.

<Image src="/assets/img/fields/location-edit.png" width="2564" height="532" alt="Location field" />
</Option>
