Access = function Access(quiet) {

  // holds the currently active user
  var user;
  // holds the current collection document
  var doc;

  // hold failed state when quiet is true
  var failed = false;
  var error = null;

  function arg(obj, type) {
    if (failed) return false;
    try {
      check(obj, type);
      return true;
    } catch (e) {
      err(e);
    }
    return false;
  }

  function fail(status, message) {
    if (failed) return;
    err(new Meteor.Error(status, message));
  }

  function err(e) {
    if (failed) return;
    error = e;
    if (quiet) {
      failed = true;
    } else {
      throw error;
    }
  }

  // wraps all chainable methods
  var chain = {};

  /**
   * Requires the given userId to be valid and stores the corresponding user for subsequent calls.
   * @param {String} userId
   */
  chain.from = function accessFrom(userId) {
    // reset a previous user
    user = undefined;
    // try to find the user if the id is valid
    if (userId && arg(userId, String)) {
      user = Meteor.users.findOne(userId);
    }
    // fail if the user was not found or the id was not valid in the first place
    if (!user) fail(401, "Unauthorized");
    return chain;
  };

  /**
   * Gets an item from a collection by id.
   * @param collection
   * @param id
   */
  chain.to = function accessTo(collection, id) {
    if (!arg(id, String)) return chain;
    doc = collection.findOne(id);
    if (!doc) fail(404, "Not Found");
    return chain;
  };

  /**
   * Requires the current user to be in at least one of the given roles or the given property to contain the users id.
   * @param {String, [String]} roles
   * @param {String} property
   */
  chain.as = function accessAs(roles, property) {
    if (failed) return chain;
    // check if user is in one of the given roles
    if (roles && Roles.userIsInRole(user._id, roles)) return chain;
    // check if user is the "owner", or whatever the meaning of "property" is
    if (property && doc[property] === user._id) return chain;
    // if none of the above returned the user does not have access
    fail(403, "Forbidden");
  };

  /**
   * Returns the document stored by the last call to to().
   * @returns {Object}
   */
  chain.value = function accessValue() {
    return doc;
  };

  /**
   * Returns the state of the current access when using quiet mode.
   * @returns {boolean}
   */
  chain.failed = function accessFailed() {
    return failed;
  };

  /**
   * Returns the first validation error when using quiet mode.
   * @returns {Meteor.Error}
   */
  chain.error = function accessError() {
    return error;
  };

  return chain;
};
