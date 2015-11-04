# meteor-access

Simple chainable access validator for Meteor.

This validator can be used to reduce boilerplate code when checking for user roles and access to specific collection documents.
Typical place to use it is in Meteor methods, but it is in no way restricted to that.

Supported validations:

- User logged in
- User is in given role
- User is the "owner" of a document, or similar - can be overwritten by specific roles.

## Examples

When writing meteor methods to insert/remove documents in a collection validation can be used to check if the user is actually allowed to do that.
    
    Meteor.methods({
      "stuff.add": function (obj) {
        Access().from(this.userId);
        Stuff.insert(obj);
      },
      "stuff.remove": function (id) {
        Access().from(this.userId).to(Stuff, id).as("moderator", "creator");
        Stuff.remove(id);
      }
    });

This means that `stuff.add` can only be called by authenticated users, otherwise a `401-Unauthorized` is thrown.

The other method `stuff.remove` also checks two additional things:
- The id must refer to an existing document in the given collection `Stuff`, otherwise a `404-NotFound` is thrown.
- The document must contain a property named `creator` which must hold the current users id or the user must be in the role `moderator`,
otherwise a `403-Forbidden` is thrown.

If the collection document is actually needed after the validation the chain can be ended with `.value()` which will return it:

    var doc = Access().from(this.userId).to(collection, id).as("role", "property").value();
