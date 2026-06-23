const demoService = require('../services/demoService');
const responseHandler = require('../utils/responseHandler');

class DemoController {
  async create(req, res, next) {
    try {
      const { videoIds, expiryDate } = req.body;
      const demoLink = await demoService.createDemoLink(videoIds, req.user._id, expiryDate);
      responseHandler(res, 201, 'Demo link created successfully', demoLink);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const demoLink = await demoService.getDemoLink(id);
      responseHandler(res, 200, 'Demo link fetched successfully', demoLink);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const demoLinks = await demoService.getAllDemoLinks();
      responseHandler(res, 200, 'All demo links retrieved', demoLinks);
    } catch (error) {
      next(error);
    }
  }

  async getMyLinks(req, res, next) {
    try {
      const demoLinks = await demoService.getDemoLinksByUser(req.user._id);
      responseHandler(res, 200, 'Your demo links retrieved', demoLinks);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await demoService.deleteDemoLink(req.params.id);
      responseHandler(res, 200, 'Demo link deleted', null);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DemoController();
