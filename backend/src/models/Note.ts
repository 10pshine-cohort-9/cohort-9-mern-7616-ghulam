import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

export const NOTE_STATUSES = ['active', 'archived', 'trashed'] as const

export type NoteStatus = (typeof NOTE_STATUSES)[number]

const noteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: '' },
    contentText: { type: String, default: '', select: false },
    status: { type: String, enum: NOTE_STATUSES, default: 'active' },
    isPinned: { type: Boolean, default: false },
    isFavourite: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.contentText
        return ret
      },
    },
  },
)

noteSchema.index({ userId: 1, status: 1, isPinned: -1, updatedAt: -1 })

export type NoteDocument = HydratedDocument<InferSchemaType<typeof noteSchema>>

export const Note = model('Note', noteSchema)
