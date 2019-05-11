/**
 * 
 * @param {*} parent 
 */
function interaction(parent) {
    this._options = parent.options;
    this._events = {},
        self = this,
        this._childFrames = {};
    this.ajax = {
        post: {
            method: 'POST'
        },
        get: {
            method: 'GET'
        },
        timer: 500
    };

    this.helpers = {
        draw: draw,
        pencilOnBoard: pencilOnBoard,
        clear: eraseCanvas
    };

    parent.$on('interact.send', function() {
        self.sendEvent('interaction.stack.received', {
            user: parent.options.id,
            stack: parent.stack.concat()
        });
        // clear parent stack after sending
        parent.stack = [];
    });

    // set socket
    this.socketEnabled = false;
    this.socket = {};

};

interaction.prototype.connect = function() {
    this.sendEvent('connect.child', {
        user: this._options.id,
        stack: this._options
    });
    return this;
};

interaction.prototype.createChildFrame = function(obj, dropZone) {
    this._childFrames[obj.user] = new Sketch(obj.stack, dropZone);
    return this._childFrames[obj.user];
};

interaction.prototype.destroyFrame = function(id) {
    delete this._childFrames[id];
};

interaction.prototype.sendEvent = function(evName, stack) {
    var self = this,
        options = this.ajax.post;
    options.data = {
        type: evName,
        payload: stack
    };
    if (!this.socketEnabled) {
        http(options);
    } else {
        this.socket.emit('events.received', options.data);
    }
};

interaction.prototype.watch = function() {
    var self = this;
    // start our watch
    if (!this.socketEnabled) {
        console.log('-- starting web :http long poll---');
        setInterval(function() {
            self.getEvents();
        }, this.ajax.timer);
    }

    self.getEvents();

    return this;
};

interaction.prototype.getEvents = function() {
    var options = this.ajax.get,
        self = this;
    var onEventReceived = function(response) {
        self.trigger(response.type, response.payload);
    };

    if (!this.socketEnabled) {
        http(options, onEventReceived);
    } else {
        console.log('-- starting web socket:events.received---');
        this.socket.on('events.received', onEventReceived)
    }
};

interaction.prototype.draw = function(obj) {
    var _userFrame = this._childFrames[obj.user],
        _self = this;
    if (!_userFrame) {
        return;
    }

    obj.stack.forEach(function(item) {
        _self.helpers[item.event].apply(_userFrame, item.arg);
    });
};

interaction.prototype.disconnect = function() {
    return this;
};

interaction.prototype.$on = $on;
interaction.prototype.trigger = trigger;