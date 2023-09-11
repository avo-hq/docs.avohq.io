# Hide field labels

One common use case for the [`file`](./../fields/file), [`files`](./../fields/files), and [`external_image`](./../fields/external_image) fields is to display the logo for a record. You might want to do that but in a more "un-fieldy" way, so it doesn't look like a field with a label on top.

You can hide that label using CSS in your [custom asset pipeline](./../custom-asset-pipeline.html), or in a [`_footer` partial](./../eject-views#partial).

Avo is littered with great `data` selectors so you can pick and choose any element you'd like. If it doesn't have it, we'll add it.

Here's an example on how to remove the label on an `external_image` field for the `Team` resource (try it [here](https://main.avodemo.com/avo/resources/teams/4)).

```css
[data-resource-name="TeamResource"] [data-field-type="external_image"][data-field-id="logo"] [data-slot="label"]{
  display: none;
}
```
