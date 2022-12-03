# Manage information-heavy resources

This has been sent in by our friends at [Wyndy.com](https://wyndy.com). I'm just going to paste David's message because it says it all.

David 👇

Hey y'all - we've got a very information heavy app where there are pretty distinct differences between the data we display on index, show, & form views as well as how it's ordered.

We created a concern for our resources to make organizing this a bit easier, would love y'all's thoughts/feedback as to whether this could be a valuable feature! Example gist: [https://gist.github.com/davidlormor/d1d7e32a3568f6a9b3540669e7f601dc](https://gist.github.com/davidlormor/d1d7e32a3568f6a9b3540669e7f601dc)

We went with a concern because I ran into inheritance issues trying to create a `BaseResource` class (issues with Avo's `model_class` expectations) and monkey-patching `Avo::BaseResource` seemed to cause issues with Rails' autoloading/zeitwork?

```ruby
class ExampleResource < Avo::BaseResource
  include ResourceExtensions

  field :id, as: :id
  field :name, as: :text

  index do
    field :some_field, as: :text
    field :some_index_field, as: :text, sortable: true
  end

  show do
    field :some_show_field, as: :markdown
    field :some_field, as: :text
  end

  create do
    field :some_create_field, as: :number
  end

  edit do
    field :some_create_field, as: :number, readonly: true
    field :some_field
    field :some_editable_field, as: :text
  end
end
```

```ruby
require "active_support/concern"

module ResourceExtensions
  extend ActiveSupport::Concern

  class_methods do
    def index(&block)
      with_options only_on: :index, &block
    end

    def show(&block)
      with_options only_on: :show, &block
    end

    def create(&block)
      with_options only_on: :new, &block
    end

    def edit(&block)
      with_options only_on: :edit, &block
    end
  end
end
```
