const DemoLink = require('../models/DemoLink');

class DemoRepository {
  async create(data) {
    return await DemoLink.create(data);
  }

  async findByLinkId(linkId) {
    return await DemoLink.findOne({ linkId })
      .populate({
        path: 'videoIds',
        populate: { path: 'uploadedBy', select: 'name email' }
      })
      .populate('createdBy', 'name email role');
  }

  async findAll() {
    return await DemoLink.find()
      .populate('videoIds', 'title category thumbnail_url')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  async findByUser(userId) {
    return await DemoLink.find({ createdBy: userId })
      .populate('videoIds', 'title category thumbnail_url')
      .sort({ createdAt: -1 });
  }

  async deleteById(id) {
    return await DemoLink.findByIdAndDelete(id);
  }
}

module.exports = new DemoRepository();
