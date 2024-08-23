# View Performance Monitoring

## Logging ViewComponent Loading Times and Memory Allocations

Sometimes, you may want to track the loading times and memory allocations of ViewComponents, similar to how you do with partials. Follow these two steps to enable this functionality.

### 1. Enable ViewComponent Instrumentation

First, you need to enable instrumentation for ViewComponents. Add the following configuration to your `application.rb` or `development.rb` file:

```ruby
# application.rb or development.rb
config.view_component.instrumentation_enabled = true
```

2. Add Logging

Next, set up logging to capture the performance data. Create or update the config/initializers/view_component.rb file with the following code:

```ruby
# config/initializers/view_component.rb
module ViewComponent
  class LogSubscriber < ActiveSupport::LogSubscriber
    define_method :'!render' do |event|
      info do
        message = +"  Rendered #{event.payload[:name]}"
        message << " (Duration: #{event.duration.round(1)}ms"
        message << " | Allocations: #{event.allocations})"
      end
    end
  end
end

ViewComponent::LogSubscriber.attach_to :view_component
```

<Image src="/assets/img/3_0/performance/views-performance/view-component-logs.png" size="2236x 462" alt="View Component logging" />

:::warning
Enabling this logging can negatively impact your application’s performance. We recommend using it in the development environment or disabling it in production once you have completed debugging.
:::
