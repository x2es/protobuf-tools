
define(function() {

  /**
   * class MessageDecoder
   */
  function MessageDecoder(proto, opts) {

    var o = opts || {};

    this._proto = proto;
    this._abstractMessageName = o.abstract_message || 'AbstractMessage';

    var AbstactMeta = this._getProto().getMessageMeta(this._getAbstractMessageName());
    if (AbstactMeta == undefined) throw Error('abstract message "' + this._getAbstractMessageName() + '" not found in .proto');

    var abstractFields = AbstactMeta.getFields();
    if (abstractFields.length !== 1) throw Error('abstract message "' + this._getAbstractMessageName() + '" should contain only one field: payload-type');

    var payloadTypeField = abstractFields[0];
    if (payloadTypeField.type.name !== 'enum') throw Error('payload-type field "' + payloadTypeField.name + '" of abstract message "' + this._getAbstractMessageName() + '" should be Enum');

    if (payloadTypeField.options.default != undefined) throw Error('payload-type field "' + payloadTypeField.name + '" of abstract message "' + this._getAbstractMessageName() + '" should not have default value');

    this._AbstractMessage = this._getProto().getMessageMeta(this._getAbstractMessageName()).build();
    this._payloadTypeFieldName = payloadTypeField.name;

    this._payloadTypesEnum = payloadTypeField.resolvedType.build();

    this._indexPayloadMessages();
  }

  /*** private ***/
  MessageDecoder.prototype._getProto = function() { return (this._proto); }
  MessageDecoder.prototype._getAbstractMessageName = function() { return (this._abstractMessageName) }
  MessageDecoder.prototype._getAbstractMessageConstructor = function() { return (this._AbstractMessage) }

  MessageDecoder.prototype._getPayloadTypeFieldName = function() { return (this._payloadTypeFieldName); }

  MessageDecoder.prototype._getMessageConstructor = function(encodedMsg) {
    return (this._getProto().getMessageMeta('FooMessage').build());
  }

  MessageDecoder.prototype._getPayloadTypesEnum = function() { return (this._payloadTypesEnum); }

  MessageDecoder.prototype._indexPayloadMessages = function() {
    this._payloadMessagesIndex = {};

    var plMessages = this._getProto().getMessagesMeta().withField(this._getPayloadTypeFieldName());

    var abstractMessageName = this._getAbstractMessageName(),
        payloadTypeFieldName = this._getPayloadTypeFieldName(),
        payloadTypesEnum = this._getPayloadTypesEnum();
    
    for (var i = 0; i < plMessages.length; i++) { var msg = plMessages[i];
      if (msg.name === abstractMessageName) continue;
      var fields = msg.getFields();
      if (fields[0].name !== payloadTypeFieldName) throw Error('Wrong order of field "' + payloadTypeFieldName + '" in payload-message "' + msg.name + '"');

      var plFld = fields[0];

      if (plFld.options.default == undefined) throw Error('Missed default value for payload-type field "' + payloadTypeFieldName + '" on payload-message "' + msg.name + '"');

      var plValue = payloadTypesEnum[plFld.options.default];

      if (this._payloadMessagesIndex[plValue] != undefined) throw Error('Duplicated default value for payload-type field "' + payloadTypeFieldName + '" on payload-message "' + msg.name + '"');

      this._payloadMessagesIndex[plValue] = msg;
    };
  }

  MessageDecoder.prototype._getPayloadMessagesIndex = function() { return (this._payloadMessagesIndex) };

  /*** public ***/
  MessageDecoder.prototype.decode = function(encodedMsg) {
    var abstractMsg = this._getAbstractMessageConstructor().decode(encodedMsg);
    var payloadIndex = abstractMsg[this._getPayloadTypeFieldName()];
    var MsgConstructor = this._getPayloadMessagesIndex()[payloadIndex].build();
    return (MsgConstructor.decode(encodedMsg));
  }

  return(MessageDecoder);
});
