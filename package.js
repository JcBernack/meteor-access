Package.describe({
  name: "jcbernack:access",
  version: "0.5.0",
  // Brief, one-line summary of the package.
  summary: "Simple chainable access validator.",
  // URL to the Git repository containing the source code for this package.
  git: "https://github.com/JcBernack/meteor-access",
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: "README.md"
});

Package.onUse(function(api) {
  api.versionsFrom("1.2.1");
  api.use("mongo");
  api.use("check");
  api.use("accounts-base");
  api.use("alanning:roles@1.2.14");
  api.addFiles("access.js");
  api.export("Access")
});
