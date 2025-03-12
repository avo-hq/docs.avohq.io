# Meta Properties

Suppose your application has non-developer end users (unthinkable, right?) who want to seamlessly add new properties to a model in a no-code fashion.

The `Avo::Meta` plugin allows just that, and more: It also manages the names and types of these properties (the "meta schema") and does all that without downtime. No database migrations to run, no redeploys, no service disruptions.

Under the hood, it leverages a JSON database column and [StoreModel](https://github.com/DmitryTsepelev/store_model) to manage it.

## Installation

Add the `avo-meta` gem to your bundle:

```ruby
bundle add "avo-meta"
```

To use `Avo::Meta`, an additional database table containing the _schemas_ for each resource has to be created. For this, simply install the necessary migrations:

```bash
$ bin/rails avo_meta:install:migrations
$ bin/rails db:migrate
```

## Usage

First, add a `meta` JSON column to your model:

```sh
$ bin/rails g migration AddMetaToUsers meta:json
$ bin/rails db:migrate
```

After that, simply include the `Avo::Metaable` module in said model:

```rb{2}
class User < ApplicationRecord
  include Avo::Metaable
end
```

This will create two things under the hood:

1. a _"Meta Properties"_ resource available in the sidebar. Here, you can add new meta properties for each associated resource by adding a name and a type. Under the hood, it modifies the `avo_meta_schemas` database table created via the migrations.

This is what this would look like:

<Image src="/assets/img/meta/modify-meta-schema.png" width="1440" height="760" alt="Edit the meta schema of a resource" />

> [!NOTE]
> If the `meta` JSON column is missing on your model, a reminder to add it will be emitted.

2. a `meta_panel` to be used in your resource `New/Show/Edit` views where you can edit the defined attributes.

To it, simply add `meta_panel` to your `def fields` definition:

```rb{7}
class Avo::Resources::User < Avo::BaseResource
  # ...
  
  def fields
    # ...
    
    meta_panel
  end
end
```

<Image src="/assets/img/meta/edit-meta-properties.png" width="1183" height="368" alt="Edit meta properties of a record" />

## Accessing Meta Properties

To use the meta attributes in your application, simply access them like you would access a `has_one` association:

`@user.meta.shoe_size`
