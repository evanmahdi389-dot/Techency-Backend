const demoRepository = require('../repositories/demoRepository');
const videoRepository = require('../repositories/videoRepository');

class DemoService {
  async createDemoLink(videoIds, createdBy, expiryDate = null) {
    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      const error = new Error('videoIds must be a non-empty array');
      error.statusCode = 400;
      throw error;
    }

    const videos = await videoRepository.findAll({ _id: { $in: videoIds }, status: 'approved' });

    if (videos.length === 0) {
      const error = new Error('No approved videos found with the given IDs');
      error.statusCode = 404;
      throw error;
    }

    const demoLink = await demoRepository.create({
      videoIds,
      createdBy,
      expiryDate: expiryDate || null
    });

    return demoLink;
  }

  async getDemoLink(linkId) {
    const demoLink = await demoRepository.findByLinkId(linkId);
    if (!demoLink) {
      const error = new Error('Demo link not found');
      error.statusCode = 404;
      throw error;
    }

    // Check expiry
    if (demoLink.expiryDate && new Date() > new Date(demoLink.expiryDate)) {
      const error = new Error('This demo link has expired');
      error.statusCode = 410;
      throw error;
    }

    return demoLink;
  }

  async getAllDemoLinks() {
    return await demoRepository.findAll();
  }

  async getDemoLinksByUser(userId) {
    return await demoRepository.findByUser(userId);
  }

  async deleteDemoLink(id) {
    return await demoRepository.deleteById(id);
  }
}

module.exports = new DemoService();
