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

    var extSettings = new ReactiveVar(settings);
    settings = extSettings.extend(true, options);

    // if(settings.enableAutoComplete && settings.enableMentions) {
    //   settings.autocomplete.rules.push({
    //     tokenType: "mention",
    //     token: "@",
    //     collection: SuperTags.Collections.Mentions,
    //     field: "name",
    //     parseField: "text",
    //     template: "mentionItem",
    //     callback: function(doc, elem) {
    //       this.storeItemTag(doc.name);
    //     }
    //   })
    // }

    // if(settings.enableAutoComplete && settings.enableHashtags) {
    //   settings.autocomplete.rules.push({
    //     tokenType: "hashtag",
    //     token: "#",
    //     collection: SuperTags.Collections.HashTags,
    //     field: "name",
    //     parseField: "text",
    //     template: "mentionItem",
    //     callback: function(doc, elem) {
    //       this.storeItemTag(doc.name);
    //     }
    //   })
    // }

    return settings;
  }

  this.applyAllTags = function(obj) {

    this.tokenTypes.forEach(function (tokenType) {
      var text = obj[tokenType.parseField];
      obj[tokenType.parseField] = tokenType.parseTags(text).modifiedText;
      obj = tokenType.tagItem(obj);
    });

    return obj;
  }

  this.filterByTags = function(obj) {

    var res = this.applyAllTags(obj);

    var ctx = this;
    var filterObj = {};
    this.tokenTypes.forEach(function (tokenType) {

      if(res[tokenType.parentObj] && res[tokenType.parentObj][tokenType.fieldName] && res[tokenType.parentObj][tokenType.fieldName].length > 0) {
        // filterObj[tokenType.parentObj] = filterObj[tokenType.parentObj] || {};
        filterObj[tokenType.parentObj + "." + tokenType.fieldName] = {$all: res[tokenType.parentObj][tokenType.fieldName]}
      } else if(res[tokenType.fieldName] && res[tokenType.fieldName].length > 0) {
        console.log('got filters', res[tokenType.fieldName])
        filterObj[tokenType.fieldName] = {$in: res[tokenType.fieldName]}
      }
    })

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
    var ctx = this;
    var retObj = {};
      ctx.tokenTypes.forEach(function (tokenType) {
        if(item.data[tokenType.parentObj] && item.data[tokenType.parentObj][tokenType.fieldName] && item.data[tokenType.parentObj][tokenType.fieldName].length > 0) {
          retObj[tokenType.parentObj] = retObj[tokenType.parentObj] || {};
          retObj[tokenType.parentObj][tokenType.fieldName] = tokenType.token + item.data[tokenType.parentObj][tokenType.fieldName].join(tokenType.token);
        }

        else if(item.data[tokenType.fieldName] && item.data[tokenType.fieldName].length > 0) {
          retObj[tokenType.fieldName] = tokenType.token + item.data[tokenType.fieldName].join(tokenType.token);
        }
    })

    return retObj;
  }

  var bindCallback = function(cb) {
    var ctx = this;
    return function(doc, elem) {
      console.log('bindCallback', this)
      cb.apply(ctx, arguments);
    }
  }

  this.constructor = function Activate(options) {
    var settings = initSettings.call(this, options);
    settings = new ReactiveVar(settings);
    settings = settings.extend(true, options);

    base.constructor.call(this, settings);
    this.mongoCRUD = new SuperTags.MongoController(options);

    if(!base.namespaceInit) {
      base.init(options);
    }

    this.tokenTypes = [];

    var ctx = this;

    var rules = [];
    if(settings && settings.availableTags) {
      settings.availableTags.forEach(function (tag) {
        console.log('tag', tag)
        if(tag.autocomplete) {
          tag.autocomplete.token = tag.token;
          tag.autocomplete.label = tag.label;
          rules.push (tag.autocomplete)
        }
      });
    }

    console.log('rules', rules)


    rules.forEach(function (rule) {

      var subOptions = new ReactiveVar(options);
      subOptions = subOptions.extend(true, {}, rule);

      if(Meteor.isClient) {
        console.log('enabling template', rule.template)
        rule.template = Template[rule.template];
      }

      rule.ctx = ctx; 

      ctx[rule.label] = new SuperTags.Controller(subOptions);
      rule.callback = bindCallback.call(ctx[rule.label], rule.callback);

      ctx[rule.label]["mongoCRUD"] = new SuperTags.MongoController(subOptions);
      ctx.tokenTypes.push(ctx[rule.label]);
    });
    
    settings.autocomplete.rules = rules;

    this.__helpers = new SuperTags.Helpers(settings, ctx);

  }
});
