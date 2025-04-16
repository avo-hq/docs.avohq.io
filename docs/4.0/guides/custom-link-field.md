# Custom link field

When you want to add a custom link as a field on your resource that points to a related resource (and you don't want to use one of the available [association fields](../index.md)) you can use the [`Text`](../fields/text) field like so.

```ruby
# with the format_using option
field :partner_home, as: :text, format_using: -> { link_to(value, value, target: "_blank") } do
  avo.resources_partner_url record.partner.id
end

# with the as_html option
field :partner_home, as: :text, as_html: true do
  if record.partner.present?
    link_to record.partner.first_name, avo.resources_partner_url(record.partner.id)
  end
end
```
