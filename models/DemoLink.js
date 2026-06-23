const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const demoLinkSchema = new mongoose.Schema(
  {
    linkId: {
      type: String,
      unique: true,
      default: () => uuidv4()
    },
    videoIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiryDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DemoLink', demoLinkSchema);
