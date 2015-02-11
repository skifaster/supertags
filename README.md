# Supertags for Meteor

Simple tagging package for both javascript objects and mongo documents.

## About SuperTags

SuperTags allows for easy tagging of in memory objects and mongo documents. Some of the features include:

* Manage multiple tags/lables at once
* Parsing 'tokenized' tags from any text field or object
* Applying tags to an object in memory
* Add/Remove tags from documents in MongoDB
* Enable auto-complete for existing tags
* Link/Hightlight tags within text

## Current Version
**v0.1.0**

## Setup and Configuration

To use the SuperTags package, the ``Activate`` method must be called with a settings object. The basic settings of the SuperTags library are below:

```js
var settings {
  parentObj: "tags",     //optional, allows for all tags to be under one object
	availableTags: [{      //required, array of available tags
    	label: "itemtags"  //required, label of the desired tag
	}]
}

```

### Tokenized Tags

Hashtags and mentions are the most popular tokenized tags, but SuperTags allows for any number of tokenized tags.

```js
var tokenizedSettings = {
  availableTags: [{
    label: "hashtag",
    token: "#"          //token to denote a tag within text
  }, {
    label: "mention",
    token: "@"
  }]
}
```

### Autocomplete Settings

Most tag libraries have autocomplete built in, SuperTags utlizes [mizzao:autocomplete](https://atmospherejs.com/mizzao/autocomplete) to allow this functionality. To use autocomplete with SuperTags, use the following settings:

```js
var settings = {
  inputTemplate: "templateName",  //the name of the template that will be interacted with (e.g typed in)
  availableTags: [{
    label: "hashtag",
    token: "#",
    autocomplete: [  //see mizzao:autocomplete for full docs
      collection: collectionName, //name of the collection to pull from for autocomplete
      field: "fieldName",         //name of the field from the collection (above) to use
      template: "templateName"   //original docs take a Template, SuperTags needs a string name for the template
    ]
  }]
}
```

### Auto Save Settings

TODO

### Mongo Document Tagging Settings

In some cases, a document might already exist in MongoDB that needs to be tagged. SuperTags can manage this, if given the collection name of which to interact with and a document id. The tags are added to the provided mongo document as a field of type object. The settings to enable this functionality are below:

```js
var settings = {
  itemCollection: collection, //the name of the collection
  availableTags: [{
    label: "hashtag"
  }]
}
``` 

## Usage

To use SuperTags, call the ``Activate`` function with the appropriate settings:

```js
superTags = new SuperTags.Activate(settings);
```

The returned ``superTags`` object will have the following methods: 

* parseAllTags (text) //runs parse tags across all tag controllers
* parseAllTagsFromObject (object, fieldName) //fieldName is optional if parseField is provided in settings
* applyAllTags (object, fieldName) //fieldName is optional if parseField is provided in settings

In general, parsing tags from a string or object will both return and store the tags in the specific instance of SuperTags. Once the tags are applied (e.g. applyAllTags), the tags are cleared from the instance.

Examples: 

```js
var parsedTags = superTags.parseAllTags("this is my #sample text");

//Output for parsedTags
{originalText: "this is my #sample text", modifiedText: "this is my #sample text", hashtag: ["sample"]}
```

```js
var parsedObj = superTags.parseAllTagsFromObject({text: "this is my #sample text"}, "text");

//Output for parsedObj
{originalObj: {text: "this is my #sample text"}, modifiedObject: {text: "this is my #sample text"}, hashtag: ["sample"]}
```

```js
var applyAllTags = superTags.applyAllTags({text: "this is my #sample text"}, "text")

//Output for applyAllTags
{text: "this is my #sample text", hashtag: ["sample"]}
```

In addition, each tag label is available off the ``supertags`` object as a tag controller, in the case only a single group of tags needs to be interacted with. 

Example (assuming ```hashtag``` was the label passed in from settings):

```js
supertags.hashtag
```

### Tag Controllers

Each tag controller has two main functions:

* parseTags (text, options)
* tagItem (item, additionalTags)

The tagItem function must be called after the parseTags function, as the tags are provided by the parse function.

Example:

```js
//parses and stores the 'sample' hashtag on the instance 'superTags'
var tags = superTags.hashtag.parseTags("this is my #sample text");

//applies the parsed tags from the previous line to the object provided
var taggedObject = superTags.hashtag.tagItem({sample: "item"});

//Output for tags
{originalText: "this is my #sample text", modifiedText: "this is my #sample text", hashtag: ["sample"]}

//Output for taggedObject
{sample: "item", hashtag: ["sample"]}

```

### Tag Mongo Controller

Each tag controller also has a mongo controller available to it. This allows for each tag management of documents already stored within MongoDB.

```js
superTags.hashtag.mongoController
```

Mongo controllers have the following functions:

* addTagToDoc (docId, docTag, callback)
* removeTagFromDoc(docId, docTag, callback);

In both addTagToDoc and removeTagFromDoc, either a single tag (string) or an array of tags ([strings]) can be passed in. 

Examples:

```js
//a field called 'hashtag' will be added to the MongoDB document containing an array of tags
superTags.hashtag.mongoController.addTagToDoc(docId, ["tag1", "tag2", "tag3"])
```

```js
//a field called 'hashtag' will be modified and the strings will be removed from the array
superTags.hashtag.mongoController.removeTagFromDoc(docId, ["tag1", "tag2", "tag3"])
```

## Events

SuperTags is built with ClassX and thus has a full event system built in. This is useful if something should happen anytime something is tagged or a tag is removed from an item. 

To subscribe to events within Supertags: 

```js
SuperTags.addEventListener("tag", function(data) {

})
```

The data parameter has the following properties and possible values: 

```
data: {
  callee: controller, mongoController
  action: tagAdded, tagRemoved, newTagParsed, newTagSaved
  label: //the label responsible for triggering (e.g. hashtag, mention)
  tags: //tags that were added, remove, parsed or saved
}
```

## Template Helpers

SuperTags utilizes the mizzao:autocomplete template helpers and also provides some additional helpers to make it easier to deal with tags.

### Autocomplete

Autocomplete can be enabled on a textbox or a textarea. 

Textbox Example:

```html 
  {{> inputAutocomplete settings=settings id="anyId" class="anyClasses"}}
```



The full documentation can be found at [mizzao:autocomplete](https://atmospherejs.com/mizzao/autocomplete)

### Tag Highlighting

### Object Tags 

## Bonus

### Handling spaces in tags

Typically tags do not support spaces, but this makes things like mentions a little tricky. SuperTags allows the use of spaces provided the appropriate syntax. 

```js
  var spacedTags = "This is a #sample provided by @[Carsten Winsnes]"
```

In the example above 'Carsten Winsnes' will now be available as a tag.

Note: If autocomplete is enabled, it will tag items with existing tags automatically, no special syntax is needed. New tags still need to use the syntax above, until they are stored in the autocomplete collection.

## License

[MIT](http://choosealicense.com/licenses/mit/) -
Copyright (c) 2015 [Ars Nebula](http://www.arsnebula.com)