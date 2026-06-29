const videoRepository = require('../repositories/videoRepository');
const googleDriveService = require('./googleDriveService');

class VideoService {
  async uploadVideo(data, file) {
    const { title, category, subcategory, tags, description, uploadedBy, userRole } = data;

    // Upload to Google Drive
    const driveResult = await googleDriveService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    const thumbnailUrl = driveResult.thumbnailLink || googleDriveService.getThumbnailUrl(driveResult.fileId);

    const parsedTags = typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : (Array.isArray(tags) ? tags : []);

    const video = await videoRepository.create({
      title,
      description: description || '',
      category,
      subcategory,
      tags: parsedTags,
      drive_file_id: driveResult.fileId,
      thumbnail_url: thumbnailUrl,
      status: userRole === 'admin' ? 'approved' : 'pending',
      uploadedBy
    });

    return video;
  }

  async getVideos(query = {}, userRole) {
    const { search, status, category, subcategory } = query;

    let filter = {};

    if (userRole === 'sales') {
      filter.status = 'approved';
    } else if (status) {
      filter.status = status;
    }

    if (category) filter.category = { $regex: category, $options: 'i' };
    if (subcategory) filter.subcategory = { $regex: subcategory, $options: 'i' };

    if (search) {
      const results = await videoRepository.search(search, filter);
      return results;
    }

    return await videoRepository.findAll(filter);
  }

  async getVideoById(videoId) {
    const video = await videoRepository.findById(videoId);
    if (!video) {
      const error = new Error('Video not found');
      error.statusCode = 404;
      throw error;
    }
    return video;
  }

  async updateVideo(videoId, updateData) {
    const video = await videoRepository.findById(videoId);
    if (!video) {
      const error = new Error('Video not found');
      error.statusCode = 404;
      throw error;
    }

    // Process tags if they are updated
    if (updateData.tags !== undefined) {
      updateData.tags = typeof updateData.tags === 'string'
        ? updateData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : (Array.isArray(updateData.tags) ? updateData.tags : []);
    }

    return await videoRepository.updateById(videoId, updateData);
  }

  async approveVideo(videoId, status, rejectionReason = '') {
    const video = await videoRepository.findById(videoId);
    if (!video) {
      const error = new Error('Video not found');
      error.statusCode = 404;
      throw error;
    }

    if (!['approved', 'rejected'].includes(status)) {
      const error = new Error('Invalid status. Use approved or rejected');
      error.statusCode = 400;
      throw error;
    }

    const updateData = { status };
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    return await videoRepository.updateById(videoId, updateData);
  }

  async deleteVideo(videoId) {
    const video = await videoRepository.findById(videoId);
    if (!video) {
      const error = new Error('Video not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete from Google Drive
    try {
      await googleDriveService.deleteFile(video.drive_file_id);
    } catch (err) {
      console.error('Drive delete error (continuing):', err.message);
    }

    return await videoRepository.deleteById(videoId);
  }

  async getVideosByUploader(userId) {
    return await videoRepository.findAll({ uploadedBy: userId });
  }

  async getStats() {
    const Video = require('../models/Video');
    const [total, pending, approved, rejected] = await Promise.all([
      Video.countDocuments(),
      Video.countDocuments({ status: 'pending' }),
      Video.countDocuments({ status: 'approved' }),
      Video.countDocuments({ status: 'rejected' })
    ]);
    return { total, pending, approved, rejected };
  }
}

module.exports = new VideoService();
