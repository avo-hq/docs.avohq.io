---
version: '2.0'
license: community
---

# Status

The `Status` field is used to visually display the status of a column (loading or failed), supporting the following options:

<img :src="('/assets/img/fields/status.jpg')" alt="Status field" class="border mb-4" />

```ruby
field :progress, as: :status, failed_when: ['closed', 'rejected', 'failed'], loading_when: ['loading', 'running', 'waiting', 'in progress']
```

You may customize the `failed` and `loading` states by using `failed_when` and `loading_when`. `failed_when` defaults to `failed`, while `loading_when` defaults to both `waiting` and `running`.