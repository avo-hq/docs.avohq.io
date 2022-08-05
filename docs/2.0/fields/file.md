---
version: '2.0'
license: community
---

# File

The `File` field may be used to attach files using [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html). Avo will use your application's Active Storage settings. You may use whichever supported [disk services](https://edgeguides.rubyonrails.org/active_storage_overview.html#disk-service).

```ruby
field :avatar, as: :file, is_image: true
```

## Display the file as image

The `is_image` option renders the file as an image instead of rendering the file name.

## Display the file as an audio file

The `is_audio` option renders an audio player that allows you to play the file.

## Display the file as an video file

The `is_video` option renders an video player that allows you to play the file.

## Direct upload support

If you have large files and you don't want to overload the server with uploads you can use the `direct_upload` feature which will upload the file directly to your cloud provider.

<!-- @todo: add links to avodemo page, avodemo source code, rails docs and demo video -->

```ruby
field :cover_video, as: :file, direct_upload: true
```

## Accept option

You can instruct the browser to accept only a certain type of files in the field input using the `accept` option.

```ruby
field :cover_video, as: :file, accept: "image/*"
```

## Authorization

<div class="rounded-md bg-blue-50 p-4">
  <div class="flex">
    <div class="flex-shrink-0">
      <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
    </div>
    <div class="ml-3 flex-1 md:flex md:justify-between">
      <div class="text-sm leading-5 text-blue-700">
         Please make sure you have the <code>upload_attachments?</code>, <code>delete_attachments?</code> and <code>download_attachments?</code> methods set on your model's <strong>pundit</strong> policy. Otherwise the input and download/delete button will not be shown.
      </div>
    </div>
  </div>
</div>
