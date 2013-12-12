
/**
 * NOTE:x2es: this tests has weak side - it using API added by protobuf-wrapper, which under this testing
 *            if this API will fail, then other tests may fail to.
 *            Check API first (proto.getMessage(), getMessages(), .withField(), ...).
 */

define(['chai', 'protobuf-wrapper', 'fixtures-factory'], function(chai, ProtoBuf, fixturesFactory) {
  var expect = chai.expect;

  describe('protobuf-wrapper', function() {

    var proto = null;
    before(function() {
      // ISSUE:x2es: tied with karma-runner environment
      proto = ProtoBuf.protoFromFile('/base/fixtures/sample1.proto');
    });

    it('should reencode int32', function() {
      var MsgConstructor = proto.getMessageMeta('MessageWithIntegers32').build();
      var msg = new MsgConstructor();

      msg.setInt32(34);
      msg.setUint32(43);

      var msg2 = MsgConstructor.decode(msg.encode());
      expect(msg.equal(msg2)).to.equal(true);
    });

    it('should reencode int64', function() {
      var MsgConstructor = proto.getMessageMeta('MessageWithIntegers64').build();
      var msg = new MsgConstructor();

      msg.setInt64(34);
      msg.setUint64(43);

      var msg2 = MsgConstructor.decode(msg.encode());
      expect(msg.equal(msg2)).to.equal(true);
    });

    // NOTE:x2es [issue#131205-1]: ProtoBuf.js has reintroduced error on encoding float/double values
    //                        seems method Message.prototype.encode should to use (new ByteBuffer().LE())
    //     SOLVED: .decode() should be called on Constructor instead of Meta
    it('should reencode floats (eq through wrapper.equal())', function() {
      var MsgConstructor = proto.getMessageMeta('MessageWithFloats').build();
      var msg = new MsgConstructor();

      msg.setFloat(parseFloat(12.52));
      msg.setDouble(parseFloat(143.21435));

      var msg2 = MsgConstructor.decode(msg.encode());
      expect(msg.equal(msg2)).to.equal(true);
    });

    it('should reencode float', function() {
      var MsgConstructor = proto.getMessageMeta('FloatMessage').build();
      var msg = new MsgConstructor();

      msg.setFldFloat(1.52);

      var msg2 = MsgConstructor.decode(msg.encode());

      // ISSUE:x2es [131206-1]: comparing should be performed with specified precision
      //                        maximum precision for float and "1.52" example is 7 digits after dot
      var prec = 7;
      expect(msg.fldFloat.toFixed(prec) - msg2.fldFloat.toFixed(prec)).to.equal(0);
    });

    it('should reencode double', function() {
      var MsgConstructor = proto.getMessageMeta('DoubleMessage').build();
      var msg = new MsgConstructor();

      msg.setFldDouble(1.52);

      var msg2 = MsgConstructor.decode(msg.encode());
      expect(msg.fldDouble).to.equal(msg2.fldDouble);
    });

    it('should reencode nested float', function() {
      var MsgMainConstr = proto.getMessageMeta('NestedFloatMessage').build(),
          MsgEmbedConstr = proto.getMessageMeta('FloatMessage').build(),
          
          msgMain = new MsgMainConstr(),
          msgEmbed = new MsgEmbedConstr();

      msgEmbed.setFldFloat(1.52);
      msgMain.setFldFloatMsg(msgEmbed);

      var msg2 = MsgMainConstr.decode(msgMain.encode());

      // ISSUE:x2es [131206-1]: comparing should be performed with specified precision
      //                        maximum precision for float and "1.52" example is 7 digits after dot
      var prec = 7;
      expect(msgMain.fldFloatMsg.fldFloat.toFixed(prec) - msg2.fldFloatMsg.fldFloat.toFixed(prec)).to.equal(0);
    });

    it('should reencode nested double', function() {
      var MsgMainConstr = proto.getMessageMeta('NestedDoubleMessage').build(),
          MsgEmbedConstr = proto.getMessageMeta('DoubleMessage').build(),
          
          msgMain = new MsgMainConstr(),
          msgEmbed = new MsgEmbedConstr();

      msgEmbed.setFldDouble(1.52);
      msgMain.setFldDoubleMsg(msgEmbed);

      var msg2 = MsgMainConstr.decode(msgMain.encode());

      expect(msgMain.fldDoubleMsg.fldDouble - msg2.fldDoubleMsg.fldDouble).to.equal(0);

    });

    describe('features', function() {
      describe('.meta linked to message-meta-class', function() {

        var SampleOneMeta = null,
            SampleOne = null,
            sampleOne = null;

        before(function() {
          SampleOneMeta = proto.lookup().getChild('SampleOne');
          SampleOne = SampleOneMeta.build();    // Class/Constructor
          sampleOne = new SampleOne();          // instance
        });

        it('should provide .meta on message instance', function() {
          expect(sampleOne.__msg_meta).to.exist;
          expect(sampleOne.__msg_meta).to.equal(SampleOneMeta, 'should point to meta-class');
        });

        it('should provide .meta on Class/Constructor of message', function() {
          expect(SampleOne.prototype.__msg_meta).to.exist;
          expect(SampleOne.prototype.__msg_meta).to.equal(SampleOneMeta);
        });
      });

      describe('helpers', function() {
        it('should list all available messages-meta', function() {
          var expected = proto.lookup().getChildren(ProtoBuf.Reflect.Message);
          expect(proto.getMessagesMeta()).to.have.members(expected);
        });

        it('should find message-meta by name', function() {
          expect(proto.getMessageMeta('SampleOne')).to.equal(proto.lookup().getChild('SampleOne'));
        });

        it('should list available messages-meta having field with specified name', function() {
          var p = proto.lookup();
          var expected = [
            p.getChild('SharedFieldOne'),
            p.getChild('SharedFieldTwo')
          ];

          expect(proto.getMessagesMeta().withField('sharedField')).to.have.members(expected);
        });

        it('should list fields-meta of message-meta', function() {
          var msgMeta = proto.lookup().getChild('SharedFieldOne');
          var expected = msgMeta.getChildren(ProtoBuf.Reflect.Message.Field);

          expect(msgMeta.getFields()).to.have.members(expected);
        });

        it('should find field-meta by field name on message-meta', function() {
          var msgMeta = proto.lookup().getChild('SharedFieldOne');
          expect(msgMeta.getField('otherField')).to.equal(msgMeta.getChild('otherField'));
        });
      });

      describe('tools', function() {
        describe('compare two messages instances', function() {
          it('should be false for defferent messages types', function() {
            var sampleOne = new (proto.getMessageMeta('SampleOne').build());
            var sampleTwo = new (proto.getMessageMeta('SampleTwo').build());

            expect(sampleOne.equal(sampleTwo)).to.equal(false);
          });

          describe('deep compare', function() {
            it('should be false on different primitive types', function() {
              var MsgConstructor = proto.getMessageMeta('SampleTwo').build(),
                  msgOne = new MsgConstructor(),
                  msgTwo = new MsgConstructor();

              msgOne.setFldname(1);
              msgTwo.setFldname(2);

              expect(msgOne.equal(msgTwo)).to.equal(false);
            });

            it('should be true on same primitive types', function() {
              var MsgConstructor = proto.getMessageMeta('SampleTwo').build(),
                  msgOne = new MsgConstructor(),
                  msgTwo = new MsgConstructor();

              msgOne.setFldname(2);
              msgTwo.setFldname(2);

              expect(msgOne.equal(msgTwo)).to.equal(true);
            });
            
            it('should be false on different message-types', function() {
              var MsgParent = proto.getMessageMeta('SimpleEmbedTest').build();
              var MsgChild = proto.getMessageMeta('SampleTwo').build();
              var msgOne = new MsgParent();
              var msgChild = new MsgChild();

              msgChild.setFldname(4);
              msgOne.setEmbed(msgChild);

              var msgTwo = MsgParent.decode(msgOne.encode());
              msgTwo.getEmbed().setFldname(6);
              expect(msgOne.equal(msgTwo)).to.equal(false);
            });

            it('should be false when repeated length is different', function() {
              var MsgConstructor = proto.getMessageMeta('RepeatedFieldsTest').build();
              var msgOne = new MsgConstructor();
              var msgTwo = new MsgConstructor();

              msgOne.repeatedInt.push(1);
              msgOne.repeatedInt.push(2);

              msgTwo.repeatedInt.push(1);

              expect(msgOne.equal(msgTwo)).to.equal(false);
            });

            it('should be false on first different element in repeated for primitive types', function() {
              var MsgConstructor = proto.getMessageMeta('RepeatedFieldsTest').build();
              var msgOne = new MsgConstructor();
              var msgTwo = new MsgConstructor();

              msgOne.setRepeatedInt([5,7,12,45]);
              msgTwo.setRepeatedInt([5,7,13,45]);

              expect(msgOne.equal(msgTwo)).to.equal(false);
            });

            it('should be false on first different element in repeated for message-type', function() {
              var MsgConstructor = proto.getMessageMeta('RepeatedFieldsTest').build();
              var MsgChildConstructor = proto.getMessageMeta('SampleTwo').build();
              var msgOne = new MsgConstructor();
              var msgChild = new MsgChildConstructor();

              for (var i = 0; i < 5; i++) {
                var msgChild = new MsgChildConstructor();
                msgChild.setFldname(i);
                msgOne.repeatedMessage.push(msgChild);
              };

              var msgTwo = MsgConstructor.decode(msgOne.encode());
              msgTwo.repeatedMessage[3].setFldname(17);

              expect(msgOne.equal(msgTwo)).to.equal(false);
            });

            describe('random-data tests', function() {
              var msgSource = null,
                  msgCopy = null,
                  msgDiffer = null;

              beforeEach(function() {
                // it's complex message with 2-level nested sub-messages and several repeated fields
                var testerMeta = proto.getMessageMeta('CopyTesterMessage');
                var TesterConstructor = testerMeta.build();

                // WARN:x2es: fixturesFactory has no test-coverage
                msgSource = fixturesFactory.buildMsgInstance(testerMeta);
                msgCopy = TesterConstructor.decode(msgSource.encode());
                msgDiffer = fixturesFactory.buildMsgInstance(testerMeta);
              });

              // ISSUE:x2es: it fails when SimpleInnerMessage has float field
              it('should equal to copy', function() {
                expect(msgSource.equal(msgCopy)).to.equal(true);
              });

              it('should not equal to different', function() {
                expect(msgSource.equal(msgDiffer)).to.equal(false);
              });

              it('should not equal to modified copy', function() {
                msgCopy.deepEmbedded.embedded.string += ' changes!';
                expect(msgSource.equal(msgCopy)).to.equal(false);
              })
            });

          });
        });
      });
    });
  });

});
