---
# license:
betaStatus: Alpha 🧪 (experimental)
outline: [2,3]
---

# Avo::Meta

## Overview

`Avo::Meta` equips your [Avo](https://github.com/avo-hq/avo/) application with the ability to add arbitrary _"meta"_ attributes to your resources in a no-code manner.

Under the hood, it leverages a JSON database column and [StoreModel](https://github.com/DmitryTsepelev/store_model) to manage it.

## Installation
Add this line to your application's Gemfile:

```ruby
gem "avo-meta", source: "https://packager.dev/avo-hq/"
```

And then execute:
```bash
$ bundle
```

Additionally, you have to mount the engine, e.g.:

```
mount Avo::Meta::Engine, at: "#{Avo.configuration.root_path}/avo_meta/"
```


To use `Avo::Meta`, an additional database table containing the _schemas_ for each resource has to be created. For this, simply install the necessary migrations:

```bash
$ bin/rails avo_meta:install:migrations
$ bin/rails db:migrate
```

## Usage

### Preparation

First, add a `meta` JSON column to your model:

```sh
$ bin/rails g migration AddMetaToUsers meta:json
$ bin/rails db:migrate
```

After that, simply include the `Avo::Metaable` module in said model:

```rb
class User < ApplicationRecord
  include Avo::Metaable
end
```

This will create two things under the hood:

- a _"Meta Properties"_ resource available in the sidebar. Here, you can add new meta properties for each associated resource by adding a name and a type. Under the hood, it modifies the `avo_meta_schemas` database table created via the migrations.

> [!NOTE]
> If the `meta` JSON column is missing on your model, a reminder to add it will be emitted.

- a `meta` class attribute for the associated Avo resource (in the example above, the `User` resource). This class attribute contains the schema definition (essentially a hash containing `name`, `type`, `as`, and other attributes) of the meta entries stored with the model. This will result in a "Meta" panel in your resource `New/Show/Edit` views where you can edit the defined attributes.

To display the meta panel in your resource view to modify these attributes, simply add `meta_panel` to your `def fields` definition:

```rb
class Avo::Resources::User < Avo::BaseResource
  # ...

  def fields
    # ...

    meta_panel
  end
end
```


### Accessing Meta Attributes

To use the meta attributes in your application, simply access them like you would access a `has_one` association:

`@user.meta.shoe_size`
