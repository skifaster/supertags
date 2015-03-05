SuperTags.Events = ClassX.extend(SuperTags.Class, function(base){

  var taggle;
  textFilter = new ReactiveVar("");

  var initEvents = function(options) {
    var ctx = this;
    if(Meteor.isClient) {

      var events = {};
      var ctx = this;
      events['keyup #' + options.inputControl] = function(e,t) {
        var keyCode = e.keyCode;

        //blocking shift and control keys for now
        if(keyCode === 16 || keyCode === 17)
          return;

        var elem = e.currentTarget;

        var rrange = rangy.createRange();
        rrange.selectNodeContents(elem);

        var sel = rangy.getSelection();
        sel.refresh();

        var text = sel.focusNode.nodeValue;
        if(text) {
          var startPos = sel.focusOffset;

          var charValue = text.substring(startPos-1, startPos);
          var val = text.substring(0,startPos);
          var foundMatch = null;
          ctx._instCtx.tokenTypes.forEach(function (tokenType) {
            var newSimpleTagsRegEx = new RegExp(tokenType.token + "[a-z\\d-]+","g");
            var matched = val.match(newSimpleTagsRegEx);

            if(charValue === tokenType.token || matched) {
              foundMatch = tokenType;
            }
          });

          if(foundMatch) {
            if(!ctx.isShowingAutoComplete) {
              var acBoxTop = elem.offsetTop + elem.offsetHeight;
              var acBoxLeft = elem.offsetLeft;

              showAutoCompleteBox.call(ctx,elem, "100px", elem.offsetWidth)
            }

            ctx.isShowingAutoComplete = true;
          } else {
            if(ctx.isShowingAutoComplete = true) {
              hideAutoCompleteBox();
              ctx.isShowingAutoComplete = false;
            }
            console.log('no match found')
          }
        }
        else {
          hideAutoCompleteBox();
          ctx.isShowingAutoComplete = false;
        }

        if(_.indexOf(options.submitKeys, keyCode) >= 0) {
          hideAutoCompleteBox();
          ctx.isShowingAutoComplete = false;
          // e.preventDefault();
          // e.stopPropagation();

          keyUpTag.call(ctx, options, e, t);

          // return false;
        // }
        }

      // events['keyup #' + options.inputControl] = function(e,t) {
        $("#" + options.inputControl + " span").each(function() {
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
          var sel = rangy.getSelection();
          var range = sel.getRangeAt(0);

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

  var initTagBoxEvents = function(options) {
    var ctx = this;
    if(Meteor.isClient) {
      var events = {}
      var taggleInput = ".taggle_input";
      var supertagsAcItemClass = "supertags-ac-item";
      var supertagsSelectedItemClass = "supertags-selected"

      var hideTimeout = null;

      events["keyup " + taggleInput] = function(e,t) {
        var elem = e.currentTarget;
        var text = $(taggleInput).val();
console.log('setting text filter')
        textFilter.set(text);
        console.log(ctx.autocompleteTextFilter)
      }

      events["keydown " + taggleInput] = function(e,t) {
        var keyCode = e.keyCode;
        var elem = e.currentTarget;
        var selectedItem = $("." + supertagsAcItemClass + "." + supertagsSelectedItemClass);

        if(keyCode === 38) {
          if(selectedItem.length > 0) {
            selectedItem.removeClass("supertags-selected");
            selectedItem.prev().addClass("supertags-selected");
          } else {
            // showAutoCompleteBox(elem, options.source, "100px", "100px");
            $(".supertags-ac-item").last().addClass("supertags-selected")
          }
        } else if(keyCode === 40) {
          if(selectedItem.length > 0) {
            selectedItem.removeClass("supertags-selected");
            selectedItem.next().addClass("supertags-selected");
          } else {
            // showAutoCompleteBox(elem, options.source, "100px", "100px");
            $(".supertags-ac-item").first().addClass("supertags-selected")
          }
        } else if(keyCode === 13 || keyCode === 9) {
          var text = selectedItem.text();
          if(text.length > 0) {
            //$(elem).val(text);
            taggle.add(text)
            // hideAutoCompleteBox();
          }

          selectedItem.removeClass("supertags-selected")
        } else if(keyCode === 27) {
          hideAutoCompleteBox();
        }
      }

      events["mouseover ." + supertagsAcItemClass] = function(e,t) {
        var elem = e.currentTarget;
        $(elem).addClass(supertagsSelectedItemClass);
      }

      events["mouseout ." + supertagsAcItemClass] = function(e,t) {
        var elem = e.currentTarget;
        $(elem).removeClass(supertagsSelectedItemClass);
      }

      events["click ." + supertagsSelectedItemClass] = function(e,t) {
        var elem = e.currentTarget;
        //$(taggleInput).val($(elem).text())
        taggle.add($(elem).text())
      }

      events["focus " + taggleInput] = function(e,t) {
        clearTimeout(hideTimeout)
        var elem = e.currentTarget;
        var data = options.autocomplete;
        showAutoCompleteBox.call(ctx, elem, data, "100px", "100px");
      }

      events["blur " + taggleInput] = function(e,t) {
          hideTimeout = setTimeout(function() {hideAutoCompleteBox();},100);
      }

      Template[options.inputTemplate].events(events);
    }
  }

  var initTagBoxRenders = function(options) {
    if(Meteor.isClient) {
      console.log('preparing tagboxrenders mode');
      Template[options.inputTemplate].rendered = function() {
        taggle = new Taggle(options.inputControl);
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

  var showAutoCompleteBox = function(elem, autocomplete, height,width) {
    var ctx = this;
    if($("#supertags-autocomplete").length > 0) {
      return;
    }

    var acDiv = document.createElement('div');
    acDiv.id = "supertags-autocomplete";
    acDiv.style.height = height;
    acDiv.style.width = width;
    acDiv.style.border = "1px solid black";

    acDiv.style.position = "absolute";
    acDiv.style.top = (elem.offsetTop + elem.offsetHeight) + "px";
    // acDiv.style.left = elem.offsetLeft + "px";

    $(elem).parent().append(acDiv);

    var templateName = "supertagsAutocompleteContainer";
    var itemTemplate = autocomplete.itemTemplate || "supertagsAutocompleteItem";
console.log(itemTemplate)

    var templateData;

    //data is a collection, need to filter with text provided in tag box
    if(autocomplete.data && autocomplete.data._collection) {
      Tracker.autorun(function() {
        console.log('collection')
        var filter = {};
        filter[autocomplete.lookupField] = {$regex: "^" + textFilter.get()};
        console.log(filter)
        templateData = autocomplete.data.find(filter);
        ctx._instCtx.autocompleteTextFilter.set(templateData.fetch())
      })
    }

    Blaze.renderWithData(Template[templateName], {source: templateData, itemTemplate: itemTemplate}, acDiv)

    return acDiv.id;
  }

  var hideAutoCompleteBox = function() {
    $("#supertags-autocomplete").remove();
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

  this.isShowingAutoComplete = false;

  this.constructor = function Events(options, instCtx) {
    base.constructor.call(this);
    console.log(this)
    this._instCtx = instCtx;
    this._options = options;
    var ctx = this;
    switch(options.tagMode) {
      case "tagBox":
        initTagBoxRenders.call(ctx,options);
        initTagBoxEvents.call(this, options)
        break;
      case "inline":
        initRenders.call(ctx, options);
        initEvents.call(this, options);
        break;
    }


  }
})