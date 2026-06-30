import mongoose from 'mongoose'

const postCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PostComment',
      default: null,
      index: true,
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
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

postCommentSchema.index({ postId: 1, createdAt: -1 })
postCommentSchema.index({ postId: 1, parentCommentId: 1, createdAt: 1 })

const PostComment = mongoose.model('PostComment', postCommentSchema)

export default PostComment
