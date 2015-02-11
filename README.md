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

Most tag libraries to date have autocomplete built in, SuperTags utlizes [mizzao:autocomplete](https://atmospherejs.com/mizzao/autocomplete) to allow this functionality. To use autocomplete with SuperTags, use the following settings:

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

To use SuperTags, call the ```Activate`` function with the appropriate settings:

```js
superTags = new SuperTags.Activate(settings);
```

The returned ```superTags`` object will have the following methods: 

* parseAllTags
* parseAllTagsFromObject
* applyAllTags

In addition, each tag label is available off the ``supertags`` object as a tag controller, in the case only a single group of tags needs to be interacted with. 

Example (assuming ```hashtag``` was the label passed in from settings):

```js
supertags.hashtags
```

Each tag controller has two main functions:

* parseTags(text, options)
* tagItem(item, additionalTags)

The tagItem function must be called after the parseTags function, as the tags are provided by the parse function.

### Parsing Tags

The simplest operation that can be preformed is tag parsing. This function accepts text and returns an object with the tags found. If no token is provided in settings, all text will be considered a tag.

## License

[MIT](http://choosealicense.com/licenses/mit/) -
Copyright (c) 2015 [Ars Nebula](http://www.arsnebula.com)