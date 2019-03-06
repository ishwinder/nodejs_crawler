const request = require('request')

// Local
const Parser = require('./parser').Parser

class Crawl {
  constructor({ base_url, query }) {
    this.base_url = base_url
    this.query = query
    this.visited = new Map()
    this.visitQ = []
  }

  visitPages() {
    this.visitQ.forEach(function(page) {
      this.visitQ.pop(page)
      this.visitPage({ page })
    }, this)
  }

  visitPage({ page }) {
    this.visited.set(page, false)

    request(page, function(_error, response, body) {
      if (response.statusCode === 200) {
        const parser = new Parser({ url: page, base_url: this.base_url, body})

        if (parser.search(query)) {
          if (this.visited)
            this.visited.set(page, true)
        }
      }
    })
  }

  printStats() {
    let foundPages = []

    this.visited.forEach(function(v, k) {
      if (v) {
        foundPages.push(k)
      }
    })
    console.log(`Visited ${this.visited.size} pages`)
    console.log(`Found ${foundPages.length} pages with the text`)

    foundPages.forEach(function(p) {
      console.log(p)
    })
  }

  start() {
    request(this.base_url, (error, response, body) => {
      if (error) {
        throw new Error(`Couldn't fetch ${this.base_url}, please check your internet connection and try again`)
      }
      if(response.statusCode === 200) {
        const parser = new Parser({ url: this.base_url, base_url: this.base_url, body })
        const innerLinks = parser.getInternalLinks()

        innerLinks.forEach(function(link) {
          this.visitQ.push(link)
        }, this)

        this.visitPages()
        this.printStats()
      }
    })
  }
}

const base_url = process.argv.length === 4 ? process.argv[2] : null,
  query = process.argv.length === 4 ? process.argv[3] : null

if (base_url && query) {
  const c = new Crawl({ base_url, query })
  c.start()
}
else {
  console.log('Please input the url/query to parse')
}
