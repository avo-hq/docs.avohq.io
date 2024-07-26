<Option name="`use_resource`">
Sets a different resource to be used when displaying (or redirecting to) the association table.

#### Default

`nil`. When nothing is selected, Avo infers the resource type from the reflected association.

#### Possible values

`Avo::Resources::Post`, `Avo::Resources::PhotoComment`, or any Avo resource class.

The value can be the actual class or a string representation of that class.

```ruby
# the class
Avo::Resources::Post

# the stirng representation of the class
"Avo::Resources::Post"
```
</Option>
