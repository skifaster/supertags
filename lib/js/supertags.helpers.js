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
					if(!ctx.autocompleteData)
						return;

					if(_.isArray(ctx.autocompleteData)) {
						var filter = ctx.autocompleteTextFilter.get();
						var textFilter = filter.text;

						var res = _.filter(ctx.autocompleteData, function(dataObj) {
							return dataObj.indexOf(textFilter) > -1;
						})

						if(filter && filter.limit && res.length > filter.limit) {
							res = res.slice(0,5);
						}

						return res;
					}

					var selectorOptions = ctx.autocompleteTextFilter.get()
					return ctx.autocompleteData.find(selectorOptions.filter, selectorOptions.options);
				}
			})

			Template["supertagsAutocompleteItem"].helpers({
				'showFieldData': function() {
					if(!_.isArray(ctx.autocompleteData) && options.autocomplete.displayField) {
						return this[options.autocomplete.displayField];
					}
					else {
						return this;
					}
				}
			});

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