const fs = require('fs')
const { promisify } = require('util')

module.exports = {
  readDir: promisify(fs.readdir),
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  unlink: promisify(fs.unlink)
}
