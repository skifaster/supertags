var env = require('system').env;
var url = env.ROOT_URL;

if(!url) {
  url = "http://localhost:3000"
}

describe("Create and use mongo controllers", function() {
	before(function() {
    casper.start(url);
    casper.on("remote.message", function(message) {
      this.echo(message);
    })
  });
  it("should have a global namespace and base classes", function() {
    casper.wait(5000);
    casper.then(function() {
      var evalResults = casper.evaluate(function() {
        var x = SuperTags;
        var y = new SuperTags.Activate({});
        return {
          hasNameSpace: (SuperTags && y.parseAllTags && y.parseAllTagsFromObject && y.applyAllTags != null)
        }
      });
      evalResults.hasNameSpace.should.equal(true);
    })
  });
  it("should create tag mongo controllers", function() {
    casper.then(function() {
      var evalResults = casper.evaluate(function() {
        var tokenizedSettings = {

          availableTags: [{
            label: "hashtags",
            token: "#"
          }, {
            label: "mention",
            token: "@"
          }]
        }

        superTags = new SuperTags.Activate(tokenizedSettings);

        return {
          hasTagMongoController: (superTags.hashtags.mongoController != null && superTags.mention.mongoController != null)
        }
      });
      evalResults.hasTagMongoController.should.equal(true);
    })
  });
  it("should have base functions", function() {
    casper.then(function() {
      var evalResults = casper.evaluate(function() {
        var a = superTags.hashtags.mongoController.addTagToDoc;
        var b = superTags.hashtags.mongoController.removeTagFromDoc;
        return {
          hasTagMongoControllerFunctions: (a != null && b != null)
        }
      });
      evalResults.hasTagMongoControllerFunctions.should.equal(true)
    })
  })
});