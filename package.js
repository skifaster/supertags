Package.describe({
	"name": "arsnebula:supertags",
	"summary": "Tagging system for anything",
	"version": "0.1.0",
	"git": "git@bitbucket.org:arsnebula/meteor-billing.git"
});

Package.onUse(function(api) { 
	api.versionsFrom("1.0");
	api.use("mizzao:autocomplete");
	api.use("arsnebula:classx");
  api.use("templating");

	api.addFiles([
		"lib/supertags.namespace.js",
		"lib/supertags.activate.js"
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