# Helpers
Avo offers access to your application's helpers in various scenarios. You have the opportunity to leverage your application's helper methods within the context of resources, fields, as well as within every block and lambda function. If you encounter any situations where helpers are not accessible, kindly let us know so we can address them.

## How to use it
To make use of your application's helpers, employ the syntax `helpers.method_name`.

## How do it works?
The `helpers` method stems from a concern. Upon invocation, it initializes an anonymous class that inherits all the helpers located within your application's `app/helpers` directory. This anonymous class is cached for each request, ensuring efficiency. Our approach of encapsulating the helpers within an anonymous class mitigates conflicts between your helper methods and our internal methods.
