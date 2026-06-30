import mongoose from 'mongoose'
import engagementSchema from './engagementSchema.js'

const gameSchema = new mongoose.Schema(
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
    gameUrl: {
      type: String,
      required: true,
      trim: true,
    },
    loadingScreenUrl: {
      type: String,
      default: '',
      trim: true,
    },
    mode: {
      type: String,
      enum: ['portrait', 'landscape'],
      default: 'landscape',
    },
    aspectRatio: {
      type: String,
      default: '',
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    engagement: {
      type: engagementSchema,
      default: () => ({}),
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

const Game = mongoose.model('Game', gameSchema)

export default Game
