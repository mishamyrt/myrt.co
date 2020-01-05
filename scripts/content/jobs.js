const { readdir, readFile } = require('fs').promises
const { join } = require('path')
const marked = require('marked')
const { jobsDir } = require('../paths.js')
const { asyncMap, bytesToString, monthWord } = require('../helpers')

const technologiesRegexp = /^Technologies:(.*)/gm
const titleRegexp = /^# (.*)/gm
const datesRegexp = /^Dates: (.*) [-–—] (.*)/gm

const getJobsTemplates = () => readdir(jobsDir)

const getTemplatePath = template => join(jobsDir, template)

const readTemplate = async template =>
  bytesToString(await readFile(getTemplatePath(template)))

const splitTechnologies = line => line.split(',').map(tech => tech.trim())

const extractTechnologies = markdown =>
  splitTechnologies(technologiesRegexp.exec(markdown)[1])

const extractTitle = markdown => titleRegexp.exec(markdown)[1].trim()

const extractDates = markdown => {
  const match = datesRegexp.exec(markdown)
  return {
    from: match[1],
    to: match[2]
  }
}

const reverseDate = date => date.split('/').reverse().join('/')

const compareDates = (a, b) => reverseDate(a) > reverseDate(b)

const clearContent = markdown => markdown
  .replace(technologiesRegexp, '')
  .replace(titleRegexp, '')
  .replace(datesRegexp, '')
  .trim()

const processTemplate = async template => {
  const content = await readTemplate(template)
  return {
    content: marked(clearContent(content)),
    title: extractTitle(content),
    technologies: extractTechnologies(content),
    ...extractDates(content)
  }
}

const formatDate = (date) => {
  const dateParts = date.split('/')
  return [monthWord(dateParts[0]), dateParts[1]].join(' ')
}

const getJobs = async () => {
  const result = await asyncMap(await getJobsTemplates(), processTemplate)
  return result
    .sort((a, b) => compareDates(a.from, b.from) ? -1 : 1)
    .map(item => {
      item.from = formatDate(item.from)
      if (item.to !== 'Present') {
        item.to = formatDate(item.to)
      }
      return item
    })
}

module.exports = { getJobs }
