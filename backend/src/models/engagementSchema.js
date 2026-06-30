import mongoose from 'mongoose'

const userRefSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false },
)

const reactionSchema = new mongoose.Schema(
  {
    ...userRefSchema.obj,
    type: {
      type: String,
      default: 'like',
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
)

const commentSchema = new mongoose.Schema(
  {
    commentId: {
      type: String,
      required: true,
      trim: true,
    },
    ...userRefSchema.obj,
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
)

const engagementSchema = new mongoose.Schema(
  {
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    savesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
    savedBy: {
      type: [userRefSchema],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  { _id: false },
)

export default engagementSchema
