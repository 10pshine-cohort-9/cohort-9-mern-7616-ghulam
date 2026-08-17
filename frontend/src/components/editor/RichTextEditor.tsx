import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { EditorToolbar } from './EditorToolbar'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  readOnly?: boolean
}

export function RichTextEditor({ value, onChange, readOnly = false }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose-aether min-h-[50vh] focus:outline-none focus:ring-0 p-4 rounded-xl',
        'aria-label': 'Note content',
      },
    },
  })

  if (!editor) return null

  return (
    <div className="w-full flex flex-col">
      {!readOnly && <EditorToolbar editor={editor} />}
      <div className="bg-surface-container-lowest border border-glass-stroke rounded-2xl p-2 ambient-shadow">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
