
ProtoBuf Tools
==============

This is set of tools over dcodeIO/ProtoBuf (https://github.com/dcodeIO/ProtoBuf.js) implementation of "Protocol Buffers" (https://code.google.com/p/protobuf/).

Main part of this tools is protobuf-wrapper.js which transparently extends original implementation by some service functions and solves some issues.

## NOTE

This version (v0.0.1) of protobuf-wrapper works correctly with float/double only on patched version of dcodeIO/ProtoBuf. Workin on this issue in progress.

## Target

Wrap Java-style reflecton style to more comfortable API.

See UserStories.md and test specs for details.

## Method

Wrapper implemented as proxy to original dcodeIO/ProtoBuf solution. Wrapper includes as dependency original dcodeIO/ProtoBuf and then extend it by several methods.

## Environment

ProtoBuf Wrapper are intended to using in AMD environment. Support of shim and CommonJS may be added on demand.

Testing environment is mocka+karma.

## Using

Just include protobuf-wrapper.js instead original ProtoBuf.js and use it features from both libraries.

    define(['protobuf-wrapper'], function(ProtoBuf) { ... });

### Features added by protobuf-wrapper.js

#### Accessing message meta-information

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

#### Shortcuts to members

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

#### Deep equal of two messages by fields values

    var MsgConstructor = MsgMeta.build(),
        msg1 = new MsgConstructor();
    
    var msg2 = MsgMeta.decode(msg1.encode());

    assert.truly(msg1.equal(msg2));

### Additional tools

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
