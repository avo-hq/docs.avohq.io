---
license: community
description: "Renders a checkbox on form views and a green check or red X icon on the Index and Show views."
fieldTags: [boolean]
---

# Boolean

The `Boolean` field renders a `input[type="checkbox"]` on **Form** views and a nice green `check` icon/red `X` icon on the **Show** and **Index** views.

```ruby
field :is_published,
  as: :boolean,
  name: 'Published',
  true_value: 'yes',
  false_value: 'no'
```

<Image src="/assets/img/4_0/fields/boolean.webp" dark-src="/assets/img/4_0/fields/boolean-dark.webp" width="1520" height="382" alt="An Avo index table with ID, Name and Published columns — a green check and a red X in the Published column." prompt="Boolean field shown as a green check and a red X on the Index view" />

## Options

<Option name="`true_value`">

An extra value that should count as true, on top of the ones Avo always recognizes. Use it when your column stores something like `"yes"` or `1`.

#### Default value

`true`

#### Possible values

Any value (string, symbol, integer, etc.). The field always treats `"true"`, `"1"`, and the configured `true_value` as true.

```ruby
field :is_published, as: :boolean, true_value: "yes"
```
</Option>
<Option name="`false_value`">

An extra value that should count as false, on top of the ones Avo always recognizes. Use it when your column stores something like `"no"` or `0`.

#### Default value

`false`

#### Possible values

Any value (string, symbol, integer, etc.). The field always treats `"false"`, `"0"`, and the configured `false_value` as false.

```ruby
field :is_published, as: :boolean, false_value: "no"
```
</Option>

<Option name="`nil_as_indeterminate`">

When `true`, `nil` values render as a gray minus-circle icon on **Show** and **Index** views instead of the default dash. This keeps the `nil` value intact while making it more visible.

<Image src="/assets/img/4_0/fields/boolean_nil_as_indeterminate.webp" dark-src="/assets/img/4_0/fields/boolean_nil_as_indeterminate-dark.webp" width="1800" height="156" alt="Boolean field with nil_as_indeterminate showing a gray minus-circle icon" prompt="Boolean field with nil_as_indeterminate showing a gray minus-circle icon" />

#### Default value

`false`

#### Possible values

`true` or `false`

```ruby
field :is_published, as: :boolean, nil_as_indeterminate: true
```
</Option>

<Option name="`as_toggle`">

Render the field as a toggle on the form views.

#### Default value

`false`

#### Possible values

`true` or `false`

```ruby
field :is_published, as: :boolean, as_toggle: true
```
</Option>
