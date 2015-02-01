SuperTags.Activate = ClassX.extend(SuperTags.Class, function(base) {

  var initSettings = function(options) {

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

    settings = $.extend({}, settings, options);
    if(settings.enableAutoComplete && settings.enableMentions) {
      settings.autocomplete.rules.push({
        tokenType: "mention",
        token: "@",
        collection: SuperTags.Collections.Mentions,
        field: "name",
        parseField: "text",
        template: Template.mentionItem,
        callback: function(doc, elem) {
          superTags.mention.storeItemTag(doc.name);
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
          superTags.hashtag.storeItemTag(doc.name);
        }
      })
    }

    return settings;
  }

	var initHelpers = function(options) {
    if(Meteor.isClient) {
      Template[options.inputTemplate].helpers({
        settings: function() {
          return options.autocomplete
        }
      });
    }
	}

  this.applyAllTags = function(obj) {

    this.tokenTypes.forEach(function (tokenType) {
      var text = obj[tokenType.parseField];
      text = tokenType.parseTags(text);
      obj = tokenType.tagItem(obj);
    });

    return obj;
  }

	this.constructor = function Activate(options) {
    var settings = initSettings.call(this, options);
    settings = $.extend({}, settings, options);

		base.constructor.call(this, settings);

		if(!base.namespaceInit) {
			base.init(options);
		}

		initHelpers.call(this, settings);

    this.tokenTypes = [];
    var ctx = this;
    settings.autocomplete.rules.forEach(function (rule) {
      ctx[rule.tokenType] = new SuperTags.Class(rule);
      ctx.tokenTypes.push(ctx[rule.tokenType]);
    });

	}
})