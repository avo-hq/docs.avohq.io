<table>
<thead>
<tr>
<th>Option</th>
<th>Description</th>
<th>Default</th>
<th>Possible Values</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>title</code></td>
<td>The title of the result</td>
<td>Resource title</td>
<td>Any string</td>
</tr>
<tr>
<td><code>description</code></td>
<td>The description of the result</td>
<td><code>nil</code></td>
<td>Any string</td>
</tr>
<tr>
<td><code>image_url</code></td>
<td>The URL of the image to display in the result</td>
<td><code>nil</code></td>
<td>Any valid URL</td>
</tr>
<tr>
<td><code>image_format</code></td>
<td>The format of the image to display in the result</td>
<td><code>:circle</code></td>
<td><code>:square</code>, <code>:rounded</code>, <code>:circle</code></td>
</tr>
<tr v-if="$frontmatter.search_item_path">
<td><code>path</code></td>
<td>The path to navigate to when clicking the result</td>
<td>Record show page</td>
<td>Any valid path</td>
</tr>
</tbody>
</table>
