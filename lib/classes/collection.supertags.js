SuperTags.MongoCollection = ClassX.extend(SuperTags.Class, function(base) {

  this.addTagToDoc = function(docId, docTag) {
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

        this.itemCollection.update(docId, {$addToSet: itemSet});

      } else if (itemDoc[this.parentObj]){
        //the doc does not have an array of this field yet, creating it.
        if(_.isString(docTag)) {
          itemSet[this.mongoField] = [docTag]; 
        }
        else if (_.isArray(docTag)) {
          itemSet[this.mongoField] = docTag;
        }
        
        this.itemCollection.update(docId, {$set: itemSet});

      } else if (itemDoc[this.fieldName] && _.isArray(itemDoc[this.fieldName])) {
        //there is no parent object, but the tag label is already a field and an array
        if(_.isString(docTag)) {
          itemSet[this.fieldName] = docTag;  
        } else if(_.isArray(docTag)) {
          itemSet[this.fieldName] = {$each: docTag}
        }
        
        this.itemCollection.update(docId, {$addToSet: itemSet});

      } else if(itemDoc[this.fieldName]) {
        //the field exists but is not an array, reset to an array with current values
        if(_.isString(docTag)) {
          itemSet[this.fieldName] = [docTag];  
        }
        else {
          itemSet[this.fieldName] = docTag;
        }

        this.itemCollection.update(docId, {$set: itemSet});
      }

    } else if(!this.docHasTags(itemDoc)) {
      //the doc does not have any tags yet, create them
      if(_.isString(docTag)) {
        itemSet[this.mongoField] = [docTag];  
      }
      else if(_.isArray(docTag)) {
        itemSet[this.mongoField] = docTag;
      }

      this.itemCollection.update(docId, {$set: itemSet});
    }
    else {
      return; 
    }

    this.raiseEvent("tag", {action: "tagAdded", tokenType: this.fieldName, tags: docTag});
  }

  this.removeTagFromDoc = function(docId, docTag) {
    var itemDoc = this.getDocById(docId);
    var itemSet = {};

    if(!this.docHasTags(itemDoc)) {
      return;
    }

    itemSet[this.mongoField] = docTag
    if(_.isString(docTag)) {
      this.itemCollection.update(docId, {$pull: itemSet});
    } else if(_.isArray(docTag)) {
      this.itemCollection.update(docId, {$pullAll: itemSet});
    } else {
      return;
    }

    this.raiseEvent("tag", {action: "tagRemoved", tokenType: this.fieldName, tags: docTag});
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

	this.constructor = function MongoCollection(options) {
    base.constructor.call(this, options);
  }

})