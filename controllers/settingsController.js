const DynamicSetting = require('../models/DynamicSetting');
const ModelDirectory = require('../models/ModelDirectory');

// --- Dynamic Settings ---

exports.getDynamicSettings = async (req, res) => {
  try {
    let settings = await DynamicSetting.findOne();
    if (!settings) {
      settings = await DynamicSetting.create({}); // Creates default
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dynamic settings', error: error.message });
  }
};

exports.updateDynamicSettings = async (req, res) => {
  try {
    const { orderSources, serviceTypes, roles } = req.body;
    let settings = await DynamicSetting.findOne();
    
    if (!settings) {
      settings = new DynamicSetting({ orderSources, serviceTypes, roles });
    } else {
      if (orderSources) settings.orderSources = orderSources;
      if (serviceTypes) settings.serviceTypes = serviceTypes;
      if (roles) settings.roles = roles;
    }
    
    await settings.save();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating dynamic settings', error: error.message });
  }
};

// --- Model Directory ---

exports.getModels = async (req, res) => {
  try {
    const { gender } = req.query;
    const filter = gender ? { gender } : {};
    const models = await ModelDirectory.find(filter);
    res.status(200).json(models);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching models', error: error.message });
  }
};

exports.createModel = async (req, res) => {
  try {
    const { name, gender } = req.body;
    const model = new ModelDirectory({ name, gender });
    await model.save();
    res.status(201).json(model);
  } catch (error) {
    res.status(500).json({ message: 'Error creating model', error: error.message });
  }
};

exports.deleteModel = async (req, res) => {
  try {
    const { id } = req.params;
    await ModelDirectory.findByIdAndDelete(id);
    res.status(200).json({ message: 'Model deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting model', error: error.message });
  }
};
