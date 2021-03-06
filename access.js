function getNestedProperty(object, string) {
  string.split(".").every(function (property) {
    if (!object) return false;
    object = object[property];
    return true;
  });
  return object;
}

/**
 * Chainable access validator for meteor.
 * If the context is given it is used to skip user authentication when the call is initiated by the server.
 * @param [context] - If given should be the `this` object of a meteor method or publish function.
 * @returns {Access}
 * @constructor
 */
Access = function Access(context) {

  // holds the currently active user
  var user;
  // holds the current collection document
  var doc;

  // always allow server side calls without user or role validation
  var serverSideCall = context && !context.connection;

  // wraps all chainable methods
  var chain = {};

  /**
   * Requires the given userId to be valid and stores the corresponding user for subsequent calls.
   * @param {String} userId
   * @returns {Access}
   */
  chain.from = function accessFrom(userId) {
    if (serverSideCall) return chain;
    // reset a previous user
    user = undefined;
    // try to find the user if the id is valid
    if (userId) {
      check(userId, String);
      user = Meteor.users.findOne(userId);
    }
    // fail if the user was not found or the id was not valid in the first place
    if (!user) throw new Meteor.Error(401, "Unauthorized");
    return chain;
  };

  /**
   * Requires the given collection to contain a document with the given id and stores it for subsequent calls.
   * @param {Mongo.Collection} collection
   * @param {String} id
   * @returns {Access}
   */
  chain.to = function accessTo(collection, id) {
    if (!Match.test(id, String) && !Match.test(id, Mongo.ObjectID)) {
      throw new Meteor.Error(400, "Id must be String or ObjectID");
    }
    doc = collection.findOne(id);
    if (!doc) throw new Meteor.Error(404, "Not Found");
    return chain;
  };

  /**
   * Requires the current user to be in at least one of the given roles or the given property on the current document to contain the users id.
   * @param {String, [String]} roles
   * @param {String} [property]
   * @returns {Access}
   */
  chain.as = function accessAs(roles, property) {
    if (serverSideCall) return chain;
    // check if user is in one of the given roles
    if (roles && Roles.userIsInRole(user._id, roles)) return chain;
    // check if user is the "owner", or whatever the meaning of "property" is
    if (property && getNestedProperty(doc, property) === user._id) return chain;
    // if none of the above returned the user does not have access
    throw new Meteor.Error(403, "Forbidden");
  };

  /**
   * Returns the document stored by the last call to to().
   * @returns {Object}
   */
  chain.value = function accessValue() {
    return doc;
  };

  return chain;
};
