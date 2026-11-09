---
license: community
description: "Displays a heading separator to delimit sections of fields on a resource."
fieldTags: [layout]
outline: [2, 3]
api_docs: ./heading-api.html
---

# Heading

The `Heading` field separates groups of fields with a heading. It is for presentation only and does not need a database column.

```ruby
# app/avo/resources/user.rb
field :user_information, as: :heading
field :first_name, as: :text
field :last_name, as: :text
field :email, as: :text
```

By default, the heading uses the humanized field ID (`:user_information` becomes "User information") and displays it as uppercase plain text. It appears on show, edit, and new views, but not on index views. HTML rendering is off by default.

<Image src="/assets/img/4_0/fields/heading/index.webp" dark-src="/assets/img/4_0/fields/heading/index-dark.webp" width="1520" height="802" alt="An Avo show-view card with two heading fields acting as section dividers: a 'User information' heading above First name, Last name and Email fields, then a 'Contact details' heading above Birthday and Membership fields." prompt="show page with heading fields separating User information and Contact details sections" />

## Choose the heading text {#label}

Set [`label`](./heading-api.html#label) when the heading should differ from the humanized field ID. This keeps the heading visible on form views as well as the show view.

```ruby
# app/avo/resources/user.rb
field :some_id, as: :heading, label: "User information"
```

## Compute a heading for the show view

Use a block to compute the heading from the current record. The block's result takes precedence over `label`.

```ruby
# app/avo/resources/user.rb
field :user_information, as: :heading do
  "Contact details for #{record.first_name}"
end
```

:::warning Computed headings are hidden on forms
A heading declared with a block is not rendered on new or edit views, even if it also has a `label`. Use `label` without a block when the heading must appear on forms.
:::

## Render formatted content {#as_html}

<span id="as-html"></span>

Set [`as_html: true`](./heading-api.html#as_html) to format the heading with HTML. Use a label for formatted headings that also need to appear on forms.

```ruby
# app/avo/resources/user.rb
field :dev_heading, as: :heading,
  label: '<div class="underline uppercase font-bold">DEV</div>',
  as_html: true
```

For a show-only HTML heading, the computed syntax works too:

```ruby
# app/avo/resources/user.rb
field :dev_heading, as: :heading, as_html: true do
  '<div class="underline uppercase font-bold">DEV</div>'
end
```

For shared visibility, styling, and other field settings, see [Common field options](../field-options.html).
