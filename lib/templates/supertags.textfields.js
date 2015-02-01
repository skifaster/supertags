Template.superTagAutoCompleteTextArea.helpers({
	attributes: function() {
		console.log(this);
		return _.omit(this, 'settings');
	}
})