# jeli.sketch

Minimal javascript framework for drawing or signing signatures.

## Getting started
```
  npm install jeli.sketch
```
### How to use
 create the sketch instance
```javascript
  var tool = new jsketch({width: 800}, dropZone);
    tool.init(function() {
      // so something
    });
 ```
 ### How to interract with other sketch
 run the sketch server.js file to start sketch socket
 ```javascript
    var socket = io.connect(ip);
    socket.emit('device.role', {
        isAdmin: false
    });
    var interractor = tool.interact();
    // pass the socket to interractor instance
    interractor.socketEnabled = true;
    interractor.socket = socket;
    // connet and watch for incomming events
    interractor
        .connect()
        .watch();
 ```
 
 ### And that's all folks

[Playground ](https://gojecks.github.io/jeli.sketch/playground/)
