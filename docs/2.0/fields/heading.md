---
version: '1.0'
license: community
---

# Heading

```ruby
heading "User information"
```

<img :src="('/assets/img/fields/heading.png')" alt="Heading field" class="border mb-4" />

The `Heading` field displays a header that acts as a separation layer between different sections.

`Heading` is not assigned to any column in the database and is only visible on the `Show`, `Edit` and `Create` views.

## Options

<Option name="`as_html`">
The `as_html` option will render it as HTML.

```ruby
heading '<div class="underline text-gray-800 uppercase">Address fields</,div>', as_html: true
```

<!-- @include: ./../common/default_boolean_false.md -->
</Option>

