---
license: community
outline: [2, 3]
guide: ./hidden.html
prev:
  text: "Hidden"
  link: "./hidden.html"
next: false
---

# Hidden API

Reference for the `hidden` field declaration and behavior. For task-oriented examples, see the [Hidden guide](./hidden.html).

Declare the field inside a resource's `fields` method in `app/avo/resources/post.rb`:

```ruby
field :user_id, as: :hidden
```

## Declaration

The first argument identifies the record attribute, and `as: :hidden` selects the hidden input field. Hidden defines no field-specific options or validation rules. Shared options are documented in the [Field options API](../field-options-api.html), including [`default`](../field-options-api.html#default), [`visible`](../field-options-api.html#visible), and [`html`](../field-options-api.html#html).

## Visibility

By default, Hidden is restricted to the New and Edit forms. It does not render a visible label or control and is not displayed on Index or Show. The shared `visible` option can conditionally omit the input from a form.

## Values and defaults

The input uses the field's resolved value, normally the record attribute. The shared `default` option defaults to `nil`; a configured default fills a `nil` attribute on New/Create, but does not replace an existing value or fill an empty value on Edit. Default blocks run in `Avo::ExecutionContext`, with access to `current_user`, `record`, `resource`, `view`, and `parent`.

## Form submission

The field renders an HTML `<input type="hidden">` through the resource form builder, using the field ID as the attribute name and the resolved field value as the input value. The browser submits it with the form despite the absence of a visible control. The shared `html` option supplies input classes, data attributes, and inline styles.

:::warning Hidden values are client-controlled
Hidden inputs are not an authorization mechanism. Their values can be inspected and changed before submission. Server-side authorization and validation still apply.
:::
