
define(['ProtoBuf'], function(ProtoBuf) {

  /* Helper definition */

  var tools = {
    messages: {
      filterByField: function(fieldName) {
        var res = [];
        
        var messages = this;
        for (var i = 0; i < messages.length; i++) { var msg = messages[i];
          var fields = msg.getChildren(ProtoBuf.Reflect.Message.Field);
          for (var j = 0; j < fields.length; j++) { var fld = fields[j];
            if (fld.name == fieldName) res.push(msg);
          };
        };

        return (res);
      },
      compareMethods: {
        'primitive': function(a, b) {
          return (a === b);
        },

        'message': function(a, b) {
          return (a.equal(b));
        },

        'longjs': function(a ,b) {
          return (a.equals(b));
        },

        'float': function(a, b) {
          // ISSUE:x2es [131206-1]: comparing should be performed with specified precision
          //                        maximum precision for float and "1.52" example is 7 digits after dot
          //                        for "43.2" example is 5 digits after dot
          var prec = 5;
          return ((a.toFixed(prec) - b.toFixed(prec)) === 0);
        },

        'double': function(a, b) {
          return ((a - b) === 0);
        }
      },
      getCompareMethod: function(fld) {
        var cmpMethod = this.compareMethods[fld.type.name];
        if (cmpMethod != undefined) return (cmpMethod);

        var longjsTypes = ['int64', 'uint64'];
        if (longjsTypes.indexOf(fld.type.name) !== -1) return (this.compareMethods['longjs']);

        return (this.compareMethods['primitive']);
      }
    }
  }

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
    ProtoBuf.Builder.prototype.getMessages = function() {
      var messages = this.lookup().getChildren(ProtoBuf.Reflect.Message);

      // TODO:x2es: make like Array class
      messages.withField = tools.messages.filterByField;
      return (messages);
    }

    // @param msgName: message name
    // @return message with given name
    ProtoBuf.Builder.prototype.getMessage = function(msgName) {
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
