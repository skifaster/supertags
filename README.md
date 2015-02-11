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

To use the SuperTags package, the ``Activate`` method must be called with a settings object. The most basic setup of the SuperTags library is below:

```js
var settings {
	availableTags: [{
    	label: "itemtags"
	}]
}

```

### Tokenized Tags

Hashtags and mentions are the most popular tokenized tags, but SuperTags allows for any number of tokenized tags.

### Autocomplete Settings

Most tag libraries to date have autocomplete built in, SuperTags utlizes ``mizzao:autocomplete`` to allow this functionality. To use autocomplete with SuperTags, use the following settings:

### Auto Save Settings

### Mongo Document Tagging Settings

## Usage

## License

[MIT](http://choosealicense.com/licenses/mit/) -
Copyright (c) 2013 [Ars Nebula](http://www.arsnebula.com)