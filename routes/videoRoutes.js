const express = require('express');
const router = express.Router();
const multer = require('multer');
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Store files in memory buffer (we stream to Google Drive)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// GET /api/videos/stats (admin only)
router.get('/stats', authMiddleware, roleMiddleware(['admin']), videoController.getStats);

// GET /api/videos/my-uploads (editor)
router.get('/my-uploads', authMiddleware, roleMiddleware(['editor', 'admin']), videoController.myUploads);

// GET /api/videos/stream/:driveFileId (public - no auth needed, for client demo page)
router.get('/stream/:driveFileId', videoController.streamVideo);

// POST /api/videos/upload (editor + admin)
router.post(
  '/upload',
  authMiddleware,
  roleMiddleware(['admin', 'editor']),
  upload.single('video'),
  videoController.upload
);

// GET /api/videos (all authenticated users)
router.get('/', authMiddleware, videoController.getAll);

// GET /api/videos/:id
router.get('/:id', authMiddleware, videoController.getById);

// PUT /api/videos/:id/approve (admin only)
router.put('/:id/approve', authMiddleware, roleMiddleware(['admin']), videoController.approve);

// DELETE /api/videos/:id (admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), videoController.delete);

module.exports = router;
