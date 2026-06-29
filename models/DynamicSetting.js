const mongoose = require('mongoose');

const dynamicSettingSchema = new mongoose.Schema({
  orderSources: {
    type: [String],
    default: ['In Office', 'WhatsApp', 'Messenger', 'Phone Call']
  },
  serviceTypes: {
    type: [String],
    default: ['Indoor', 'Outdoor']
  },
  roles: {
    type: [String],
    default: ['admin', 'project manager', 'editor', 'sales executive', 'model', 'script writer']
  }
}, { timestamps: true });

module.exports = mongoose.model('DynamicSetting', dynamicSettingSchema);
