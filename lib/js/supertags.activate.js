SuperTags.Activate = ClassX.extend(SuperTags.Class, function(base) {

  var initSettings = function(options) {
    var ctx = this;
    var settings = {
      tagMode: "tagBox",
      submitKeys: [13, 9],
      inputSelector: ".taggle_input",
      tagCss: {
        additionalTagClasses: null,
        duplicateTagClass: null,
        containerFocusClass: null
      }
    }


    if(options.tagMode === "inline") {
      settings.inputSelector = "#" + options.inputControl;
    }

    if(options.autocomplete) {
      settings.autocomplete = {
        containerTemplateName: "supertagsAutocompleteContainer",
        itemTemplateName: "supertagsAutocompleteItem",
        supertagsAcItemClass: "supertags-ac-item",
        supertagsSelectedItemClass: "supertags-selected"
      }
    }

    if(options.tagMode === "inline" && options.autocomplete) {
      settings.submitKeys.push(32);
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
        filterObj[tokenType.mongoField] = {$all: res[tokenType.parentObj][tokenType.fieldName]}
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

    this.settings = settings;

    base.constructor.call(this, settings);
    this.mongoController = new SuperTags.MongoController(options);

    if(!base.namespaceInit) {
      base.init(options);
    }

    this.parseField = options.parseField;
    this.tokenTypes = [];

    var ctx = this;
    if(settings && settings.availableTags) {
      settings.availableTags.forEach(function (tag) {
console.log('tag',tag)
        var subOptions = new ReactiveVar(options);
        subOptions = subOptions.extend(true, {}, tag);
console.log(subOptions);
        if(Meteor.isClient) {
          tag.template = Template[tag.template];
        }

        tag.ctx = ctx;

        ctx[tag.label] = new SuperTags.Controller(subOptions);
        tag.callback = bindCallback.call(ctx[tag.label], tag.callback);

        ctx[tag.label]["mongoController"] = new SuperTags.MongoController(subOptions);

        ctx.tokenTypes.push(ctx[tag.label]);
      });
    }

    //used inside the events and helpers to filter out autocomplete choices
    this.autocompleteTextFilter = new ReactiveVar("");

    //set the default autocomplete data to the data source on the settings object
    //using tokens will change the data source to pick from the correct list
    if(settings && settings.autocomplete) {
      this.autocompleteInfo = options.autocomplete;
    }

    this.__helpers = new SuperTags.Helpers(settings, ctx);
    this.__events = new SuperTags.Events(settings, ctx);

  }
});
