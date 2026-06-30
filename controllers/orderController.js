const Order = require('../models/Order');

// 1. Sales Post
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Clean up empty string numbers
    if (orderData.modelCasting) {
      if (orderData.modelCasting.numberOfModels === '') delete orderData.modelCasting.numberOfModels;
      if (orderData.modelCasting.totalContent === '') delete orderData.modelCasting.totalContent;
      if (orderData.modelCasting.numberOfProductImages === '') delete orderData.modelCasting.numberOfProductImages;
    }
    if (orderData.billing) {
      orderData.billing.total = Number(orderData.billing.total) || 0;
      orderData.billing.paid = Number(orderData.billing.paid) || 0;
      orderData.billing.due = Number(orderData.billing.due) || 0;
    }

    // Default Courier Status
    if (!orderData.productCourierTracking) orderData.productCourierTracking = {};
    if (!orderData.productCourierTracking.status) {
      orderData.productCourierTracking.status = 'Not Sent Yet';
    }

    // Determine initial status based on payment (50% rule)
    if (orderData.billing && orderData.billing.total > 0) {
      const halfTotal = orderData.billing.total / 2;
      if (orderData.billing.paid >= halfTotal) {
        orderData.status = 'Pending';
      } else {
        orderData.status = 'Pay Now';
      }
    } else {
       orderData.status = 'Pending'; // fallback if no billing
    }

    const newOrder = new Order(orderData);
    await newOrder.save();
    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// 1.1 Approve Order (Admin/PM)
exports.approveOrderWithoutPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // e.g., 'Admin' or 'Project Manager'
    
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (role === 'Admin') {
      order.status = 'Admin Order Approved';
    } else if (role === 'Project Manager') {
      order.status = 'PM Order Approved';
    } else {
      return res.status(403).json({ message: 'Unauthorized role for this action' });
    }

    await order.save();
    res.status(200).json({ message: 'Order approved successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error approving order', error: error.message });
  }
};

// 1.2 Update Payment
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.billing.paid += Number(amount);
    order.billing.due = Math.max(0, order.billing.total - order.billing.paid);

    // If status is Pay Now and they reached 50%
    if (order.status === 'Pay Now' && order.billing.paid >= (order.billing.total / 2)) {
      order.status = 'Pending';
    }

    await order.save();
    res.status(200).json({ message: 'Payment updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

// 1.3 Update Courier
exports.updateCourierInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryMode, courierName, trackingId } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.productCourierTracking = {
      ...order.productCourierTracking,
      deliveryMode: deliveryMode || order.productCourierTracking.deliveryMode,
      courierName: courierName || order.productCourierTracking.courierName,
      trackingId: trackingId || order.productCourierTracking.trackingId,
      status: 'On the Way' // Or received based on logic, assuming sent
    };

    await order.save();
    res.status(200).json({ message: 'Courier info updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating courier info', error: error.message });
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
