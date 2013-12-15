
define(['ProtoBuf', 'protobuf-wrapper.priv'], function(ProtoBuf, privContext) {

  // @see protobuf-wrapper.priv.js
  // it is private context extracted to sandalone AMD module
  // for TDD purposes
  var tools = privContext;

  /* Changes definition */

  // wraps ProtoBuf.Reflect.Message.prototype.build and exend it's result by attaching __msg_meta property
  function attachMsgMetaToBuildedObject() {
    var originalMessageBuilder = ProtoBuf.Reflect.Message.prototype.build;
    ProtoBuf.Reflect.Message.prototype.build = function() {
      var MessageClass = originalMessageBuilder.apply(this, arguments);
      var MessageMeta = this;
      MessageClass.prototype.__msg_meta = MessageMeta;
      return (MessageClass);
    }
  }

  // attaches helpers methods
  // * getMessage(name): returns message with given name
  function attach_helpers() {
    // @return all available messages
    ProtoBuf.Builder.prototype.getMessagesMeta = function() {
      var messages = this.lookup().getChildren(ProtoBuf.Reflect.Message);

      // TODO:x2es: make like Array class
      messages.withField = tools.messages.filterByField;
      return (messages);
    }

    // @param msgName: message name
    // @return message with given name
    ProtoBuf.Builder.prototype.getMessageMeta = function(msgName) {
      return (this.lookup().getChild(msgName));
    }

    ProtoBuf.Reflect.Message.prototype.getFields = function() {
      return (this.getChildren(ProtoBuf.Reflect.Message.Field));
    }

    ProtoBuf.Reflect.Message.prototype.getField = function(fieldName) {
      return (this.getChild(fieldName));
    }

    ProtoBuf.Builder.Message.prototype.equal = function(msgRvalue) {
      var msgLvalue = this;
      if (msgLvalue.__msg_meta !== msgRvalue.__msg_meta) return (false);  // different types

      var commonMeta = msgLvalue.__msg_meta;
      var fields = commonMeta.getFields();

      for (var i = 0; i < fields.length; i++) { var fld = fields[i];

        var lvalue = msgLvalue.get(fld.name),
            rvalue = msgRvalue.get(fld.name);

        var compareMethod = tools.messages.getCompareMethod(fld);
        
        if (fld.repeated) {
          if (lvalue.length !== rvalue.length) return (false);

          for (var j = 0; j < lvalue.length; j++) { 
            if (compareMethod(lvalue[j], rvalue[j]) === false) return (false);
          };
        } else {
          if (compareMethod(lvalue, rvalue) === false) return (false);
        }
      };

      return (true);
    }
  }

  /* changes application */
  attachMsgMetaToBuildedObject();
  attach_helpers();

  return (ProtoBuf);
});
