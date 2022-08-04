# Filters

[[toc]]

Filters allow you to better scope the index queries for records you are looking for.

## Defining filters

Avo has two types of filters available at the moment [Boolean filter](#boolean-filter) and [Select filter](#select-filter).

<img :src="$withBase('/assets/img/filters.jpg')" alt="Avo filters" style="width: 300px;" class="border mb-4" />

## Boolean Filter

You generate one running `bin/rails generate avo:filter featured_filter` creating a filter configuration file.

```ruby
module Avo
  module Filters
    class FeaturedFilter < BooleanFilter
      def name
        'Featured filter'
      end

      def apply(request, query, values)
        query
      end

      def options
        {}
      end
    end
  end
end
```

Each filter file comes with a `name`, `apply` and `options` methods.

The `name` method lets you set the name of the filter.

The `apply` method is responsible for filtering out the records by giving you access to modify the `query` object. The `apply` method also gives you access to the current `request` object, and the passed `values`. The `values` object is a `Hash` containing all the configured `options` with the option name as the key and `true`/`false` as the value.

```ruby
# Example values payload
{
  is_featured: true,
  is_unfeatured: false,
}
```

The `options` method defines the available values of your filter. They should return a `Hash` with the option id as a key and option label as value.

The finished filter might look something like this.

```ruby
module Avo
  module Filters
    class FeaturedFilter < BooleanFilter
      def name
        'Featured status'
      end

      def apply(request, query, values)
        return query if values[:is_featured] && values[:is_unfeatured]

        if values[:is_featured]
          query = query.where(is_featured: true)
        elsif values[:is_unfeatured]
          query = query.where(is_featured: false)
        end

        query
      end

      def options
        {
          'is_featured': 'Featured',
          'is_unfeatured': 'Unfeatured',
        }
      end
    end
  end
end
```

### Default value

You can set a default value to the filter so it has a predetermined state on load. To do that return the state you desire it from the `default` method.

```ruby{20-24}
module Avo
  module Filters
    class FeaturedFilter < BooleanFilter
      def name
        'Featured status'
      end

      def apply(request, query, values)
        return query if values[:is_featured] && values[:is_unfeatured]

        if values[:is_featured]
          query = query.where(is_featured: true)
        elsif values[:is_unfeatured]
          query = query.where(is_featured: false)
        end

        query
      end

      def default
        {
          is_featured: true
        }
      end

      def options
        {
          'is_featured': 'Featured',
          'is_unfeatured': 'Unfeatured',
        }
      end
    end
  end
end
```

## Select Filter

Select filters are similar to Boolean ones. You generate one running `rails generate avo:filter published_filter --select`.

The biggest difference from the **Boolean filter** is in the `apply` method. You only get back one `value` attribute, which represents which entry from the `options` method is selected.

A finished, select filter might look like this.

```ruby
module Avo
  module Filters
    class PublishedFilter < SelectFilter
      def name
        'Published status'
      end

      def apply(request, query, value)
        case value
        when 'published'
          query.where.not(published_at: nil)
        when 'unpublished'
          query.where(published_at: nil)
        else
          query
        end
      end

      def options
        {
          'published': 'Published',
          'unpublished': 'Unpublished',
        }
      end
    end
  end
end
```

### Default value

The select filter supports setting a default too.

```ruby{19-21}
module Avo
  module Filters
    class PublishedFilter < SelectFilter
      def name
        'Published status'
      end

      def apply(request, query, value)
        case value
        when 'published'
          query.where.not(published_at: nil)
        when 'unpublished'
          query.where(published_at: nil)
        else
          query
        end
      end

      def default
        'published'
      end

      def options
        {
          'published': 'Published',
          'unpublished': 'Unpublished',
        }
      end
    end
  end
end
```