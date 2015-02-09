SuperTags.Collections.Mentions = new Meteor.Collection('mentions');

if(Meteor.isServer) {
	Meteor.publish("SuperTags/Mentions", function() {
		return SuperTags.Collections.Mentions.find();
	});
}