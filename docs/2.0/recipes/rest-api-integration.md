# REST API integration

Recipe [contributed](https://github.com/avo-hq/avo/issues/656) by [santhanakarthikeyan](https://github.com/santhanakarthikeyan).

I've built a page using AVO + REST API without using the ActiveRecord model. I was able to build an index page + associated has_many index page. It would be great if we could offer this as a feature, I guess, Avo would be the only admin framework that can offer this feature in case we take it forward :+1:

I've made it work along with Pagination, Filter and even search are easily doable.

`app/avo/filters/grace_period.rb`
```ruby
class GracePeriod < Avo::Filters::BooleanFilter
  self.name = 'Grace period'

  def apply(_request, query, value)
    query.where(value)
  end

  def options
    {
      grace_period: 'Within graceperiod'
    }
  end
end

```

`app/avo/resources/aging_order_resource.rb`
```ruby
class AgingOrderResource < Avo::BaseResource
  self.title = :id
  self.includes = []

  field :id, as: :text
  field :folio_number, as: :text
  field :order_submitted_at, as: :date_time, timezone: 'Chennai', format: '%B %d, %Y %H:%M %Z'
  field :amc_name, as: :text
  field :scheme, as: :text
  field :primary_investor_id, as: :text
  field :order_type, as: :text
  field :systematic, as: :boolean
  field :order_reference, as: :text
  field :amount, as: :text
  field :units, as: :text
  field :age, as: :text

  filter GracePeriod
end
```

`app/controllers/avo/aging_orders_controller.rb`
```ruby
module Avo
  class AgingOrdersController < Avo::ResourcesController
    def pagy_get_items(collection, _pagy)
      collection.all.items
    end

    def pagy_get_vars(collection, vars)
      collection.where(page: page, size: per_page)

      vars[:count] = collection.all.count
      vars[:page] = params[:page]
      vars
    end

    private

    def per_page
      params[:per_page] || Avo.configuration.per_page
    end

    def page
      params[:page]
    end
  end
end
```

`app/models/aging_order.rb`
```ruby
class AgingOrder
  include ActiveModel::Model
  include ActiveModel::Conversion
  include ActiveModel::Validations
  extend ActiveModel::Naming

  attr_accessor :id, :investment_date, :folio_number, :order_submitted_at,
                :amc_name, :scheme, :primary_investor_id, :order_type, :systematic,
                :order_reference, :amount, :units, :age

  class << self
    def column_names
      %i[id investment_date folio_number order_submitted_at amc_name
         scheme primary_investor_id order_type systematic
         order_reference amount units age]
    end

    def base_class
      AgingOrder
    end

    def root_key
      'data'
    end

    def count_key
      'total_elements'
    end

    def all(query)
      response = HTTParty.get(ENV['AGING_URL'], query: query)
      JSON.parse(response.body)
    end
  end

  def persisted?
    id.present?
  end
end
```

`app/models/lazy_loader.rb`
```ruby
class LazyLoader
  def initialize(klass)
    @offset, @limit = nil
    @params = {}
    @items = []
    @count = 0
    @klass = klass
  end

  def where(query)
    @params = @params.merge(query)
    self
  end

  def items
    all
    @items
  end

  def count(_attr = nil)
    all
    @count
  end

  def offset(value)
    @offset = value
    self
  end

  def limit(value)
    @limit = value
    items[@offset, @limit]
  end

  def all
    api_response
    self
  end

  private

  def api_response
    @api_response ||= begin
      json = @klass.all(@params)
      json.fetch(@klass.root_key, []).map do |obj|
        @items << @klass.new(obj)
      end
      @count = json.fetch(@klass.count_key, @items.size)
    end
  end
end
```

`app/policies/aging_order_policy.rb`
```ruby
class AgingOrderPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      LazyLoader.new(scope)
    end
  end

  def index?
    user.admin?
  end

  def show?
    false
  end
end
```

`config/initializers/array.rb`
```ruby
class Array
  def limit(upto)
    take(upto)
  end
end
```

