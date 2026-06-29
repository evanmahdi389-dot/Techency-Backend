const Order = require('../models/Order');

// 1. Sales Post
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Set courier status based on order source
    if (orderData.clientInfo && orderData.clientInfo.orderSource === 'In Office') {
      if (!orderData.productCourierTracking) orderData.productCourierTracking = {};
      orderData.productCourierTracking.status = 'Received';
    } else {
      if (!orderData.productCourierTracking) orderData.productCourierTracking = {};
      if (!orderData.productCourierTracking.status) {
        orderData.productCourierTracking.status = 'Not Sent Yet';
      }
    }

    const newOrder = new Order(orderData);
    await newOrder.save();
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// 2. PM Route (/approve-order)
exports.approveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { writerId } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'In Scripting';
    if (writerId) order.productionStates.writerAssigned = writerId;

    await order.save();
    res.status(200).json({ message: 'Order approved for scripting', order });
  } catch (error) {
    res.status(500).json({ message: 'Error approving order', error: error.message });
  }
};

// 3. Script Writer Route (/submit-script)
exports.submitScript = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, fileUrl } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.productionStates.scriptData = { text, fileUrl };
    order.status = 'Script Submitted';

    await order.save();
    res.status(200).json({ message: 'Script submitted successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting script', error: error.message });
  }
};

// 4. Client Script Approval Route (/approve-script)
exports.approveScript = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'Ready for Shoot';
    await order.save();
    res.status(200).json({ message: 'Script approved, ready for shoot', order });
  } catch (error) {
    res.status(500).json({ message: 'Error approving script', error: error.message });
  }
};

// 5. Shoot Counter Route (/update-shoot)
exports.updateShoot = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalVideos, shotCompleted, remaining, editorId } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (totalVideos !== undefined) order.productionStates.shootTracking.totalVideos = totalVideos;
    if (shotCompleted !== undefined) order.productionStates.shootTracking.shotCompleted = shotCompleted;
    if (remaining !== undefined) order.productionStates.shootTracking.remaining = remaining;

    if (remaining === 0 && editorId) {
      order.productionStates.editorAssignment.editorId = editorId;
      order.status = 'In Editing';
    }

    await order.save();
    res.status(200).json({ message: 'Shoot tracking updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shoot tracking', error: error.message });
  }
};

// 6. Editor Route (/submit-draft)
exports.submitDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { draftVideoUrl } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.productionStates.editorAssignment.draftVideoUrl = draftVideoUrl;
    order.status = 'Review Pending';

    await order.save();
    res.status(200).json({ message: 'Draft submitted successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting draft', error: error.message });
  }
};

// 7. Correction/Approval Toggle Route (/process-review)
exports.processReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, correctionNote } = req.body; // action: 'approve' or 'reject'
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (action === 'reject') {
      order.status = 'Revision in Progress';
      if (correctionNote) {
        order.productionStates.editorAssignment.correctionNotes.push({ note: correctionNote });
      }
    } else if (action === 'approve') {
      order.status = 'Awaiting Final Payment';
    }

    await order.save();
    res.status(200).json({ message: `Review processed: ${action}`, order });
  } catch (error) {
    res.status(500).json({ message: 'Error processing review', error: error.message });
  }
};

// 8. Final Delivery Route (/complete-order)
exports.completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paidAmount } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (paidAmount !== undefined) {
      order.billing.paid += Number(paidAmount);
      order.billing.due = Math.max(0, order.billing.total - order.billing.paid);
    }

    if (order.billing.due === 0) {
      order.status = 'Completed';
    } else {
      // Just updating payment without completing if dues remain
      order.status = 'Completed'; // Instructed by prompt: updates paidAmount to clear dues -> status changes to 'Completed'
    }

    await order.save();
    res.status(200).json({ message: 'Order completed', order });
  } catch (error) {
    res.status(500).json({ message: 'Error completing order', error: error.message });
  }
};

// Get all orders (with optional filtering)
exports.getOrders = async (req, res) => {
  try {
    const { status, editorAssigned, writerAssigned } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (editorAssigned) filter['productionStates.editorAssignment.editorId'] = editorAssigned;
    if (writerAssigned) filter['productionStates.writerAssigned'] = writerAssigned;

    const orders = await Order.find(filter)
      .populate('modelCasting.modelIds')
      .populate('productionStates.pmAssigned', 'name email')
      .populate('productionStates.writerAssigned', 'name email')
      .populate('productionStates.editorAssignment.editorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get Metrics for Dashboard
exports.getMetrics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    // Aggregate by status
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Aggregate by editor (active tasks)
    const editorTasks = await Order.aggregate([
      { $match: { 'productionStates.editorAssignment.editorId': { $exists: true, $ne: null }, status: { $in: ['In Editing', 'Revision in Progress'] } } },
      { $group: { _id: '$productionStates.editorAssignment.editorId', activeTasks: { $sum: 1 } } }
    ]);

    // Aggregate shoot counters
    const totalShoots = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$productionStates.shootTracking.shotCompleted' } } }
    ]);

    res.status(200).json({
      totalOrders,
      statusCounts,
      editorTasks,
      totalShoots: totalShoots[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching metrics', error: error.message });
  }
};
