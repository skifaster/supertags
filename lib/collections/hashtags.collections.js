SuperTags.Collections.HashTags = new Meteor.Collection("hashtags");

if(Meteor.isServer) {
	Meteor.publish("SuperTags/HashTags", function() {
		return SuperTags.Collections.HashTags.find();
	});
}