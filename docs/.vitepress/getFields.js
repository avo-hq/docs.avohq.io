import fs from 'fs'
import path from 'path'
import {
  capitalize, snakeCase, trim,
} from 'lodash'

export const humanize = (str) => capitalize(trim(snakeCase(str).replace(/_id$/, '').replace(/_/g, ' ')))

const dir = path.join(__dirname, '..', '2.0', 'fields');
let files = []

const fls = fs.readdirSync(dir)
fls.forEach(file => {
  files.push(file)
});

files = files
  .filter(path => path !== 'index.md')
  .filter(path => !path.includes('_common.md'))
  .map((path) => ({text: humanize(path.replace('.md', '')), link: `/2.0/fields/${path}`}))

export default files