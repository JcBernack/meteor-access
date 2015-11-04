Package.describe({
  name: "jcbernack:access",
  version: "0.1.0",
  // Brief, one-line summary of the package.
  summary: "Simple chainable access validator.",
  // URL to the Git repository containing the source code for this package.
  git: "",
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: "README.md"
});

Package.onUse(function(api) {
  api.versionsFrom("1.2.1");
  api.use("mongo");
  api.use("check");
  api.use("accounts-base");
  api.use("alanning:roles");
  api.addFiles("access.js");
  api.export("Access")
});

//Package.onTest(function(api) {
//  api.use("ecmascript");
//  api.use("tinytest");
//  api.use("access");
//  api.addFiles("access-tests.js");
//});
