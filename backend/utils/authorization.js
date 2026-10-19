"use strict";

/**
 * Compare a resource's persisted owner ID with the authenticated principal.
 * Admin status is taken from the freshly loaded database user, never from the
 * JWT's potentially stale isAdmin claim.
 */
function isOwnerOrAdmin(resourceOwnerId, req) {
  if (req && req.authUser && req.authUser.isAdmin === true) return true;
  if (resourceOwnerId === undefined || resourceOwnerId === null || !req || req.user === undefined || req.user === null) {
    return false;
  }
  return String(resourceOwnerId._id || resourceOwnerId) === String(req.user._id || req.user);
}

module.exports = { isOwnerOrAdmin };
