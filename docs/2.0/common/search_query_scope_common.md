## Search query scope

Avo applies the scope for parent record when the **search_query** is used on a **has_many** association, `if params[:via_association] == 'has_many' ...` can be used to configure the search when it's done on an association.

For example, if you want to show only the comments with attached photo when they are searched on a association you can do it like this:
```ruby
self.search_query = -> do
  if params[:via_association] == 'has_many'
    scope.ransack(id_eq: params[:q], m: "or").result(distinct: false).joins(:photo_attachment)
  else
    scope.ransack(id_eq: params[:q], m: "or").result(distinct: false)
  end
end
```