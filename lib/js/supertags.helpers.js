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
					console.log('hctx',ctx)
					if(!ctx.autocompleteInfo || !ctx.autocompleteInfo.data)
						return;

					var acData = ctx.autocompleteInfo.data;
console.log('acData',acData)
					if(_.isArray(acData)) {
						var filter = ctx.autocompleteTextFilter.get();
						var textFilter = filter.text;

						var res = _.filter(acData, function(dataObj) {
							return dataObj.indexOf(textFilter) > -1;
						})
console.log('res before slice', res)
						if(filter && filter.limit && res.length > filter.limit) {
							res = res.slice(0,5);
						}
console.log('res afte  slice', res)
						return res;
					}
console.log('asdfasdf asfhere',acData)
					var selectorOptions = ctx.autocompleteTextFilter.get()
				console.log('sl',selectorOptions)
					return acData.find(selectorOptions.filter, selectorOptions.options);
				}
			})

			Template["supertagsAutocompleteItem"].helpers({
				'showFieldData': function() {
					console.log('showfield data options', options)
					console.log('showFieldData ctx', ctx)
					if(!_.isArray(ctx.autocompleteInfo.data) && ctx.autocompleteInfo.displayField) {
						console.log('showFieldData - not array', this)
						return this[ctx.autocompleteInfo.displayField];
					}
					else if(_.isArray(ctx.autocompleteInfo.data)) {
						console.log('showFieldData is array this', this)
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