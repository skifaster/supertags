SuperTags.Helpers = ClassX.extend(SuperTags.Class, function(base) {

	var initHelpers = function(options) {
		var ctx = this;
		if(Meteor.isClient) {
			if (!options.inputTemplate) {
				return;
			}

			Template[options.inputTemplate].helpers({
				settings: function() {
					return options.autocomplete
				}
			});

			Template["supertagsAutocompleteContainer"].helpers({
				'filteredItems': function() {
					return ctx.settings.autocomplete.data.find(ctx.autocompleteTextFilter.get());
				}
			})

			Template["supertagsAutocompleteItem"].helpers({
				'showFieldData': function() {
					if(options.autocomplete.displayField) {
						return this[options.autocomplete.displayField];
					}
					else {
						return this;
					}
				}
			});

			var ctx = this;
			if(options && options.taggedTemplates) {
				options.taggedTemplates.forEach(function(template){
					Template[template.name].helpers({
						supertagsdata: function() {
							var helperctx = this;
							var retObj = {};

							ctx.tokenTypes.forEach(function (tokenType) {
								if(tokenType.parentObj) {
									tagData = helperctx[tokenType.parentObj][tokenType.fieldName];
								} else {
									tagData = helperctx[tokenType.fieldName];
								}

								if(tagData && tagData.length > 0) {
									retObj[tokenType.fieldName] = tokenType.token + tagData.join(tokenType.token);
								}
							});
							return retObj;
						},
						supertagslinktext: function(text) {
							var helperctx = this;
							ctx.tokenTypes.forEach(function (tokenType) {
								var tagData = null;
								if(tokenType.parentObj) {
									tagData = helperctx[tokenType.parentObj][tokenType.fieldName];
								} else {
									tagData = helperctx[tokenType.fieldName];
								}

								if(tagData && tagData.length > 0) {
									tagData.forEach(function (tag) {
										var reg = new RegExp(tokenType.token + tag, "g");

										var color;
										if(tokenType.highlight) {
											color = tokenType.highlight;
										} else {
											color = template.color;
										}

										text = text.replace(reg, "<span style='color:" + color + "'>" + tokenType.token + tag + "</span>")
									});
								}
							});

							return text;
						}
					})
				});
			}
		}
	}

	this.constructor = function Helpers(options, ctx) {
		base.constructor.call(this);
		initHelpers.call(ctx, options);
	}
})