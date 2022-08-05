---
version: '2.0'
license: community
---

# Heading

<img :src="('/assets/img/fields/heading.jpg')" alt="Heading field" class="border mb-4" />

The `Heading` field is used to display a banner between fields, such as a separator for big lists or a header for different sections.

`Heading` is not assigned to any column in the database and only visible on **Edit** and **Create** views.

```ruby
heading 'Address fields'
```

The `as_html` option will render it as HTML.

```ruby
heading '<div class="underline text-gray-800 uppercase">Address fields</,div>', as_html: true
```