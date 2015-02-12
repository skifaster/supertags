SuperTags.MongoController = new ClassX.extend(SuperTags.Class, function(base) {

  /* 
    Mongo specific calls to tag an already existing mongo document. Tags can be
    added and removed and will not be duplicated if added twice.
  */

  this.addTagToDoc = function(docId, docTag, callback) {
    var itemDoc = this.getDocById(docId);
    var itemSet = {};

    //if the document has a tags object already we need to create a new array or merge with current tags
    if(this.docHasTags(itemDoc)) {

      if(itemDoc[this.parentObj] && itemDoc[this.parentObj][this.fieldName] && _.isArray(itemDoc[this.parentObj][this.fieldName])) {
        //assuming the current doc has a tag array, just add to it.
        if(_.isString(docTag)) {
          itemSet[this.mongoField] = docTag;
        }
        else if(_.isArray(docTag)) {
          itemSet[this.mongoField] = {$each: docTag};
        }

        this.updateDocWithTags(docId, {$addToSet: itemSet}, callback);

      } else if (itemDoc[this.parentObj]){
        //the doc does not have an array of this field yet, creating it.
        if(_.isString(docTag)) {
          itemSet[this.mongoField] = [docTag]; 
        }
        else if (_.isArray(docTag)) {
          itemSet[this.mongoField] = docTag;
        }
        
        this.updateDocWithTags(docId, {$set: itemSet}, callback);

      } else if (itemDoc[this.fieldName] && _.isArray(itemDoc[this.fieldName])) {
        //there is no parent object, but the tag label is already a field and an array
        if(_.isString(docTag)) {
          itemSet[this.fieldName] = docTag;  
        } else if(_.isArray(docTag)) {
          itemSet[this.fieldName] = {$each: docTag}
        }
        
        this.updateDocWithTags(docId, {$addToSet: itemSet}, callback);

      } else if(itemDoc[this.fieldName]) {
        //the field exists but is not an array, reset to an array with current values
        if(_.isString(docTag)) {
          itemSet[this.fieldName] = [docTag];  
        }
        else {
          itemSet[this.fieldName] = docTag;
        }

        this.updateDocWithTags(docId, {$set: itemSet}, callback);
      }

    } else if(!this.docHasTags(itemDoc)) {
      //the doc does not have any tags yet, create them
      if(_.isString(docTag)) {
        itemSet[this.mongoField] = [docTag];  
      }
      else if(_.isArray(docTag)) {
        itemSet[this.mongoField] = docTag;
      }

      this.updateDocWithTags(docId, {$set: itemSet}, callback);
    }
    else {
      return; 
    }

    this.raiseEvent("tag", {callee: 'mongoController', action: "tagAdded", label: this.fieldName, tags: docTag});
  }

  this.removeTagFromDoc = function(docId, docTag, callback) {

    var itemDoc = this.getDocById(docId);
    var itemSet = {};

    if(!this.docHasTags(itemDoc)) {
      return;
    }

    itemSet[this.mongoField] = docTag
    if(_.isString(docTag)) {
      this.updateDocWithTags(docId, {$pull: itemSet}, callback);
    } else if(_.isArray(docTag)) {
      this.updateDocWithTags(docId, {$pullAll: itemSet}, callback);
    } else {
      return;
    }

    this.raiseEvent("tag", {callee: 'mongoController', action: "tagRemoved", label: this.fieldName, tags: docTag});
  }

  this.updateDocWithTags = function(docId, docModifier, callback) {
    if(Meteor.isClient) {
      var ctx = this;
      var sFunc = {a: this }

      Meteor.call("SuperTags/updateDocWithTags-"+this.fieldName, docId, docModifier, function(error, result) {
        if(_.isFunction(callback)) {
          callback(error,result);
        }
      });
    }

    if(Meteor.isServer) {
      //Might be nice to have server code here to keep things organized
      //now code runs under dbTagUpdate private function in the class
    }
  }

  this.docHasTags = function(itemDoc) {

    if(!itemDoc)
      return false;

    if(this.parentObj) {
      if(itemDoc[this.parentObj]) {
        return true;
      }
    } else if (itemDoc[this.fieldName] && _.isArray(itemDoc[this.fieldName])) {
      return true;
    }

    return false;
  }

  this.getDocById = function(docId) {
    var itemDoc = this.itemCollection.findOne({_id: docId});
    return itemDoc
  }

  var dbTagUpdate = function(docId, docModifier) {
    var ctx = this;
    return function(docId, docModifier) {
      ctx.itemCollection.update(docId, docModifier);
    }
  }

  /*
    Mongo specific functions for the tags themselves. Add, remove tags from their
    specific mongo collections
  */

  //Save a new tag to the respecitive collection. This might belong in the controller
  //as it is a core part of the tag package. Although it is a specific mongo call
  //to do the saving of the tag. Does allow for server side hooks, etc...
  var dbSaveNewTag = function() {
    var ctx = this;
    return function(tagObj) {
      
      ctx._cl.insert(tagObj);
    }
  }

	this.constructor = function MongoController(options) {
		base.constructor.call(this, options);

    this.itemCollection = options.itemCollection;
    this._cl = options.collection;
    this.fieldName = options.label;
    this.parentObj = options.parentObj;

    if(this.parentObj) {
      this.mongoField = this.parentObj + "." + this.fieldName;
    } else {
      this.mongoField = this.fieldName;
    }


    //setup a seperate meteor method for each mongocontroller instance.
    //Needed because dependency injection doesn't work cross client/server requests
    var methods ={};

    try{
      methods ={};
      methods['SuperTags/updateDocWithTags-' + this.fieldName] = dbTagUpdate.call(this);
      Meteor.methods(methods)
    } catch(ex) {};

    try {
      methods = {};
      methods["SuperTags/saveNewTag-"+ this.fieldName] = dbSaveNewTag.call(this);
      Meteor.methods(methods);
    } catch(ex) {}
	}
});