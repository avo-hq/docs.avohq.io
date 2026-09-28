<Option name="`accept`">

Instructs the input to accept only a particular file type for that input using the `accept` option.

```ruby
field :cover_video, as: :file, accept: "image/*"
```

#### Default value

`nil`

#### Possible values

`image/*`, `audio/*`, `doc/*`, or any other types from [the spec](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept).
</Option>

<Option name="`direct_upload`">

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

#### Default value

`true`

#### Possible values

`true`, `false`
</Option>

<Option name="`lightbox`">

On the <Show /> view, clicking an image opens it in an in-page lightbox. The lightbox previews the image, cycles through the field's other images with the arrow buttons or the <kbd>←</kbd> and <kbd>→</kbd> keys, closes with <kbd>Esc</kbd> or a click outside the image, and links to the original file in a new tab. Non-image files keep their download link.

Set `lightbox: false` to render the image on its own.

```ruby
field :cover, as: :file, lightbox: false
```

#### Default value

`true`

#### Possible values

`true`, `false`
</Option>
