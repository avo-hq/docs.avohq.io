## Search query scope

<VersionReq version="2.13" />

If the resource used for the `has_many` association has the `search_query` block configured, Avo will use that to scope out the search query to that association.

For example, if you have a `Team` model that `has_many` `User`s, now you'll be able to search through that team's users instead of all of them.

You can target that search using `params[:via_association]`. When the value of `params[:via_association]` is `has_many`, the search has been mad inside a has_many association.

For example, if you want to show the records in a different order, you can do this:

```ruby
self.search_query = -> do
  if params[:via_association] == 'has_many'
    query.ransack(id_eq: params[:q], m: "or").result(distinct: false).order(name: :asc)
  else
    query.ransack(id_eq: params[:q], m: "or").result(distinct: false)
  end
end
```
