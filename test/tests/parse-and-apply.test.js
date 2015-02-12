var env = require('system').env;
var url = env.ROOT_URL;
url = "http://localhost:3000/";

describe("Parse and tag objects", function() {
	before(function() {
		casper.start(url);
		casper.on("remote.message", function(message) {
			this.echo(message);
		})
	});
	it("should have a global namespace and base classes", function() {
		casper.wait(2000);
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
  it("should create tag controllers", function() {
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
          hasTagController: (superTags.hashtags != null && superTags.mention != null)
        }
      });
      evalResults.hasTagController.should.equal(true);
    })
  });
  it("should properly parse a tag from text - parseAllTags", function() {
    casper.then(function() {
      var evalResults = casper.evaluate(function() {
        var parsedTags = superTags.parseAllTags("this is my #sample text");
        return parsedTags;
      })
      evalResults.originalText.should.equal( "this is my #sample text");
      evalResults.modifiedText.should.equal( "this is my #sample text");
      evalResults.hashtags[0].should.equal("sample");
    })
  });
  it("should properly parse a tag from object - parseAllTagsFromObject", function() {
    casper.then(function() {
      var evalResults = casper.evaluate(function() {
        var parsedObj = superTags.parseAllTagsFromObject({text: "this is my #sample text"}, "text");
        return parsedObj;
      })
      evalResults.originalObj.text.should.equal("this is my #sample text");
      evalResults.modifiedObj.text.should.equal("this is my #sample text");
      evalResults.hashtags[0].should.equal("sample");
    })
  });
  it("should properly applyAllTags to object", function() {
    casper.then(function() {
      var evalResults = casper.evaluate(function() {
        var applyAllTags = superTags.applyAllTags({text: "this is my #sample text"}, "text")
        return applyAllTags;
      })
      evalResults.text.should.equal("this is my #sample text");
      evalResults.hashtags[0].should.equal("sample");
    })
  });
  it("should properly parse tags from tag controller - parseTags", function() {
    casper.then(function() {
      var evalResults = casper.evaluate(function() {
        var tags = superTags.hashtags.parseTags("this is my #sample text");
        return tags;
      });
      evalResults.modifiedText.should.equal("this is my #sample text");
      evalResults.originalText.should.equal("this is my #sample text");
      evalResults.tags[0].should.equal("sample");
    })
  });
  it("should properly apply tags to object - tagItem", function() {
    casper.then(function() {
      var evalResults = casper.evaluate(function() {
        var taggedObject = superTags.hashtags.tagItem({sample: "item"});
        return taggedObject;
      });
      evalResults.hashtags[0].should.equal("sample");
      evalResults.sample.should.equal("item");
    })
  })
})