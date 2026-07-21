<Option name="`name`">
Changes the text displayed as association name.

<Image src="/assets/img/4_0/associations/associations-custom-label.webp" dark-src="/assets/img/4_0/associations/associations-custom-label-dark.webp" width="2144" height="1122" alt="An Avo has_many association whose title — its custom name — is highlighted, showing the full index table with attach and create actions." />

#### Default value

Plural association name.

#### Possible values

Any string or any zero arity lambda function.

Within lambda, you have access to all attributes of [`Avo::ExecutionContext`](../execution-context.html).
</Option>
