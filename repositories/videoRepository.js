const Video = require('../models/Video');

class VideoRepository {
  async create(data) {
    return await Video.create(data);
  }

  async findAll(filter = {}, options = {}) {
    const query = Video.find(filter)
      .populate('uploadedBy', 'name email role')
      .sort(options.sort || { createdAt: -1 });

    if (options.skip) query.skip(options.skip);
    if (options.limit) query.limit(options.limit);

    return await query;
  }

  async findById(id) {
    return await Video.findById(id).populate('uploadedBy', 'name email role');
  }

  async updateById(id, updateData) {
    return await Video.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteById(id) {
    return await Video.findByIdAndDelete(id);
  }

  async search(searchTerm, additionalFilter = {}) {
    const searchFilter = {
      ...additionalFilter,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { subcategory: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    return await Video.find(searchFilter)
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });
  }
}

module.exports = new VideoRepository();
