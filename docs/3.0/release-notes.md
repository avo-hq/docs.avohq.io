# Avo 3.0 release notes

We brought up a few new things:

 - `panel`s can not receive `show_on: :index`. That will take all the fields inside that panel and display them on the index screen
 - you have access to the `main_panel`. This will hold the resource name, description, buttons and more.
 - `panel`s can now hold `tool`s.
 - `tool`s can be added inside `body` statements inside `panel` statements
 - `tool`s can come before fields using `main_panel`
 - `body`s can have the type of `:clear` to not wrap everything in a white container (aliased to `clear_body`)
 - `sidebar`s can have multiple panels by declaring multiple `sidebar` statements
