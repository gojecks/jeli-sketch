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
        fillStyle = "black",
        lineWidth = 2,
        eraserMode = false,
        currentRandomColor = "";

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
        this.colors = ["random", "black", "green", "blue", "red", "orange", "white", "gray", "purple"];
        this.size = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
        this.stack = [];
        this._events = {};
        this.shapes = new shapes(this);
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
            lineWidth = 2;
        } else {
            lineWidth = parseInt(size);
        }
    }

    publicApi.prototype.setColor = function(color) {
        if (this.colors.indexOf(color) > -1) {
            fillStyle = color;
        }

        return this;
    };

    publicApi.prototype.reScale = function(obj) {
        if (this.options.id == obj.user) {
            this.canvas.width = obj.stack.width;
            this.canvas.height = obj.stack.height;
        }
    };

    publicApi.prototype.clear = function() {
        eraseCanvas.call(this);
        this.stack.push({
            event: "clear"
        });
        this.trigger('interact.send');
        this.stack = [];
    };

    publicApi.prototype.eraser = function() {
        eraserMode = !eraserMode;
    }

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


    function draw(prevX, prevY, currX, currY, strokeStyle, lineWidth, pushToStack) {
        this.ctx.beginPath();
        if (eraserMode) {
            erase.call(this);
        } else {
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.moveTo(prevX, prevY);
            this.ctx.lineTo(currX, currY);
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = lineWidth;
            this.ctx.stroke();
        }

        this.ctx.lineCap = 'round';
        this.ctx.closePath();

        // push the result to stack
        if (pushToStack) {
            this.stack.push({
                arg: [prevX, prevY, currX, currY, strokeStyle, lineWidth, false],
                event: "draw"
            });
        }

        this.trigger('interact.send');
    }

    /**
     * 
     * @param {*} fillStyle 
     * @param {*} currX 
     * @param {*} currY 
     * @param {*} pushToStack 
     */
    function pencilOnBoard(fillStyle, currX, currY, pushToStack) {
        this.ctx.beginPath();
        this.ctx.fillStyle = fillStyle;
        if (eraserMode) {
            erase.call(this);
        } else {
            this.ctx.fillRect(currX, currY, 2, 2);
        }
        this.ctx.closePath();
        if (pushToStack) {
            this.stack.push({
                event: "pencilOnBoard",
                arg: [fillStyle, currX, currY]
            });
        }

        this.trigger('interact.send');
    }

    function erase() {
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.arc(currX, currY, 8, 0, Math.PI * 2, false);
        this.ctx.fill();
    }


    publicApi.prototype.getDataURL = function(CB, mimeType) {
        var dataURL = this.canvas.toDataURL(mimeType || "image/png");
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
            _ev = getMouseEvent(e);
        switch (e.type) {
            case ('mousedown'):
            case ('touchstart'):
                prevX = currX;
                prevY = currY;
                currX = _ev.clientX - canvas.offsetLeft;
                currY = _ev.clientY - canvas.offsetTop;
                flag = true;
                pencilOnBoard.apply(this, [getStyle(true), currX, currY, true]);
                break;
            case ('mouseout'):
            case ('mouseup'):
            case ('touchend'):
                flag = false;
                prevX = currX;
                prevY = currY;
                break;
            case ('mousemove'):
            case ('touchmove'):
                if (flag) {
                    prevX = currX;
                    prevY = currY;
                    currX = _ev.clientX - canvas.offsetLeft;
                    currY = _ev.clientY - canvas.offsetTop;
                    draw.apply(this, [prevX, prevY, currX, currY, getStyle(false), lineWidth, true]);
                }
                break;
        }

    }

    function rgb() {
        color = 'rgb(';
        for (var i = 0; i < 3; i++) {
            color += Math.floor(Math.random() * 255) + ',';
        }
        return color.replace(/\,$/, ')');
    }

    function getStyle(changeColor) {
        if (fillStyle === "random") {
            if (changeColor) {
                currentRandomColor = rgb();
            }
            return currentRandomColor
        } else {
            return fillStyle;
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