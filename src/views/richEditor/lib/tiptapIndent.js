import { Extension } from '@tiptap/core'
import { TextSelection } from 'prosemirror-state'

export default Extension.create({
  name: 'indent',

  addCommands () {
    const applyIndent = direction => () => ({ chain, tr, state, dispatch, editor }) => {
      const selection = state.selection
      const doc = state.doc
      const from = selection.from
      const to = selection.to
      if (from && to && selection.$from.parent.type.name === 'codeBlock') {
        const position = { from, to }
        while (position.from > 0 && !/\n/.test(doc.textBetween(position.from - 1, position.from))) {
          position.from -= 1
        }
        while (position.to < doc.nodeSize && !/\n/.test(doc.textBetween(position.to, position.to + 1))) {
          position.to += 1
        }

        const selectionText = doc.textBetween(position.from, position.to).split('\n').map(line => {
          if (direction > 0) {
            return '  ' + line
          } else {
            return line.replace(/^( {2}|\t)/, '')
          }
        }).join('\n')

        /* *
        console.log('>>>', {
          state,
          selection,
          from,
          to,
          selectionText
        })
        /* */

        const newTr = state.tr.insertText(selectionText, position.from, position.to)
        const newFrom = newTr.doc.resolve(position.from)
        const newTo = newTr.doc.resolve(position.from + selectionText.length)
        const newSelection = new TextSelection(newFrom, newTo)
        dispatch(newTr.setSelection(newSelection))

        return true
      }
    }

    return {
      indent: applyIndent(1),
      outdent: applyIndent(-1)
    }
  },

  addKeyboardShortcuts () {
    return {
      Tab: () => {
        return this.editor.commands.indent()
      },
      'Shift-Tab': () => {
        return this.editor.commands.outdent()
      }
    }
  }
})
