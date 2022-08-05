import fs from 'fs'
import path from 'path'

const dir = path.join(__dirname, '..', '2.0', 'fields');
const files = []

const fls = fs.readdirSync(dir)
fls.forEach(file => {
  files.push(file)
});

export default files