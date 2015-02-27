SuperTags.Events = ClassX.extend(SuperTags.Class, function(base){

  var initEvents = function(options) {
    var ctx = this;
    if(Meteor.isClient) {

      var events = {};
      events['keydown #' + options.inputControl] = function(e,t) {
        var keyCode = e.keyCode;

        if(_.indexOf(options.submitKeys, keyCode) >= 0) {
          e.preventDefault();
          e.stopPropagation();

          tagText(options.inputControl, e, t);

          return false;
        }
      }

      events['keyup #' + options.inputControl] = function(e,t) {
        $("#" + options.inputControl + " span").each(function() {
          console.log('a')
          var sel = window.getSelection();
          var range = sel.getRangeAt(0);

          var sc = range.startContainer;
          var myText = sc.nodeValue;

          if($(this).text().length === 0 || $(this).text() === "x") {
            $(this).remove();
          }
        })

        var iControl = $("#" + options.inputControl);
        // iControl.children().each(function() {
        //   if(!$(this).hasClass('block')) {
        //     console.log('b')
        //     var sel = window.getSelection();
        //     var range = sel.getRangeAt(0);
        //     var sc = range.startContainer;

        //     var txtNode = document.createTextNode($(this).text())
        //     $(this).replaceWith(txtNode);

        //     // range.setStartAfter(txtNode);
        //     // range.setEndAfter(txtNode);
        //     // range.collapse(false);

        //     // sel.removeAllRanges();
        //     // sel.addRange(range);
        //   }
        // })

        if(iControl.text().trim().length === 0) {
          console.log('c')
          var sel = window.getSelection();
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

    var myText = sc.nodeValue.trim();

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

  this.constructor = function Events(options, ctx) {
    base.constructor.call(this);
    console.log('event options', options)
    initRenders.call(ctx, options);
    initEvents.call(ctx, options);
  }
})