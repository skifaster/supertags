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

    return settings;
  }

  this.applyAllTags = function(obj, fieldName) {

    this.tokenTypes.forEach(function (tokenType) {

      var fieldToParse;
      if(fieldName) {
        fieldToParse = fieldName;
      } else if (tokenType.parseField) {
        fieldToParse = tokenType.parseField;
      }

      var text = obj[fieldToParse];
      obj[fieldToParse] = tokenType.parseTags(text).modifiedText;
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
        filterObj[tokenType.fieldName] = {$all: res[tokenType.fieldName]}
      }
    })

    return filterObj;
  }

  this.parseAllTags = function(text) {
    var obj = {};
    var ctx = this;

    var parseText = text;
    this.tokenTypes.forEach(function (tokenType) {
      if(tokenType.parentObj) {
        obj[tokenType.parentObj] = obj[tokenType.parentObj] || {};
        
        var parseResult = tokenType.parseTags(parseText);
        obj[tokenType.parentObj][tokenType.fieldName] = parseResult.tags;
        parseText = parseResult.modifiedText;

      } else {
        var parseResult = tokenType.parseTags(parseText);
        obj[tokenType.fieldName] = parseResult.tags;
        parseText = parseResult.modifiedText;
      }
    })

    obj.originalText = text;
    obj.modifiedText = parseText;

    return obj;
  }

  this.parseAllTagsFromObject = function(obj, fieldName) {
    var retObj = {}

    var originalObj = new ReactiveVar(obj);
    originalObj = originalObj.extend(true, {});

    var parseText;
    this.tokenTypes.forEach(function (tokenType) {
      var fieldToParse;
      if(fieldName) {
        fieldToParse = fieldName;
      } else if (tokenType.parseField) {
        fieldToParse = tokenType.parseField;
      }

      if(fieldToParse) {
        var text = obj[fieldToParse];
        var parseResult = tokenType.parseTags(text);

        if(tokenType.parentObj) {
          retObj[tokenType.parentObj] = retObj[tokenType.parentObj] || {};
          retObj[tokenType.parentObj][tokenType.fieldName] = parseResult.tags;
        } else if(tokenType.fieldName) {
          retObj[tokenType.fieldName] = parseResult.tags;
        }

        obj[fieldToParse] = parseResult.modifiedText;
      }
    });

    retObj.originalObj = originalObj;
    retObj.modifiedObj = obj;

    return retObj;
  }

  var bindCallback = function(cb) {
    var ctx = this;
    return function(doc, elem) {
      cb.apply(ctx, arguments);
    }
  }

  this.constructor = function Activate(options) {
    var settings = initSettings.call(this, options);
    settings = new ReactiveVar(settings);
    settings = settings.extend(true, options);

    base.constructor.call(this, settings);
    this.mongoController = new SuperTags.MongoController(options);

    if(!base.namespaceInit) {
      base.init(options);
    }

    this.parseField = options.parseField;    
    this.tokenTypes = [];

    var ctx = this;

    var rules = [];
    if(settings && settings.availableTags) {
      settings.availableTags.forEach(function (tag) {        
        tag.autocomplete = tag.autocomplete || {}
        tag.autocomplete.token = tag.token;
        tag.autocomplete.label = tag.label;
        tag.autocomplete.highlight = tag.highlight;
        tag.autocomplete.parseField = tag.parseField;
        rules.push (tag.autocomplete)
        
      });
    }

    rules.forEach(function (rule) {

      var subOptions = new ReactiveVar(options);
      subOptions = subOptions.extend(true, {}, rule);

      if(Meteor.isClient) {
        rule.template = Template[rule.template];
      }

      rule.ctx = ctx; 

      ctx[rule.label] = new SuperTags.Controller(subOptions);
      rule.callback = bindCallback.call(ctx[rule.label], rule.callback);

      ctx[rule.label]["mongoController"] = new SuperTags.MongoController(subOptions);
      ctx.tokenTypes.push(ctx[rule.label]);
    });
    
    settings.autocomplete.rules = rules;

    this.__helpers = new SuperTags.Helpers(settings, ctx);

  }
});
