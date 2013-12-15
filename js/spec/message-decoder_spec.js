
define(['chai', 'protobuf-wrapper', 'message-decoder'], function(chai, ProtoBuf, MessageDecoder) {
  var expect = chai.expect;

  describe('protobuf message-decoder', function() {
    var proto, FooMessage, BarMessage, fooMessage, barMessage;
    before(function() {
      // ISSUE:x2es: tied with karma-runner environment
      proto = ProtoBuf.protoFromFile('/base/fixtures/message-decoder.proto');
      FooMessage = proto.getMessageMeta('FooMessage').build();
      BarMessage = proto.getMessageMeta('BarMessage').build();

      fooMessage = new FooMessage(); fooMessage.setFooInt(55);
      barMessage = new BarMessage(); barMessage.setBarString('to much')
    });

    describe('init', function() {

      it('should use specified proto', function() {
        var messageDecoder = new MessageDecoder(proto);
        expect(messageDecoder._getProto()).to.equal(proto);
      });

      it('should use default "AbstractMessage"', function() {
        var messageDecoder = new MessageDecoder(proto);
        expect(messageDecoder._getAbstractMessageName()).to.equal('AbstractMessage');
      });

      it('should use specified "AbstractMsg" as name of abstract message', function() {
        var messageDecoder = new MessageDecoder(proto, { abstract_message: 'AbstractMsg' });
        expect(messageDecoder._getAbstractMessageName()).to.equal('AbstractMsg');
      });

      it('should fail if specified AbstractMessage not found', function() {
        var failed = false;
        try {
          var messageDecoder = new MessageDecoder(proto, { abstract_message: 'AbsentMsg' });
        } catch(e) {
          failed = true;
        }

        expect(failed).to.equal(true);
      });

      it('should retrieve AbstractMessage constructor', function() {
        var decoderWithDefault = new MessageDecoder(proto);
        expect(decoderWithDefault._getAbstractMessageConstructor()).to.exist;

        var decoderWithCustom = new MessageDecoder(proto, { abstract_message: 'AbstractMsg' });
        expect(decoderWithCustom._getAbstractMessageConstructor()).to.exist;
      });

      it('should fail if abstract message contains more or less than one field', function() {
        var fail = false, decoder;
        try {
          decoder = new MessageDecoder(proto, { abstract_message: 'WrongAbstractEmpty' });
        } catch(e) {
          fail = true;
        }
        expect(fail).to.equal(true, 'when less');

        fail = false;
        try {
          decoder = new MessageDecoder(proto, { abstract_message: 'WrongAbstractMoreFields' });
        } catch(e) {
          fail = true;
        }
        expect(fail).to.equal(true, 'when more');
      });

      it('should retreive payload-type field name', function() {
        var decoder = new MessageDecoder(proto);
        expect(decoder._getPayloadTypeFieldName()).to.equal('payloadType', 'default');

        decoder = new MessageDecoder(proto, { abstract_message: 'AbstractMsg' });
        expect(decoder._getPayloadTypeFieldName()).to.equal('customPlType', 'custom')
      });

      it('should fail if payload-type field not Enum', function() {
        var fail = false, decoder;
        try {
          decoder = new MessageDecoder(proto, { abstract_message: 'WrongAbstractNotEnum' });
        } catch (e) {
          fail = true;
        }
        expect(fail).to.equal(true);
      });
      
      it('should fail if payload-type field has default value', function(){
        var fail = false, decoder;
        try {
          decoder = new MessageDecoder(proto, { abstract_message: 'WrongAbstractWithDefault' });
        } catch (e) {
          fail = true;
        }
        expect(fail).to.equal(true);
      });

      it('should fail if payloadType-field in payload-message not first', function() {
        var fail = false, decoder;
        try {
          decoder = new MessageDecoder(proto, { abstract_message: 'AbstractForWrongPayloadPosition' });
        } catch (e) {
          fail = true;
        }
        expect(fail).to.equal(true);
      });

      it('should fail if payloadType-field in payload-message has no default value', function() {
        var fail = false, decoder;
        try {
          decoder = new MessageDecoder(proto, { abstract_message: 'AbstractForPayloadWODefault' });
        } catch (e) {
          fail = true;
        }
        expect(fail).to.equal(true);
      });

      it('should retreive payload-types enum', function() {
        var decoder = new MessageDecoder(proto);
        expect(decoder._getPayloadTypesEnum()).to.have.keys('MSG_FOO', 'MSG_BAR');

        decoder = new MessageDecoder(proto, { abstract_message: 'AbstractMsg' });
        expect(decoder._getPayloadTypesEnum()).to.have.keys('MSG_CUS_FOO', 'MSG_CUS_BAR');
      });

      it('should fail if payloadType-field in payload-message has duplicate default value', function() {
        var fail = false, decoder;
        try {
          decoder = new MessageDecoder(proto, { abstract_message: 'AbstractForDupDefault' });
        } catch (e) {
          fail = true;
        }
        expect(fail).to.equal(true);
      });

      it('should index available payload messages', function() {
        var decoder = new MessageDecoder(proto);
        var msgIndex = decoder._getPayloadMessagesIndex();
        expect(msgIndex[11]).to.equal(proto.getMessageMeta('FooMessage'));
        expect(msgIndex[22]).to.equal(proto.getMessageMeta('BarMessage'));
      });

    });

    describe('.decode()', function() {

      var messageDecoder;
      before(function() {
        messageDecoder = new MessageDecoder(proto);
      });

      // ISSUE:x2es: .toArrayBuffer tied with browser environment
      // TODO:x2es: fix tests for node.js environment
      it('should decode FooMessage encoded by .toArrayBuffer() message', function() {
        var decodedFoo = messageDecoder.decode(fooMessage.toArrayBuffer());
        expect(decodedFoo.equal(fooMessage)).to.equal(true, 'fooMessage');
      });

      it('should decode BarMessage encoded by .toArrayBuffer() message', function() {
        var decodedBar = messageDecoder.decode(barMessage.toArrayBuffer());
        expect(decodedBar.equal(barMessage)).to.equal(true, 'barMessage');
      });
    });

  }); // protobuf message-decoder

}); 
