SuperTags.Activate = ClassX.extend(SuperTags.Class, function(base) {

  var initSettings = function(options) {
    var ctx = this;
    var settings = {
      enableAutoComplete: true,
      enableHashtags: true,
      enableMentions: true,
      autocomplete: {
        position: "bottom",
        limit: 5,
        rules: []
      }
    }

    settings = $.extend(true, {}, settings, options);
    if(settings.enableAutoComplete && settings.enableMentions) {
      settings.autocomplete.rules.push({
        tokenType: "mention",
        token: "@",
        collection: SuperTags.Collections.Mentions,
        field: "name",
        parseField: "text",
        template: Template.mentionItem,
        callback: function(doc, elem) {
          ctx.mention.storeItemTag(doc.name);
        }
      })
    }

    if(settings.enableAutoComplete && settings.enableHashtags) {
      settings.autocomplete.rules.push({
        tokenType: "hashtag",
        token: "#",
        collection: SuperTags.Collections.HashTags,
        field: "name",
        parseField: "text",
        template: Template.mentionItem,
        callback: function(doc, elem) {
          ctx.hashtag.storeItemTag(doc.name);
        }
      })
    }

    return settings;
  }

	var initHelpers = function(options) {
    var ctx = this;
    if(Meteor.isClient) {
      Template[options.inputTemplate].helpers({
        settings: function() {
          return options.autocomplete
        }
      });

      var ctx = this;
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
            // return ctx.linkAllTags(null, this);
          },
          supertagslinktext: function(text) {
            // console.log("supertagslinktext - this", this)
            var helperctx = this;
            ctx.tokenTypes.forEach(function (tokenType) {
              var tagData = null; 
              if(tokenType.parentObj) {
                tagData = helperctx[tokenType.parentObj][tokenType.fieldName];
              } else {
                tagData = helperctx[tokenType.fieldName];
              }

              if(tagData && tagData.length > 0)
                tagData.forEach(function (tag) {
                  var reg = new RegExp(tokenType.token + tag, "g");
                  
                  var color;
                  if(tokenType.highlight)
                    color = tokenType.highlight;
                  else
                    color = template.color;

                  text = text.replace(reg, "<span style='color:" + color + "'>" + tokenType.token + tag + "</span>")
                });
            });

            return text;
          }
        })
      });
    }
	}

  this.applyAllTags = function(obj) {

    this.tokenTypes.forEach(function (tokenType) {
      var text = obj[tokenType.parseField];
      obj[tokenType.parseField] = tokenType.parseTags(text);
      obj = tokenType.tagItem(obj);
    });

    return obj;
  }

  this.filterByTags = function(obj) {

    var res = this.applyAllTags(obj);

    var ctx = this;
    var filterObj = {};
    this.tokenTypes.forEach(function (tokenType) {
      // console.log(tokenType.fieldName);
      // console.log(res[tokenType.fieldName])

      if(res[tokenType.parentObj] && res[tokenType.parentObj][tokenType.fieldName] && res[tokenType.parentObj][tokenType.fieldName].length > 0) {
        // filterObj[tokenType.parentObj] = filterObj[tokenType.parentObj] || {};
        filterObj[tokenType.parentObj + "." + tokenType.fieldName] = {$all: res[tokenType.parentObj][tokenType.fieldName]}
      } else if(res[tokenType.fieldName] && res[tokenType.fieldName].length > 0) {
        console.log('got filters', res[tokenType.fieldName])
        filterObj[tokenType.fieldName] = {$in: res[tokenType.fieldName]}
      }
    })
    // console.log("filterObj",filterObj)
    // console.log("bilterojbstr", JSON.stringify(filterObj));
    return filterObj;
  }

  this.parseAllTags = function(obj) {
    this.tokenTypes.forEach(function (tokenType) {
      var text = obj[tokenType.parseField];
      obj[tokenType.parseField] = tokenType.parseTags(text);
    });

    return obj;
  }

  this.linkAllTags = function(selector, item) {
    // console.log('linking tags', item.data)
    var ctx = this;
    var retObj = {};
    // selector.each(function() {
      ctx.tokenTypes.forEach(function (tokenType) {
        // console.log(tokenType.fieldName)
        if(item.data[tokenType.parentObj] && item.data[tokenType.parentObj][tokenType.fieldName] && item.data[tokenType.parentObj][tokenType.fieldName].length > 0) {
          retObj[tokenType.parentObj] = retObj[tokenType.parentObj] || {};
          retObj[tokenType.parentObj][tokenType.fieldName] = tokenType.token + item.data[tokenType.parentObj][tokenType.fieldName].join(tokenType.token);
        }

        else if(item.data[tokenType.fieldName] && item.data[tokenType.fieldName].length > 0) {
          retObj[tokenType.fieldName] = tokenType.token + item.data[tokenType.fieldName].join(tokenType.token);
        }

      // });
      // console.log($(this).text());
    })

    return retObj;
  }

	this.constructor = function Activate(options) {
    var settings = initSettings.call(this, options);
    settings = $.extend(true, {}, settings, options);

		base.constructor.call(this, settings);

		if(!base.namespaceInit) {
			base.init(options);
		}

		initHelpers.call(this, settings);

    this.tokenTypes = [];

    var ctx = this;
    settings.autocomplete.rules.forEach(function (rule) {
      rule.parentObj = options.parentObj;
      ctx[rule.tokenType] = new SuperTags.Class(rule);
      ctx.tokenTypes.push(ctx[rule.tokenType]);
    });

	}
})