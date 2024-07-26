<Option name="`accept`">
Instructs the input to accept only a particular file type for that input using the `accept` option.

```ruby
field :cover_video, as: :file, accept: "image/*"
```

#### Default

`nil`

#### Possible values

`image/*`, `audio/*`, `doc/*`, or any other types from [the spec](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept).
</Option>

<Option name="`direct_upload`">
<LicenseReq license="pro" />

If you have large files and don't want to overload the server with uploads, you can use the `direct_upload` feature, which will upload the file directly to your cloud provider.

```ruby
field :cover_video, as: :file, direct_upload: true
```

<!-- @include: ./default_boolean_false.md -->
</Option>

<Option name="`display_filename`">
Option that specify if the file should have the caption present or not.

```ruby
field :cover_video, as: :file, display_filename: false
```

#### Default

`true`

#### Possible values

`true`, `false`
</Option>
