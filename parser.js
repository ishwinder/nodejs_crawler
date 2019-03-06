const cheerio = require('cheerio')
const URLParse = require('url-parse')

class Parser {
  constructor({ url, base_url, body }) {
    this.url = url
    this.base_url = base_url
    this.body = body
    this.$ = cheerio.load(this.body)
  }

  search (query) {
    const body = this.$('html > body').text()

    if (body.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
      return true
    }

    return false
  }

  getInternalLinks () {
    if (!this.body)
      throw new Error('Unitalised Parser')

    const linkParser = this.$("a[href^='/']"),
      parent = this,
      innerLinks = []

      linkParser.each(function() {
        const link = parent.base_url + parent.$(this).attr('href')

        if (link != parent.url)
          innerLinks.push(link)
      })

    return innerLinks
  }
}

module.exports = { Parser }
