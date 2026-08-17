import type { Editor } from '@tiptap/react'
import { Icon } from '../ui/Icon'

interface EditorToolbarProps {
  editor: Editor
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 mb-4 border border-glass-stroke rounded-xl bg-surface-container-low glass-panel">
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleBold().run()
        }}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive('bold')
            ? 'bg-secondary-container text-on-secondary-container'
            : 'hover:bg-surface-container text-on-surface-variant'
        }`}
        aria-label="Bold"
      >
        <Icon name="format_bold" size="sm" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleItalic().run()
        }}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive('italic')
            ? 'bg-secondary-container text-on-secondary-container'
            : 'hover:bg-surface-container text-on-surface-variant'
        }`}
        aria-label="Italic"
      >
        <Icon name="format_italic" size="sm" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleStrike().run()
        }}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive('strike')
            ? 'bg-secondary-container text-on-secondary-container'
            : 'hover:bg-surface-container text-on-surface-variant'
        }`}
        aria-label="Strikethrough"
      >
        <Icon name="format_underlined" size="sm" />
      </button>

      <div className="w-px h-6 mx-1 bg-outline-variant/30" />

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }}
        className={`px-2 py-1 rounded-lg font-bold text-xs transition-colors ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-secondary-container text-on-secondary-container'
            : 'hover:bg-surface-container text-on-surface-variant'
        }`}
        aria-label="Heading 1"
      >
        H1
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }}
        className={`px-2 py-1 rounded-lg font-bold text-xs transition-colors ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-secondary-container text-on-secondary-container'
            : 'hover:bg-surface-container text-on-surface-variant'
        }`}
        aria-label="Heading 2"
      >
        H2
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }}
        className={`px-2 py-1 rounded-lg font-bold text-xs transition-colors ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-secondary-container text-on-secondary-container'
            : 'hover:bg-surface-container text-on-surface-variant'
        }`}
        aria-label="Heading 3"
      >
        H3
      </button>

      <div className="w-px h-6 mx-1 bg-outline-variant/30" />

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleBulletList().run()
        }}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive('bulletList')
            ? 'bg-secondary-container text-on-secondary-container'
            : 'hover:bg-surface-container text-on-surface-variant'
        }`}
        aria-label="Bullet List"
      >
        <Icon name="format_list_bulleted" size="sm" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleOrderedList().run()
        }}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive('orderedList')
            ? 'bg-secondary-container text-on-secondary-container'
            : 'hover:bg-surface-container text-on-surface-variant'
        }`}
        aria-label="Numbered List"
      >
        <Icon name="format_list_numbered" size="sm" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          setLink()
        }}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive('link')
            ? 'bg-secondary-container text-on-secondary-container'
            : 'hover:bg-surface-container text-on-surface-variant'
        }`}
        aria-label="Link"
      >
        <Icon name="link" size="sm" />
      </button>

      <div className="w-px h-6 mx-1 bg-outline-variant/30" />

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().undo().run()
        }}
        disabled={!editor.can().undo()}
        className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-40 transition-colors"
        aria-label="Undo"
      >
        <Icon name="undo" size="sm" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().redo().run()
        }}
        disabled={!editor.can().redo()}
        className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-40 transition-colors"
        aria-label="Redo"
      >
        <Icon name="redo" size="sm" />
      </button>
    </div>
  )
}
