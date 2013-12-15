
ProtoBuf Tools
==============

This is set of tools over dcodeIO/ProtoBuf (https://github.com/dcodeIO/ProtoBuf.js) implementation of "Protocol Buffers" (https://code.google.com/p/protobuf/).

Main part of this tools is protobuf-wrapper.js which transparently extends original implementation by some service functions and solves some issues.
Also this package contains:
 * fixtures-factory.js
 * message-decoder.js

## NOTES

### Comparing 'float' not working in this version

Current version of protobuf-wrapper compares floats with fixed precision. Working on this issue in progress.
As result this version of protobuf-wrapper (in particular ``message.equal(anotherMessage)``) may working incorrectly and unexpectedly with 'float' type.

Working with another types is good including 'double'.

### Tested only in browser environment

Adoptation to Node.js or other AMD environment needs some fixes.

## protobuf-wrapper.js

### Target

Wrap Java-style reflecton style to more comfortable API.

See UserStories.md and test specs for details.

### Method

Wrapper implemented as proxy to original dcodeIO/ProtoBuf solution. Wrapper includes as dependency original dcodeIO/ProtoBuf and then extend it by several methods.

### Environment

ProtoBuf Wrapper are intended to using in AMD environment. Support of shim and CommonJS may be added on demand.

Testing environment is mocka+karma.

### Using

Just include protobuf-wrapper.js instead original ProtoBuf.js and use features from both libraries.

    define(['protobuf-wrapper'], function(ProtoBuf) { ... });

#### Features added by protobuf-wrapper.js

##### Accessing message meta-information

For all messages classes added property `__msg_meta` which points to original meta-class defined in dcodeIO/ProtoBuf

    // original ProtoBuf syntax
    var proto = ProtoBuf.protoFromFile('/path/to/the.proto'),
        MsgMeta = proto.lookup().getChild('SomeMessage'),
        MsgConstructor = MsgMeta.build(),
        msg = new MsgConstructor();

    // protobuf-wrapper adds posibility to access MsgMeta 
    // through MsgConstructor or msg instance like this:
    assert.equal(msg.__msg_meta, MsgMeta);
    assert.equal(MsgConstructor.prototype.__msg_meta, MsgMeta);

##### Shortcuts to members

Finding message from above example may be rewrited shortly with protobuf-wrapper:

    var proto = ProtoBuf.protoFromFile('/path/to/the.proto'),
        MsgMeta = proto.getMessage('SomeMessage');

Also possible easy finding all available messages like this:

    var messages = proto.getMessages();

or finding messages with some field

    var payloadMessages = proto.getMessages().withField('payloadType');

Fields of each message-meta may be found like this:

    var proto = ProtoBuf.protoFromFile('/path/to/the.proto'),
        MsgMeta = proto.getMessage('SomeMessage');

    var fields = MsgMeta.getFields();
    var fieldName = MsgMeta.getField('name');

##### Deep equal of two messages by fields values

    var MsgConstructor = MsgMeta.build(),
        msg1 = new MsgConstructor();
    
    var msg2 = MsgConstructor.decode(msg1.encode());      
    // NOTE: MsgMeta also have method .decode() but it cause problem with float/double types.

    assert.truly(msg1.equal(msg2));

## message-decoder.js

It is helper which cares about recognize correct type of incomming message.
It relies on following concept:
 * Messages which may be directly encoded/decoded and sent named as "payload messages" (just term for documentation);
 * All payload messages should have messageType field with same name for all messages. Also it should be first field on all payload messages;
 * messageType field should be enum;
 * for each payload message message type should have default value in .proto referenced through enum;
 * .proto should contain AbstractMessage with have only one field: messageType (in case of AbstractMessage messageType should not have default value);

### Usage:

**.proto**

    // this enum should contain unique values for all available payload messages types
    enum PayloadType {
        MSG_FOO = 11;
        MSG_BAR = 22;
    }    

    // this is not payload message, it will not be encoded/decoded directly, it will be used inside another messages
    message NotPayLoad {
        optional string name = 1;
        ....
    }

    // this is abstract message which will help with recognizing type of certain message
    message AbstractMessage {
        optional PayloadType payloadType = 1;     // required/optional here and in other messages does not matter
    }

    // this is regular messages
    message FooMessage {
        optional PayloadType payloadType = 1 [default = MSG_FOO];
        optional int32 value = 2;
        ....
    }

    message BarMessage {
        optional PayloadType payloadType = 1 [default = MSG_BAR];
        optional string city = 2;
        optional NotPayLoad innerMessage = 3;
    }

**JavaScript**

    // assuming we loaded protocol like this
    var proto = ProtoBuf.protoFromFile('our.proto');

    // then we can get message decoder for loaded proto
    // constructor with single parameter assuming to using message with name 'AbstractMessage' for recognizing type of message
    var messageDecoder = new MessageDecoder(proto);

    // if abstract message named differently it possbile to pass extra options to .build()
    var messageDecoder = new MessageDecoder(proto, { abstract_message: 'CustomAbstractMessage' });

    // for example we have FooMessage which we encoded and sent
    var FooMessage = proto.getMessageMeta('FooMessage').build();
    var fooMessage = new FooMessage();
    ....
    
    var encoded = fooMessage.toArrayBuffer();   // for browser case

    // then we can decode it like this
    // in this case receivedMessage will be decoded instance of FooMessage
    var receivedMessage = messageDecoder.decode(encode);

### How it works?

To build message decoder we need only instance of loaded .proto and name of message which will be used as abstract message.

Factory will find name of payloadType field - it is may be any (while it is single field in abstract message). Also factory will find reference to PayloadType enum.

After this factory will index all available messages which contains payloadType and will link each with corresponding ID from PayloadType Enum. Indexing method will observe default value of payloadType field and map it with certain type of message.

After all this any payload message may be recognized by value of payloadType.

## fixtures-factory.js

fixtures-factory.js provides simple builder-method for generating fixtures data on given MessageMeta. Builder supports nested messages and enum's.

Usage:

    define(['protobuf-wrapper', 'fixtures-factory'], function(ProtoBuf, fixturesFactory) {
      var proto = ProtoBuf.protoFromFile('/path/to/the.proto'),
          MsgMeta = proto.getMessage('SomeMessage');
      
      var msg = fixturesFactory.buildMsgInstance(MsgMeta);
    });

## Development setup

    $ git clone ...
    $ cd .../proto-buf-wrapper
    $ npm install

## Run tests with karma

    $ cd .../proto-buf-wrapper

then

    $ karma start


## Maintenance

I am maintaining this solution in scope of requirements and terms of my commercial project and until this features will not be included into original dcodeIO/ProtoBuf project.

If you need extra features - open issue, but rather, make pull request. I am will not accept pull requests without test coverage.
