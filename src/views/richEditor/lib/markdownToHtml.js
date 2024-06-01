import DOMPurify from 'dompurify'
import { marked } from 'marked'

marked.use({
  gfm: true,
  extensions: [{
    name: 'underline',
    level: 'inline',
    start (src) {
      const start = src.match(/··[^··\n]/)?.index
      return start
    },
    tokenizer (src, tokens) {
      const rule = /^··([^··\n]+)··/
      const match = rule.exec(src)
      if (match) {
        const token = {
          type: 'underline',
          raw: match[0],
          text: this.lexer.inlineTokens(match[1].trim()),
          tokens: []
        }
        return token
      }
    },
    renderer (token) {
      return `<u>${this.parser.parseInline(token.text)}</u>`
    }
  }, {
    name: 'strike',
    level: 'inline',
    start (src) {
      const start = src.match(/~~[^~~\n]/)?.index
      return start
    },
    tokenizer (src, tokens) {
      const rule = /^~~([^~~\n]+)~~/
      const match = rule.exec(src)
      if (match) {
        const token = {
          type: 'strike',
          raw: match[0],
          text: this.lexer.inlineTokens(match[1].trim()),
          tokens: []
        }
        return token
      }
    },
    renderer (token) {
      return `<s>${this.parser.parseInline(token.text)}</s>`
    }
  }, {
    name: 'mark',
    level: 'inline',
    start (src) {
      const start = src.match(/!!![^!!!\n]/)?.index
      return start
    },
    tokenizer (src, tokens) {
      const rule = /^!!!([^!!!\n]+)!!!/
      const match = rule.exec(src)
      if (match) {
        const token = {
          type: 'mark',
          raw: match[0],
          text: this.lexer.inlineTokens(match[1].trim()),
          tokens: []
        }
        return token
      }
    },
    renderer (token) {
      return `<mark>${this.parser.parseInline(token.text)}</mark>`
    }
  }, {
    name: 'tasklist',
    level: 'block',
    start (src) {
      const start = src.match(/\* \[( |x)\] /)?.index
      return start
    },
    tokenizer (src, tokens) {
      const rule = /^(?:\* \[( |x)\] ([^\n]*)(?:\n|$))+/
      const match = rule.exec(src)
      if (match) {
        const token = {
          type: 'tasklist',
          raw: match[0],
          text: match[0].trim(),
          tokens: []
        }
        this.lexer.inline(token.text, token.tokens)
        return token
      }
    },
    renderer (token) {
      return `<ul data-type="taskList">${this.parser.parseInline(token.tokens)}\n</ul>\n`
    }
  }, {
    name: 'tasklistitem',
    level: 'inline',
    childTokens: ['item'],
    start (src) {
      const start = src.match(/^\* \[( |x)\] /)?.index
      return start
    },
    tokenizer (src, tokens) {
      const rule = /^(?:\* \[( |x)\] ([^\n]*)(?:\n|$))/
      const match = rule.exec(src)
      if (match) {
        return {
          type: 'tasklistitem',
          raw: match[0],
          checked: !!match[1].trim(),
          item: this.lexer.inlineTokens(match[2].trim())
        }
      }
    },
    renderer (token) {
      return `\n<li data-checked="${token.checked.toString()}" data-type="taskItem"><p>${this.parser.parseInline(token.item)}</p></li>`
    }
  }],

  walkTokens (token) {
    if (token.type === 'strong') {
      token.tokens = this.Lexer.lexInline(token.text)
    }
  }
})

function markdownToHtml (markdown) {
  return DOMPurify.sanitize(marked.parse(markdown), {
    USE_PROFILES: {
      html: true
    }
  })
}

export default markdownToHtml
