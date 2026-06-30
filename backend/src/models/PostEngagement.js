import mongoose from 'mongoose'

const postEngagementSchema = new mongoose.Schema(
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
    liked: {
      type: Boolean,
      default: false,
    },
    saved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

postEngagementSchema.index({ postId: 1, userId: 1 }, { unique: true })
postEngagementSchema.index({ postId: 1, liked: 1 })
postEngagementSchema.index({ postId: 1, saved: 1 })

const PostEngagement = mongoose.model('PostEngagement', postEngagementSchema)

export default PostEngagement
