var _cl = SuperTags.Collections.HashTags;

SuperTags.HashTags = new ClassX.extend(SuperTags.Class, function(base) {


  this.checkCurrentTags = function(text) {

  }

	this.parseHashTags = function(text) {
    return this.parseTags("#", text, {});
  };

  
  this.constructor = function HashTags() {
    base.constructor.call(this);

    this.currentItemTags = [];
    this._cl = _cl;

    this.fieldName = "tags"

  }
})