import fs from 'fs'
import path from 'path'
import {
  capitalize, snakeCase, trim,
} from 'lodash'

export const humanize = (str) => capitalize(trim(snakeCase(str).replace(/_id$/, '').replace(/_/g, ' ')))

const getFiles = (directory, version) => {
  const dir = path.join(__dirname, '..', version, directory);
  let files = []

  const fls = fs.readdirSync(dir)
  fls.forEach(file => {
    files.push(file)
  });

  return files
    .filter(path => path !== 'index.md')
    .filter(path => path !== 'common')
    .filter(path => !path.includes('_common.md'))
    .map((path) => ({text: humanize(path.replace('.md', '')), link: `/${version}/${directory}/${path.replace('.md', '.html')}`}))
}

export {getFiles}
