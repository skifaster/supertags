var _cl = SuperTags.Collections.Mentions;

SuperTags.Mentions = new ClassX.extend(SuperTags.Class, function(base) {

	this.addNewMention = function(mentionObj) {
		_cl.insert(mentionObj);
	}


  this.parseMentions = function(text) {
    return this.parseTags("@", text, {});
  };

	this.constructor = function Mentions() {
		base.constructor.call(this);

    this.currentItemTags = [];
    this._cl = _cl;

    this.fieldName = "mention"
	}
})