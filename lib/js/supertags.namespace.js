SuperTags = new ClassX.Class();
SuperTags.Collections = {};

SuperTags.settings = {
  trace: null,
  events: {
    tag: {name: "tag", global: "false"},
    trace: {name: "trace", global: "false"},
    route: {name: "route", global: "false"},
    notify: {name: "notify", global: "false"}
  }
};

SuperTags.Class = new ClassX.extend(ClassX.Class,function(base) {
  Object.defineProperty(this,"namespace", {get: function() {return SuperTags; }});

  this.raiseEvent = function(type, data) {
    var settings = this.namespace.settings.events[type];
    if(settings) {
      data.__ctx = this.__ctx;
      this.namespace.raiseEvent(settings.name, data, settings.global)
    }
  };

  this.namespaceInit = false;

  this.init = function() {
    if(this.namespaceInit)
      return;

    this.namespaceInit = true;
  }

  this.constructor = function Class(options) {
    if(base && base.constructor) base.constructor.call(this);

    
  }
});