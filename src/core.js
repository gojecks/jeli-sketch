    /**
     * Core Sketch
     * @param {*} options 
     * @param {*} dropZone
     * 
     * dependencies
     * @extend
     */
    var flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        dot_flag = false;

    var canvasDrawingX = "black",
        canvasDrawingY = 2;

    function Sketch(options, dropZone) {
        var defaultOptions = {
                width: 500,
                height: 500,
                id: '_canvas_' + +new Date
            },
            _options = extend(true, defaultOptions, (options || {}));

        var ret = new publicApi();
        ret.options = _options;
        /**
         * generate our canvas
         * for drawing
         */
        var canvas = document.createElement('canvas');
        for (var prop in _options) {
            canvas.setAttribute(prop, _options[prop]);
        }

        /**
         * Assign the canvas to our Sketch Instance
         */
        ret.canvas = canvas;
        ret.ctx = ret.canvas.getContext("2d");

        if (dropZone) {
            dropZone.appendChild(ret.canvas);
        }

        return ret;
    }

    /**
     * Sketch Public Instance
     */
    function publicApi() {
        // default colors
        this.colors = ["black", "green", "blue", "red", "orange", "white", "gray", "purple"];
        this.size = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
        this.stack = [];
        this._events = {};
    };
    /**
     * @method: addColor
     */
    publicApi.prototype.addColor = function(color) {
        if (!this.colors.indexOf(color) > -1) {
            this.colors.push(color);
        }

        return this;
    };

    publicApi.prototype.setPenSize = function(size) {
        if (size === 'default') {
            canvasDrawingY = 2;
        } else {
            canvasDrawingY = parseInt(size);
        }
    }

    publicApi.prototype.setColor = function(color) {
        if (this.colors.indexOf(color) > -1 || color === 'white') {
            canvasDrawingX = color;
            if (color === "white") {
                canvasDrawingY = 14;
            } else {
                canvasDrawingY = 2;
            }
        }

        return this;
    };

    publicApi.prototype.reScale = function(obj) {
        if (this.options.id == obj.user) {
            this.canvas.width = obj.stack.width;
            this.canvas.height = obj.stack.height;
        }
    };

    publicApi.prototype.erase = function() {
        eraseCanvas.call(this);
        this.stack.push({
            event: "clear"
        });
        this.trigger('interact.send');
        this.stack = [];
    };

    publicApi.prototype.init = function(CB) {
        var _self = this;
        this.addEventListener(["mousemove", "mousedown", "mouseup", "mouseout", "touchstart", "touchmove", "touchend"], function(e) {
            findxy.call(_self, e)
        }, false);

        // trigger our callback
        (CB || function() {})();

        return this;
    };

    publicApi.prototype.addStyle = function(css) {
        // set the styles
        if (css) {
            for (var prop in css) {
                this.canvas.style[prop] = css[prop];
            }
        }

        return this;
    };

    publicApi.prototype.addEventListener = function(events, fn) {
        var self = this;
        if (typeof events === "object") {
            events.forEach(function(evName) {
                self.canvas.addEventListener(evName, fn);
            });
        } else {
            self.canvas.addEventListener(events, fn);
        }

        return this;
    };

    function eraseCanvas() {
        this.ctx.clearRect(0, 0, this.options.width, this.options.height);
    }


    function draw(prevX, prevY, currX, currY, x, y, pushToStack) {
        this.ctx.beginPath();
        this.ctx.moveTo(prevX, prevY);
        this.ctx.lineTo(currX, currY);
        this.ctx.strokeStyle = x;
        this.ctx.lineWidth = y;
        this.ctx.stroke();
        this.ctx.closePath();

        // push the result to stack
        if (pushToStack) {
            this.stack.push({
                arg: [prevX, prevY, currX, currY, x, y, false],
                event: "draw"
            });
        }

        this.trigger('interact.send');
    }

    function pencilOnBoard(x, currX, currY, pushToStack) {
        this.ctx.beginPath();
        this.ctx.fillStyle = x;
        this.ctx.fillRect(currX, currY, 2, 2);
        this.ctx.closePath();


        if (pushToStack) {
            this.stack.push({
                event: "pencilOnBoard",
                arg: [x, currX, currY]
            });
        }

        this.trigger('interact.send');
    }




    publicApi.prototype.getDataURL = function(CB) {
        var dataURL = this.canvas.toDataURL();
        // trigger our callback
        (CB || function() {})(dataURL);
    };

    publicApi.prototype.interact = function() {
        return new interaction(this);
    };

    publicApi.prototype.$on = $on;
    // trigger event
    publicApi.prototype.trigger = trigger;

    function getMouseEvent(e) {
        return ({
            clientX: e.clientX || (e.targetTouches[0] || {}).clientX,
            clientY: e.clientY || (e.targetTouches[0] || {}).clientY
        });
    }

    function findxy(e) {
        var canvas = this.canvas,
            ctx = this.ctx,
            _ev = getMouseEvent(e);
        switch (e.type) {
            case ('mousedown'):
            case ('touchstart'):
                prevX = currX;
                prevY = currY;
                currX = _ev.clientX - canvas.offsetLeft;
                currY = _ev.clientY - canvas.offsetTop;

                flag = true;
                dot_flag = true;
                if (dot_flag) {
                    pencilOnBoard.apply(this, [canvasDrawingX, currX, currY, true]);
                    dot_flag = false;
                }
                break;
            case ('mouseout'):
            case ('mouseup'):
            case ('touchend'):
                flag = false;
                break;
            case ('mousemove'):
            case ('touchmove'):
                if (flag) {
                    prevX = currX;
                    prevY = currY;
                    currX = _ev.clientX - canvas.offsetLeft;
                    currY = _ev.clientY - canvas.offsetTop;
                    draw.apply(this, [prevX, prevY, currX, currY, canvasDrawingX, canvasDrawingY, true]);
                }
                break;
        }

    }

    function $on(evName, fn) {
        this._events[evName] = fn;
        return this;
    }

    function trigger(evName, arg) {
        if (this._events[evName]) {
            this._events[evName].call(this._events[evName], arg);
        }

        return this;
    }