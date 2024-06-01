import TurndownService from 'turndown'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '*',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined'
})

turndownService.addRule('strikethrough', {
  filter: ['s'],
  replacement: content => {
    return `~~${content}~~`
  }
})

turndownService.addRule('underline', {
  filter: ['u'],
  replacement: content => {
    return `··${content}··`
  }
})

turndownService.addRule('mark', {
  filter: ['mark'],
  replacement: content => {
    return `!!!${content}!!!`
  }
})

turndownService.addRule('paragraph', {
  filter: ['p'],
  replacement: (content, node) => {
    if (node.parentElement?.nodeName === 'LI') {
      return content
    }

    return `\n\n${content}\n\n`
  }
})

turndownService.addRule('listItem', {
  filter: node => {
    return node.nodeName === 'LI' && !node.hasAttribute('data-type')
  },
  replacement: function (content, node, options) {
    let listItemPrefix = `${options.bulletListMarker} `
    const parentNode = node.parentNode

    content = content
      .replace(/^\s*\n+/, '')
      .replace(/\s*\n+$/, '\n')
      .replace(/\s*\n/gm, '\n  ')

    if (parentNode?.nodeName === 'OL') {
      const start = parentNode?.getAttribute('start')
      const index = Array.prototype.indexOf.call(parentNode.children, node)
      listItemPrefix = `${start ? Number(start) + index : index + 1}. `
    }

    return `${listItemPrefix}${content}${
      node.nextSibling && !/\n$/.test(content) ? '\n' : ''
    }`
  }
})

turndownService.addRule('taskListItem', {
  filter: node => {
    return (
      node.nodeName === 'LI' && node.getAttribute('data-type') === 'taskItem'
    )
  },
  replacement: function (content, node, options) {
    let listItemPrefix = `${options.bulletListMarker} `
    const parentNode = node.parentNode

    content = content
      .replace(/^\s*\n+/, '')
      .replace(/\s*\n+$/, '')
      .replace(/\s*\n/gm, '\n  ')

    if (parentNode?.nodeName === 'UL') {
      const checked = node.getAttribute('data-checked')
      listItemPrefix = `${listItemPrefix}${checked === 'true' ? '[x]' : '[ ]'} `
    }

    return `${listItemPrefix}${content}${node.nextSibling && !/\n$/.test(content) ? '\n' : ''}`
  }
})

function htmlToMarkdown (html) {
  return turndownService.turndown(html)
}

export default htmlToMarkdown
