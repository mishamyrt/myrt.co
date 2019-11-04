const { readFile, writeFile } = require('fs').promises

const addZero = str => str.toString().length === 1 ? `0${str}` : str

const tagLinkBase = 'https://github.com/mishamyrt/myrt.co/releases/tag/v'

const getDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = addZero(date.getMonth())
  const day = addZero(date.getDate())
  return year + '-' + month + '-' + day
}

const addChangelogEntry = async () => {
  const changelogBytes = await readFile('CHANGELOG.md')
  let changelog = changelogBytes.toString()
  const heading = changelog.split('\n')[7]
  const version = heading.match(/\[(.*)\]\[\]/)[1]
  const tagUrlRe = new RegExp(`\\[${version.replace(/\./g, '\\.')}\\]: (.*)`, 'g')
  const tagLink = changelog.match(tagUrlRe)[0]

  changelog = changelog.replace(
    heading,
    heading.replace('Unreleased', getDate())
  )
  changelog = changelog.replace(
    tagLink,
    `${tagLink.split(' ')[0]} ${tagLinkBase}${version}`
  )
  await writeFile('CHANGELOG.md', changelog)
}

addChangelogEntry()
