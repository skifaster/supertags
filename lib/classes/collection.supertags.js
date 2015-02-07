SuperTags.MongoCollection = ClassX.extend(SuperTags.Class, function(base) {

  this.addTagToDoc = function(docId, docTag) {
    var itemDoc = this.getDocById(docId);
    var itemSet = {};

    //if the document has a tags object already we need to create a new array or merge with current tags
    if(this.docHasTags(itemDoc)) {

      if(itemDoc[this.parentObj] && itemDoc[this.parentObj][this.fieldName] && _.isArray(itemDoc[this.parentObj][this.fieldName])) {
        //assuming the current doc has a tag array, just add to it.
        itemSet[this.parentObj + "." + this.fieldName] = docTag;
        if(_.isString(docTag)) {
          itemSet[this.parentObj + "." + this.fieldName] = docTag;
          this.itemCollection.update(docId, {$addToSet: itemSet});
        }
        else if(_.isArray(docTag)) {
          itemSet[this.parentObj + "." + this.fieldName] = {$each: docTag};
          this.itemCollection.update(docId, {$addToSet: itemSet});
        }
      } else if (itemDoc[this.parentObj]){
        //the doc does not have an array of this field yet, creating it.
        itemSet[this.parentObj + "." + this.fieldName] = [docTag];
        this.itemCollection.update(docId, {$set: itemSet});
      } else if (itemDoc[this.fieldName] && _.isArray(itemDoc[this.fieldName])) {
        itemSet[this.fieldName] = docTag;
        this.itemCollection.update(docId, {$addToSet: itemSet});
      } else if(itemDoc[this.fieldName]) {
        itemSet[this.fieldName] = [docTag];
        this.itemCollection.update(docId, {$set: itemSet});
      }
    } else if(!this.docHasTags(itemDoc)) {
      //the doc does not have any tags yet, create them
      itemSet[this.fieldName] = [docTag];

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

    itemSet[this.itemField] = docTag;

    this.itemCollection.update(docId, {$pull: itemSet});

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
    console.log('options', options)
    base.constructor.call(this, options);
  }

})