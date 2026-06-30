const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clientInfo: {
    name: { type: String, required: true },
    businessName: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    orderSource: { type: String, required: true } // From DynamicSettings
  },
  productCourierTracking: {
    deliveryMode: { type: String }, // e.g., 'Courier', 'In-Person'
    courierName: { type: String },
    trackingId: { type: String },
    status: {
      type: String,
      enum: ['On the Way', 'Received', 'Not Sent Yet'],
      default: 'Not Sent Yet'
    }
  },
  serviceDetails: {
    serviceType: { type: String, required: true }, // e.g., 'Indoor', 'Outdoor'
    location: { type: String }, // Conditional for outdoor
    dates: {
      expectedShootDate: { type: Date },
      expectedDeliveryDate: { type: Date }
    }
  },
  modelCasting: {
    totalContent: { type: Number, default: 0 },
    numberOfProductImages: { type: Number, default: 0 },
    numberOfContent: { type: Number, default: 0 }, // For video editing
    clientVideoLink: { type: String }, // For video editing
    numberOfModels: { type: Number, default: 0 },
    modelTypes: [{ type: String }], // e.g., ['Male', 'Female']
    modelIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    modelContents: {
      type: Map,
      of: Number // modelId -> number of content
    }
  },
  billing: {
    total: { type: Number, required: true },
    paid: { type: Number, default: 0 },
    due: { type: Number, required: true },
    method: { type: String },
    bankName: { type: String },
    transactionId: { type: String },
    notes: { type: String }
  },
  productionStates: {
    pmAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    writerAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scriptData: {
      text: { type: String },
      fileUrl: { type: String }
    },
    shootTracking: {
      totalVideos: { type: Number, default: 0 },
      shotCompleted: { type: Number, default: 0 },
      remaining: { type: Number, default: 0 }
    },
    editorAssignment: {
      editorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      draftVideoUrl: { type: String },
      correctionNotes: [{
        note: { type: String },
        date: { type: Date, default: Date.now }
      }]
    }
  },
  status: {
    type: String,
    enum: [
      'Pay Now',
      'Pending',
      'Admin Order Approved',
      'PM Order Approved',
      'Pending PM Review',
      'In Scripting',
      'Script Submitted',
      'Ready for Shoot',
      'In Editing',
      'Review Pending',
      'Revision in Progress',
      'Awaiting Final Payment',
      'Completed'
    ],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
