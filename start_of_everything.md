# Avo

Lean teams use Avo to build exceptional internal tools while it handles the technical heavy lifting, so they can focus on what matters.

Avo offers a few big features to get that done:

- CRUD
- Dashboards
- Advanced filters
- Kanban boards
- Collaboration tools
- Audit logging

CRUD is probably the most important feature of Avo. It's how you create, read, update and delete records (manage records).

# Resources

The Avo CRUD functionality uses the concept of a resource. A resource belongs to a model and a model may have multiple resources.
The model is how Rails talks to the database and the resource is how Avo talks to Rails and knows how to fetch and manipulate the records.

Each resource is a ruby class in this configuration `Avo::Resources::RESOURCE_NAME` and inherits the `Avo::BaseResource` class which inherits `Avo::Resources::Base`. `Avo::BaseResource` is empty so the user can override anything they want on a global level in theyr own app.

A resource has a multitude of options which are usually declared using the `self.OPTION_NAME = ` format. They can take a simple value like a string, boolean, symbol, hash or array or they can take an `ExecutionContext` which will give the developer much more control over what they can return from it.