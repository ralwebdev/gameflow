import mongoose from 'mongoose'

const assetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    modelUrl: {
      type: String,
      required: true,
      trim: true,
    },
    background: {
      type: String,
      default: '#101820',
      trim: true,
    },
    mode: {
      type: String,
      enum: ['portrait', 'landscape'],
      default: 'landscape',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const Asset = mongoose.model('Asset', assetSchema)

export default Asset
