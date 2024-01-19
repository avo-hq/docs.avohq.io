# Conditionally render styled rows

We've had [a request](https://discord.com/channels/740892036978442260/1197693313520771113) come in from a customer to style their soft-deleted records differently than the regular ones.

Their first idea was to add a new option to Avo to enable that. They even tried to monkey-patch our code to achieve that.
It's a "fair" strategy, we're not judging.

Our impression was to add a new option too, but in the end we found a better solution. Something that doesn't involve monke-patching or us adding new code to the framework.
New code that we should maintain in the future and bring on more and more requests.

## Solution

The solution came to me a little while after the request came over, and it's so simple!

**Use the `has` CSS selector.**

#### 1. Attach a CSS class to the `id` field of the records you want to mark

```ruby
def fields
  field :id, as: :id, html: -> {
    index do
      wrapper do
        classes do
          # We'll mark every record that has an even id
          if record.id % 2 == 0
            "soft-deleted"
          end
        end
      end
    end
  }
end
```

#### 2. Target the row that has that child element and style it as you need it

```css
tr[data-component-name="avo/index/table_row_component"]:has(.soft-deleted){
  background: #fef2f2;
}

/* you may even target a specific resource by it's name */
tr[data-component-name="avo/index/table_row_component"][data-resource-name="course_links"]:has(.soft-deleted){
  background: #fef2f2;
}
```

Of course I chose a trivial rule like the records that have an even `id` column, but you can tweak that rule as you need it.

I think there's a lesson or two to be learned from this which I wrote about in [this article](https://avohq.io/blog/state-the-problem-not-the-solution).
