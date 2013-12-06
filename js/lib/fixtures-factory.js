
/**
 * Simple fixtures factory for testing ProtoBuf
 *
 * WARINGIN: it is not production module, it has no test-coverage and was implemented for solving minor issues
 *           it is simple as possible
 *
 * deps: lodash
 */


define(['lodash'], function(_) {

  function getRandomString(minCharsCount, maxCharsCount) {
    var chCnt = _.random(minCharsCount, maxCharsCount);
    var chars = '0123456789abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var str = '';
    for (var i = 1; i < chCnt; i++) {
      str += chars[_.random(0, chars.length-1)];
    };
    return (str);
  }

  var fixturesFactory = {
    generateForField: function(fld) {
      switch (fld.type.name) {
        case 'int32':
        case 'int64':
          return (_.random(-1024, 1024));
        break;
        case 'uint32':
        case 'uint64':
          return (_.random(0, 1024));
        break;
        case 'string':
          return (getRandomString(5, 15));
        break;
        case 'float':
        case 'double':
          return (Math.random() * 100);
        break;
        case 'bool':
          return ([false, true][_.random(0,1)]);
        break;
        case 'enum':
          return (fixturesFactory.generateForEnum(fld.resolvedType));
        break;
        case 'message':
          return (fixturesFactory.buildMsgInstance(fld.resolvedType));
        break;
        default: console.error('generation not implemented for type', fld.type.name); console.trace();
      }

    },

    generateForEnum: function(enumClass) {
      var enumObj = enumClass.build();
      var keys = Object.keys(enumObj);
      var i = _.random(0, keys.length-1);
      return (enumObj[keys[i]]);
    },

    /*
     * @param msg [MessageMeta]
     * @param skipFields [Array] of fields name for skipping
     */
    buildMsgInstance: function(msg, skipFields) {
      var msgMeta = msg;
      var msgConstructor = msgMeta.build();
      var msg = new msgConstructor();

      var fields = msgMeta.getFields();

      for (var i = 0; i < fields.length; i++) { var fld = fields[i];
        // available rigMsg);fields on fld:
        //   fld.name
        //   fld.type.name:  int32, string... etc, OR message, enum
        //   fld.repeated
        //   fld.resolvedType refres to related type; it is null when type is like int32 and similar
        //   ... other

        if (typeof skipFields != 'undefined' && skipFields.indexOf(fld.name) !== -1) continue;  // skip - should not be filled
        if (!_.isArray(msg[fld.name]) && msg[fld.name] != undefined) continue;   // skip filled fields

        if (fld.repeated) {
          var itemsCnt = _.random(1, 5);
          for (var j = 0; j < itemsCnt; j++) {
            msg[fld.name].push(fixturesFactory.generateForField(fld));
          };
        } else {
          msg.set(fld.name, fixturesFactory.generateForField(fld));
        }

      };
      return (msg);
    }
  }
  
  return (fixturesFactory);
});


