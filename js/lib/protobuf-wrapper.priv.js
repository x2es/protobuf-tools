
/**
 * this is extracted private context of protobuf-wrapper.js
 * Such extractions was necessary for TDD
 */

define(['ProtoBuf'], function(ProtoBuf) {
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
          console.warn('protobuf-wrapper: float comparing performing with fixed precision = 5!');
          var prec = 5;
          return ((a.toFixed(prec) - b.toFixed(prec)) === 0);
        },

        'double': function(a, b) {
          return ((a - b) === 0);
        }
      },

      wrapComparer: function(comparer) {
        return (function(a, b) {
          if (a == undefined || b == undefined) return (a === b);
          return(comparer(a, b));
        });
      },

      getCompareMethod: function(fld) {
        var comparer = (function (o) {
          var cmpMethod = o.compareMethods[fld.type.name];
          if (cmpMethod != undefined) return (cmpMethod);
          
          var longjsTypes = ['int64', 'uint64'];
          if (longjsTypes.indexOf(fld.type.name) !== -1) return (o.compareMethods['longjs']);

          return (o.compareMethods['primitive']);
        })(this);

        return (this.wrapComparer(comparer));
      }
    }
  }
  
  return (tools);
});
