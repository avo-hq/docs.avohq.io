# Custom link field

When you want to add a custom link as a field on your resource that points to a related resource (and you don't want to use one of the available [association fields](associations)) you can use the [`Text`](fields#text) field like so.

```ruby
# with the format_using option
field :partner_home, as: :text, format_using: -> (url) { link_to(url, url, target: "_blank") } do |model, *args|
  avo.resources_partners_url model.partner.id
end

# with the as_html option
field :partner_home, as: :text, as_html: true do |model, *args|
  if model.partner.present?
    link_to model.partner.first_name, avo.resources_partners_url(model.partner.id)
  end
end
```
