SuperTags.Events = ClassX.extend(SuperTags.Class, function(base){

  var initEvents = function(options) {
    var ctx = this;
    if(Meteor.isClient) {

      var events = {};
      var ctx = this;
      events['keyup #' + options.inputControl] = function(e,t) {
        var keyCode = e.keyCode;

        if(_.indexOf(options.submitKeys, keyCode) >= 0) {
          // e.preventDefault();
          // e.stopPropagation();

          keyUpTag.call(ctx, options, e, t);

          // return false;
        // }
        }

      // events['keyup #' + options.inputControl] = function(e,t) {
        $("#" + options.inputControl + " span").each(function() {
          console.log('a')
          var sel = rangy.getSelection();
          var range = sel.getRangeAt(0);

          var sc = range.startContainer;
          var myText = sc.nodeValue;

          if($(this).text().length === 0 || $(this).text() === "x") {
            $(this).remove();
          }
        })

        var iControl = $("#" + options.inputControl);

        if(iControl.text().trim().length === 0) {
          console.log('c')
          var sel = rangy.getSelection();
          var range = sel.getRangeAt(0);

          iControl.html("");
          var emptyelem = document.createTextNode('\u200B');
          var nbsp = document.createTextNode('\u00A0');
          // iControl.append(nbsp);
          iControl.append(emptyelem);

          range.setStartAfter(emptyelem);
          range.setEndAfter(emptyelem);

          sel.removeAllRanges();
          sel.addRange(range);
        }
      }

      events['mouseover .block, ontouchstart .block'] = function(e,t) {
        var elem = e.currentTarget;

        //hack for chrome's issue in not supporting contenteditable=false
        //more investigation needed
        if($(elem).find(".close").length === 0)
        {
          $(elem).append("<a class='close show'>x</a>");
        }

        $(elem).find(".close").addClass('show');
      }

      events['mouseout .block'] = function(e,t) {
        var elem = e.currentTarget;
        $(elem).find(".close").removeClass('show');
      }

      events['click .close'] = function(e,t) {
        var elem = e.currentTarget;
        var tagBlock = $(elem).closest('.block').remove();

        var sel = window.getSelection();
        var range = sel.getRangeAt(0);
        range.collapse(true);
        range.detach();
      }

      Template[options.inputTemplate].events(events);
    }
  }

  var initRenders = function(options) {
    var ctx = this;
    if(Meteor.isClient) {
      Template[options.inputTemplate].rendered = function() {
        var iControl = $("#"+options.inputControl);
        iControl.attr("contenteditable", true)
        if(iControl.text().length === 0) {
          var nbsp = document.createTextNode('\u00A0');
          iControl.append(nbsp)
        }
      }
    }
  }

  var initTagBoxRenders = function(options) {
    if(Meteor.isClient) {
      console.log('preparing tagboxrenders mode');
      Template[options.inputTemplate].rendered = function() {
        new Taggle(options.inputControl);
      }
    }
  }

  var tagText = function(tagBoxId, e, t) {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);

    var sc = range.startContainer;

    if(sc.parentNode.id !== tagBoxId && e.keyCode === 13) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    } else if(sc.parentNode.id !== tagBoxId) {
      return true;
    }

    var myText = sc.nodeValue;

    var abc = range.selectNodeContents(sc);
    range.deleteContents();

    var newTaggedElement = document.createElement('span');
    newTaggedElement.className = "block supertags-so-style";
    // newTaggedElement.style = "display:inline-block;";
    // newTaggedElement.setAttribute("tab-index","0")
    newTaggedElement.innerHTML = myText;

    var closeElem = document.createElement('a');
    closeElem.className = "close";
    // closeElem.setAttribute("contenteditable",false);
    closeElem.innerHTML = "x";

    newTaggedElement.appendChild(closeElem);

    var nbsp = document.createTextNode('\u00A0');
    var space2 = document.createTextNode('\u00A0');

    range.insertNode(nbsp);
    range.insertNode(newTaggedElement);

    range.setStartAfter(nbsp);
    range.setEndAfter(nbsp);
    range.collapse(false);

    sel.removeAllRanges();
    sel.addRange(range);

    return false;
  }

  var simpleTagText = function(tagBoxId, e, t) {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    rangy.init();
    var rRange = rangy.createRange();

    var sc = range.startContainer;

    boldRedApplier = rangy.createCssClassApplier("block");

    if(sc.parentNode.id !== tagBoxId && e.keyCode === 13) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    } else if(sc.parentNode.id !== tagBoxId) {
      return true;
    }


    rSel = rangy.getSelection();
    rRange = rSel.getRangeAt(0);

    console.log("rRange.startContainer", rRange.startContainer)
    console.log("range startContainer", range.startContainer)

    var myText = rRange.startContainer.nodeValue;


    rRange.selectNodeContents(rRange.startContainer)
        console.log("rRange.startContainer", rRange)

    // boldRedApplier.applyToRange(rRange)
    rRange.deleteContents();

    var newTaggedElement = document.createElement('a');
    newTaggedElement.className = "block";
    newTaggedElement.innerHTML = myText;


    // newTaggedElement.appendChild(closeElem);

    var nbsp = document.createTextNode('\u00A0');
    var space2 = document.createTextNode('\u00A0');

    range.startContainer.parentNode.appendChild(nbsp);
    range.insertNode(newTaggedElement);

    rangy.getSelection().setSingleRange(range);

    // $("#" + tagBoxId).append(nbsp);

    // setTimeout(function() {
      range.setStartAfter(nbsp);
    // },0)

    // range.setEndAfter(nbsp);
    range.collapse(false);

    sel.removeAllRanges();
    sel.addRange(range);

  }

  var keyUpTag = function(options, e, t) {

    var tagBoxId = options.inputControl;

    if(e.keyCode != 32) return;

    var h = $("#" + tagBoxId).html();

    var appliedTagsText = "";
    this._instCtx.tokenTypes.forEach(function(tt){
      var curTags = tt.parseTags(h);

      curTags.newTags.forEach(function (tag) {
        appliedTagsText = h.replace(tt.token + tag, "<span class='"+tt.css.classes+"'>" + tt.token + "" + tag + "</span>&nbsp;")

        $("#" + tagBoxId).html(appliedTagsText);

        //firefox hack for
        $("#" + tagBoxId + " br").last().remove();

        placeCaretAtEnd(document.getElementById(tagBoxId));
      });
    })

    if(appliedTagsText && appliedTagsText.length > 0) {

    }

    // console.log(appliedTagsText);

    // var control = new SuperTags.Controller({token: "@"});
    // var res = control.parseTags(h, {token: "@"});

    // res.tags.forEach(function (tag) {
    //   h = h.replace("@" + tag, "<span class='block'><s>#</s>" + tag + "</span>&nbsp;");
    //   console.log(h)

    // });

  }

  var placeCaretAtEnd = function (el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
      && typeof document.createRange != "undefined") {
      var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != "undefined") {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}

  this.constructor = function Events(options, instCtx) {
    base.constructor.call(this);
    this._instCtx = instCtx;
    var ctx = this;
    switch(options.tagMode) {
      case "tagBox":
        initTagBoxRenders.call(ctx,options)
        break;
      case "inline":
        initRenders.call(ctx, options);
        initEvents.call(this, options);
        break;
    }


  }
})