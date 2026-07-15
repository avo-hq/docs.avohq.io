<Option name="`description`">

Changes the text displayed under the association name.

<Image src="/assets/img/4_0/common/associations/description-option.webp" dark-src="/assets/img/4_0/common/associations/description-option-dark.webp" width="2140" height="790" alt="An Avo has_many association titled User feedback with its description — Comments left by this user across the app. — highlighted below the panel title, showing the full index table with search and pagination." />

#### Default

`nil`

#### Possible values

Any string or any zero arity lambda function.

Within lambda, you have access to `query` and all attributes of [`Avo::ExecutionContext`](../execution-context).

:::warning Evaluated on page load, even with `loading: :manual`
The `description` lambda is evaluated to render the association header — including the **placeholder** shown for a `loading: :manual` association. So a lambda that touches the database (e.g. `-> { "#{query.count} posts" }`) runs on every page load, *before* the user clicks **Load**. If you reached for `loading: :manual` to defer that query, keep the `description` cheap (or omit it) — only the framed content is fetched on demand.
:::
</Option>
