Package.describe({
	"name": "arsnebula:supertags",
	"summary": "Simple tagging package for both javascript objects and mongo documents.",
	"version": "0.1.2",
	"git": "https://github.com/arsnebula/supertags.git"
});

Package.onUse(function(api) {
	api.versionsFrom("1.0");
	api.use("mizzao:autocomplete@0.4.10");
  api.use("arsnebula:reactive-varx@0.9.2");

	api.use("arsnebula:classx@2.0.5");
  api.use("templating");

  api.addFiles([
    "lib/classes/bower_components/rangy/rangy-core.min.js",
    "lib/classes/bower_components/rangy/rangy-cssclassapplier.min.js",
    "lib/classes/bower_components/rangy/rangy-selectionsaverestore.min.js",
    // "lib/classes/bower_components/rangy/rangy-textrange.js"
  ], ["client"])

  api.addFiles([
    "lib/external/taggle.js",
    "lib/external/taggle.css"
  ], ["client"])

	api.addFiles([
		"lib/js/supertags.namespace.js",
    "lib/js/supertags.controller.js",
    "lib/js/supertags.mongocontroller.js",
    "lib/js/supertags.helpers.js",
    "lib/js/supertags.events.js",
		"lib/js/supertags.activate.js",
	]);

  api.addFiles([
    "lib/classes/collection.supertags.js"
  ]);

	api.addFiles([
		"lib/collections/mentions.collections.js",
		"lib/collections/hashtags.collections.js"
	]);

  api.addFiles([
    "lib/templates/supertags.textfields.html",
    "lib/templates/supertags.textfields.js"
  ], ["client"])

	api.export("SuperTags");
})