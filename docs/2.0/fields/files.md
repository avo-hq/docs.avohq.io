---
version: '2.0'
license: community
---

# Files

The `Files` field is similar to `File` and enables you to upload multiple files at once using [Active Storage](https://edgeguides.rubyonrails.org/active_storage_overview.html).

```ruby
field :documents, as: :files
```

## Direct upload support

If you have large files and you don't want to overload the server with uploads you can use the `direct_upload` feature which will upload the file directly to your cloud provider.

<!-- @todo: add links to avodemo page, avodemo source code, rails docs and demo video -->

```ruby
field :files, as: :files, direct_upload: true
```