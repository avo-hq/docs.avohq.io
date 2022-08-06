:::option `accept`
You can tell the browser to accept only a certain type of files for that input using the `accept` option.

```ruby
field :cover_video, as: :file, accept: "image/*"
```

#### Default

`nil`

#### Possible values

`image/*`, `audio/*`, `doc/*`, or any other types from [the spec](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept).
:::

:::option `direct_upload`
<LicenseReq license="pro" />

If you have large files and you don't want to overload the server with uploads you can use the `direct_upload` feature which will upload the file directly to your cloud provider.

```ruby
field :cover_video, as: :file, direct_upload: true
```

<!-- @include: ./common/default_boolean_false.md -->
:::