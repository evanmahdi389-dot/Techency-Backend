// const videoService = require('../services/videoService');
// const responseHandler = require('../utils/responseHandler');

// class VideoController {
//   async upload(req, res, next) {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ success: false, message: 'No video file provided' });
//       }
//       const video = await videoService.uploadVideo(
//         { ...req.body, uploadedBy: req.user._id, userRole: req.user.role },
//         req.file
//       );
//       const message = req.user.role === 'admin' 
//         ? 'Video uploaded and approved successfully.' 
//         : 'Video uploaded successfully. Pending admin approval.';
//       responseHandler(res, 201, message, video);
//     } catch (error) {
//       next(error);
//     }
//   }

//   async getAll(req, res, next) {
//     try {
//       const videos = await videoService.getVideos(req.query, req.user.role);
//       responseHandler(res, 200, 'Videos retrieved successfully', videos);
//     } catch (error) {
//       next(error);
//     }
//   }

//   async getById(req, res, next) {
//     try {
//       const video = await videoService.getVideoById(req.params.id);
//       responseHandler(res, 200, 'Video retrieved successfully', video);
//     } catch (error) {
//       next(error);
//     }
//   }

//   async approve(req, res, next) {
//     try {
//       const { status, rejectionReason } = req.body;
//       const video = await videoService.approveVideo(req.params.id, status, rejectionReason);
//       responseHandler(res, 200, `Video ${status} successfully`, video);
//     } catch (error) {
//       next(error);
//     }
//   }

//   async delete(req, res, next) {
//     try {
//       await videoService.deleteVideo(req.params.id);
//       responseHandler(res, 200, 'Video deleted successfully', null);
//     } catch (error) {
//       next(error);
//     }
//   }

//   async myUploads(req, res, next) {
//     try {
//       const videos = await videoService.getVideosByUploader(req.user._id);
//       responseHandler(res, 200, 'Your uploads retrieved', videos);
//     } catch (error) {
//       next(error);
//     }
//   }

//   async getStats(req, res, next) {
//     try {
//       const stats = await videoService.getStats();
//       responseHandler(res, 200, 'Video stats retrieved', stats);
//     } catch (error) {
//       next(error);
//     }
//   }

//   async streamVideo(req, res, next) {
//     try {
//       const { driveFileId } = req.params;
//       const { getDriveClient } = require('../config/googleDrive');
//       const drive = getDriveClient();

//       // CORS headers so any origin can stream
//       res.setHeader('Access-Control-Allow-Origin', '*');
//       res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
//       res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
//       res.setHeader('Accept-Ranges', 'bytes');

//       if (req.method === 'OPTIONS') {
//         return res.sendStatus(204);
//       }

//       const driveHeaders = {};
//       if (req.headers.range) {
//         driveHeaders.Range = req.headers.range;
//       }

//       const response = await drive.files.get(
//         { fileId: driveFileId, alt: 'media', acknowledgeAbuse: true },
//         { responseType: 'stream', headers: driveHeaders }
//       );

//       // Use the status code from Google Drive (206 if partial, 200 if full)
//       res.status(response.status);

//       if (response.headers['content-range']) {
//         res.setHeader('Content-Range', response.headers['content-range']);
//       }
//       if (response.headers['content-length']) {
//         res.setHeader('Content-Length', response.headers['content-length']);
//       }
//       res.setHeader('Content-Type', response.headers['content-type'] || 'video/mp4');

//       response.data.pipe(res);
//     } catch (error) {
//       console.error('Stream video error:', error.message);
//       next(error);
//     }
//   }
// }

// module.exports = new VideoController();



const videoService = require('../services/videoService');
const responseHandler = require('../utils/responseHandler');

class VideoController {
  async upload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No video file provided' });
      }
      const video = await videoService.uploadVideo(
        { ...req.body, uploadedBy: req.user._id, userRole: req.user.role },
        req.file
      );
      const message = req.user.role === 'admin'
        ? 'Video uploaded and approved successfully.'
        : 'Video uploaded successfully. Pending admin approval.';
      responseHandler(res, 201, message, video);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const videos = await videoService.getVideos(req.query, req.user.role);
      responseHandler(res, 200, 'Videos retrieved successfully', videos);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const video = await videoService.getVideoById(req.params.id);
      responseHandler(res, 200, 'Videos retrieved successfully', video);
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const { status, rejectionReason } = req.body;
      const video = await videoService.approveVideo(req.params.id, status, rejectionReason);
      responseHandler(res, 200, `Video ${status} successfully`, video);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await videoService.deleteVideo(req.params.id);
      responseHandler(res, 200, 'Video deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }

  async myUploads(req, res, next) {
    try {
      const videos = await videoService.getVideosByUploader(req.user._id);
      responseHandler(res, 200, 'Your uploads retrieved', videos);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await videoService.getStats();
      responseHandler(res, 200, 'Video stats retrieved', stats);
    } catch (error) {
      next(error);
    }
  }

  // আপডেট করা ভিডিও স্ট্রিম মেথড (HTTP 206 Partial Content সহ)
  async streamVideo(req, res, next) {
    try {
      const { driveFileId } = req.params;
      const { getDriveClient } = require('../config/googleDrive');
      const drive = getDriveClient();

      // ১. CORS এবং স্ট্রিমিং বেসিক হেডার সেট করা
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
      res.setHeader('Accept-Ranges', 'bytes');

      if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
      }

      // ২. গুগল ড্রাইভ থেকে ফাইলের মোট সাইজ ও টাইপ জেনে নেওয়া (রেঞ্জ ক্যালকুলেশনের জন্য)
      const fileMetadata = await drive.files.get({
        fileId: driveFileId,
        fields: 'size, mimeType',
      });

      const fileSize = parseInt(fileMetadata.data.size);
      const mimeType = fileMetadata.data.mimeType || 'video/mp4';
      const range = req.headers.range;

      // ৩. যদি ব্রাউজার পারশিয়াল ভিডিও চাঙ্ক (Range) রিকোয়েস্ট পাঠায়
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Content-Length': chunksize,
          'Content-Type': mimeType,
        });

        const response = await drive.files.get(
          { fileId: driveFileId, alt: 'media', acknowledgeAbuse: true },
          {
            headers: { Range: `bytes=${start}-${end}` },
            responseType: 'stream'
          }
        );

        response.data.pipe(res);
      } else {
        // ৪. যদি কোনো রেঞ্জ রিকোয়েস্ট না থাকে (পুরো ফাইল স্ট্রিম)
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': mimeType,
        });

        const response = await drive.files.get(
          { fileId: driveFileId, alt: 'media', acknowledgeAbuse: true },
          { responseType: 'stream' }
        );

        response.data.pipe(res);
      }
    } catch (error) {
      console.error('Stream video error:', error.message);
      if (!res.headersSent) {
        next(error);
      }
    }
  }
}

module.exports = new VideoController();
