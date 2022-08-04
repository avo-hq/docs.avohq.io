# Relations

[[toc]]

One of the most amazing things about Ruby on Rails is how easy it is to create relations ([Active Record associations](https://guides.rubyonrails.org/association_basics.html)) between models. We try to keep the same simple approach in Avo too.

At the moment, Avo supports four relation types.

## Belongs to

```ruby
belongs_to :user
```

When you add a `BelongsTo` relation to a model, you will see three different field types.

On the **Index** view, you'll see a column with the [`@title`](/0.x/resources.html#setting-the-title-of-the-resource) value of the associated model.

<img :src="$withBase('/assets/img/associations/belongs-to-index.jpg')" alt="Belongs to index" class="border" />

On the **Show** view, you'll see a link to the associated model.

<img :src="$withBase('/assets/img/associations/belongs-to-show.jpg')" alt="Belongs to show" class="border" />

On the **Edit** and **Create** views, you'll see a drop-down element with the available records. Here you may change the associated model.

<img :src="$withBase('/assets/img/associations/belongs-to-edit.jpg')" alt="Belongs to edit" class="border" />

## Has One

The `HasOne` relation works similarly to `BelongsTo`.

```ruby
has_one :admin
```

## Has Many

The `HasMany` field is visible only on the **Show** page. Below the regular fields panel, you will see a new panel with the model's associated records.

```ruby
has_many :projects
```

<img :src="$withBase('/assets/img/associations/has-many-table.jpg')" alt="Has many table" class="border" />

Here you may attach more records by clicking the "Attach" button.

<img :src="$withBase('/assets/img/associations/has-many-attach-modal.jpg')" alt="Has many attach" class="border" />

In a similar fashion, you may detach a model using the detach button.

<img :src="$withBase('/assets/img/associations/has-many-detach.jpg')" alt="Has many detach" class="border" />

## Has And Belongs To Many

The `HasAndBelongsToMany` relation works similarly to `HasMany`.

```ruby
has_and_belongs_to_many :users
```
