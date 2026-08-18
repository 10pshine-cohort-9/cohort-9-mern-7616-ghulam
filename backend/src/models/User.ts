import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.passwordHash
        return ret
      },
    },
  },
)

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>

export const User = model('User', userSchema)
