# SuperTags for Meteor [![Build Status](https://api.shippable.com/projects/54dc4e2c5ab6cc13528bacdb/badge?branchName=master)](https://app.shippable.com/projects/54dc4e2c5ab6cc13528bacdb/builds/latest)

Tagging package for both javascript objects and mongo documents.

## About SuperTags

SuperTags allows for easy tagging of in memory objects and mongo documents. Some of the features include:

* Manage multiple tags/labels at once
* Parsing 'tokenized' tags from any text field or object
* Applying tags to an object in memory
* Add/Remove tags from documents in MongoDB
* Enable auto-complete for existing tags
* Link/Highlight tags within text

## Current Version
**v0.2.0**

## Setup and Configuration

To use the SuperTags package, the ``Activate`` method (see Usage below) must be called with a settings object. The basic settings of the SuperTags library are below:

```js
var settings {
  inputTemplate: "blazeTemplateName", //Blaze template to attach events and helpers
  inputControl: "divIdForTagField" //Div Id for tag input
}

```

### Tag Modes

SuperTags has two modes for entering tags:

* Tag Box - Provides an input box for users to enter in one or more tags. This is the default mode and good for collecting tags on forms, etc. The user can only enter tags in this mode.

* Inline - Similar to how twitter does hashtags, users can intermix text and tags in this mode. Tags must be tokenized with a symbol (e.g. #).

The default Tag Mode is 'tagBox', but it can also be set in the settings object:

```js
var settings = {
  ...
  tagMode: 'tagBox' //available options are: 'tagBox' or 'inline'
}
```

### Additional Tag Styles

SuperTags makes it easy to add additional CSS classes to each tag. This allows the application to adjust the look and feel of the tags.

```js
var settings = {
  ...
  tagCss: {
    additionalTagClasses: "class1 class2" //space delimited string of css classes
  }
}
```

### Submit Keys

SuperTags allows the application to adjust which key events trigger a new tag creation. By default the tab keys are 'enter' (13) and 'tab' (9). The `submitKeys` setting allows the application to override these keys.

```js
var settings = {
  ...
  submitKeys: [13, 9 , 32]
}
```

### Tokenized Tags (Inline Mode Only)

Hashtags and mentions are the most popular tokenized tags, but SuperTags allows for any number of tokenized tags. It is important to note that tokenized tags only work in `inline` mode.

```js
var settings = {
  availableTags: [{
    label: "hashtag",
    token: "#",          //token to denote a tag within text
    css: {
      classes: "class1 class2" //space delimited string of css classes
    }
  }, {
    label: "mention",
    token: "@"
  }]
}
```

### Autocomplete Settings

SuperTags has a builtin autocomplete feature that allows the user to pick from a pre-determined list of tags. Simply provide an array or collection in the settings object (see below) and it will be presented to the user on input. For collections, additional filters can be provided, which is especially useful in the case of `inline` mode.

In `tagBox` mode the user can choose from a single list. In `inline` mode, the user can choose from one list per tokenized tag.

The settings object can accept a global `autocomplete` key on settings object or an `autocomplete` key for each tokenized tag.

Global autocomplete example:

```js
var settings = {
  autocomplete: {
    data: collectionName, //accepts an array or collection name
    displayField: "fieldName", //field display in autocomplete list (required for collections)
    lookupField: "fieldName", //field to filter on as typing (required for collections)
    itemTemplate: itemTemplateName, //(optional) customize how each item is displayed
    limit: 5, //(optional) limit the number of items displayed at one time
    filter: {key: 'value'}  //(optional) provides additional filtering for collections
  }
}
```

Autocomplete for tokenized tags:

```js
var settings = {
  ...
  availableTags: [{
    label: "hashtag",
    token: "#",
    autocomplete: {
      data: collectionName, //accepts an array or collection name
      displayField: "fieldName", //field display in autocomplete list (required for collections)
      lookupField: "fieldName", //field to filter on as typing (required for collections)
      itemTemplate: itemTemplateName, //(optional) customize how each item is displayed
      limit: 5, //(optional) limit the number of items displayed at one time
      filter: {key: 'value'}  //(optional) provides additional filtering for collections
    }
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

The returned ``superTags`` variable will have the following methods:

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
{originalObj: {text: "this is my #sample text"}, modifiedObj: {text: "this is my #sample text"}, hashtag: ["sample"]}
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

To subscribe to events within SuperTags:

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


### Tag Highlighting

SuperTags also makes it easy to highlight tags with a specific color. The object must have tags added by SuperTags to be highlighted. The text is not parsed directly, the tags are replaced with highlighted spans.

Example:

```html
<template name="templateName">
  {{#each taggedItems}}
    {{{supertagslinktext text}}}
  {{/each}}
</template>
```

### DOM Tags

In some cases, it is helpful to add all the tags for an object to the DOM. SuperTags makes this easy with a convenient helper.

Example:

```html
<template name="templateName">
  {{#each taggedItems}}
    <div class='taggedItem' {{supertagsdata}} >
    </div>
  {{/each}}
</template>
```
The ``supertagsdata`` helper will provide an attribute for each tag label provided in the settings.

Example of Results:

```html
<template name="templateName">
  <div class='taggedItem' hashtag='#sample'>
  </div>
</template>
```

Each attribute value includes the original token for easy parsing.

## TODO

* Make the controller and mongoController place nicer together

## License

[MIT](http://choosealicense.com/licenses/mit/) -
Copyright (c) 2015 [Ars Nebula](http://www.arsnebula.com)