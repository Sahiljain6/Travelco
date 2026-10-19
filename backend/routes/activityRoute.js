const express = require('express');
const { createActivity, getPendingActivities, getActivity, deleteActivity, approveActivity, getApprovedActivities, declineActivity, filterActivities, getMyActivities } = require('../controllers/activityController.js');

const router = express.Router();

const {
    userMiddleware,
    organizerMiddleware,
    adminMiddleware,
} = require('../middleware/authMiddleware.js');

// Public visitors may view approved activities. Authenticated owners/admins may
// also preview their own pending or declined submissions.
const optionalUserMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  const hasBearer = typeof authorization === "string" && authorization.startsWith("Bearer ");
  if (!hasBearer && !(req.cookies && req.cookies.access_token)) return next();
  return userMiddleware(req, res, next);
};

// Routes
router.get('/', getApprovedActivities);

router.post('/', organizerMiddleware, createActivity);

router.delete('/:id', organizerMiddleware, deleteActivity)

router.get('/myActivities', organizerMiddleware, getMyActivities);
router.put('/approve/:id', adminMiddleware, approveActivity);
router.put('/decline/:id', adminMiddleware, declineActivity);
router.get('/approved', getApprovedActivities);
router.get('/pending', adminMiddleware, getPendingActivities);
router.get('/filter', filterActivities);

router.get('/:id', optionalUserMiddleware, getActivity);

module.exports = router;
