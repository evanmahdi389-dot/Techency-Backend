const express = require('express');
const router = express.Router();
const multer = require('multer');
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Store videos on disk temporarily for streaming to Drive
const videoUpload = multer({
  dest: uploadDir,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Store images in memory for Cloudinary
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// GET /api/videos/stats (admin only)
router.get('/stats', authMiddleware, roleMiddleware(['admin']), videoController.getStats);

// GET /api/videos/my-uploads
router.get('/my-uploads', authMiddleware, roleMiddleware(['editor', 'admin', 'project manager']), videoController.myUploads);

// GET /api/videos/stream/:driveFileId (public - no auth needed, for client demo page)
router.get('/stream/:driveFileId', videoController.streamVideo);

// POST /api/videos/upload-thumbnail
router.post(
  '/upload-thumbnail',
  authMiddleware,
  roleMiddleware(['admin', 'editor', 'project manager']),
  imageUpload.single('thumbnail'),
  videoController.uploadThumbnail
);

// POST /api/videos/upload-video
router.post(
  '/upload-video',
  authMiddleware,
  roleMiddleware(['admin', 'editor', 'project manager']),
  videoUpload.single('video'),
  videoController.uploadVideo
);

// POST /api/videos/save
router.post(
  '/save',
  authMiddleware,
  roleMiddleware(['admin', 'editor', 'project manager']),
  videoController.saveVideo
);

// GET /api/videos (all authenticated users)
router.get('/', authMiddleware, videoController.getAll);

// GET /api/videos/:id
router.get('/:id', authMiddleware, videoController.getById);

// PUT /api/videos/:id
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'project manager']), videoController.update);

// PUT /api/videos/:id/approve (admin only)
router.put('/:id/approve', authMiddleware, roleMiddleware(['admin']), videoController.approve);

// DELETE /api/videos/:id
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'project manager']), videoController.delete);

module.exports = router;
