const { getDriveClient, FOLDER_ID } = require('../config/googleDrive');
const { Readable } = require('stream');

class GoogleDriveService {
  /**
   * Upload a file buffer to Google Drive
   * @param {Buffer} fileBuffer - The file content as buffer
   * @param {string} fileName - Original file name
   * @param {string} mimeType - File MIME type
   * @returns {Object} { fileId, webViewLink, thumbnailLink }
   */
  async uploadFile(fileBuffer, fileName, mimeType) {
    const drive = getDriveClient();

    const fileMetadata = {
      name: fileName,
      parents: [FOLDER_ID],
    };

    // Convert buffer to readable stream
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    const media = {
      mimeType,
      body: bufferStream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink, thumbnailLink, mimeType',
      supportsAllDrives: true,
    });

    const fileId = response.data.id;

    // Make file publicly readable
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

    // Get updated file with sharing info
    const fileDetails = await drive.files.get({
      fileId,
      fields: 'id, name, webViewLink, webContentLink, thumbnailLink',
      supportsAllDrives: true,
    });

    return {
      fileId,
      webViewLink: fileDetails.data.webViewLink,
      webContentLink: fileDetails.data.webContentLink,
      thumbnailLink: fileDetails.data.thumbnailLink || '',
    };
  }

  /**
   * Delete a file from Google Drive
   * @param {string} fileId
   */
  async deleteFile(fileId) {
    const drive = getDriveClient();
    await drive.files.delete({ fileId });
  }

  /**
   * Get file metadata from Drive
   * @param {string} fileId
   */
  async getFileMetadata(fileId) {
    const drive = getDriveClient();
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, webViewLink, thumbnailLink, size, mimeType',
    });
    return response.data;
  }

  /**
   * Build embeddable preview URL for Google Drive video
   * @param {string} fileId
   */
  getPreviewUrl(fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  /**
   * Build direct thumbnail URL
   * @param {string} fileId
   */
  getThumbnailUrl(fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  }
}

module.exports = new GoogleDriveService();
