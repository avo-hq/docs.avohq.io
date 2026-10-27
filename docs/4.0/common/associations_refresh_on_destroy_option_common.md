<Option name="`refresh_on_destroy`">

Reloads the whole page after a record is deleted from the association table. By default only the association table reloads, so fields on the parent record that depend on the associated records, like a counter or a total, keep showing the old value until the page is refreshed.

```ruby
field :reviews, as: :has_many, refresh_on_destroy: true
```

The page keeps its URL and the "Record destroyed" message still shows after the reload.

#### Default value

`false`

#### Possible values

`true`, `false`
</Option>
