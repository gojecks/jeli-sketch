   /**
    * Core Sketch
    * @param {*} options 
    * @param {*} dropZone
    * 
    * dependencies
    * @extend
    */
   function Sketch(options, dropZone) {
       var defaultOptions = {
           width: 500,
           height: 500,
           id: '_canvas_' + +new Date
       };

       var ret = new publicApi();
       ret.options = extend(true, defaultOptions, (options || {}));
       ret.color = 'rgb(0,0,0)';
       ret.lineWidth = 2;
       ret.eraserMode = false;
       ret.currentRandomColor = "";
       /**
        * generate our canvas
        * for drawing
        */
       var canvas = document.createElement('canvas');
       for (var prop in ret.options) {
           canvas.setAttribute(prop, ret.options[prop]);
       }

       /**
        * Assign the canvas to our Sketch Instance
        */
       ret.canvas = canvas;
       ret.ctx = ret.canvas.getContext("2d");

       if (dropZone) {
           dropZone.appendChild(canvas);
       }

       return ret;
   }

   /**
    * Sketch Public Instance
    */
   function publicApi() {
       // default colors
       this.size = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 29, 30];
       this.arrowPositions = ['', 'B', 'T', 'TB'];
       this._events = {};
       this.shapes = new shapes(this);
       this.stateManager = new CanvasStateMananger()
           /**
            * 
            * @param {*} randomColor
            */
       this.getStyle = function(randomColor) {
           if (randomColor) {
               return Sketch.colorPicker.rgb();
           } else {
               return this.color;
           }
       };

       this.generateGradient = function(definition) {
           var gradient = this.ctx.createLinearGradient(definition.x, definition.y, definition.x2, definition.y2);
           definition.gradient.forEach(function(def) {
               gradient.addColorStop(def.point, def.color);
           });

           return gradient;
       };


       /**
        * 
        * @param {*} event 
        * @param {*} pushToStack 
        */
       this.addToStack = function(event, pushToStack) {
           if (pushToStack) {
               this.stateManager.pushStack(event);
               this.trigger('interact.send', [event]);
           }
       };
   };


   publicApi.prototype.setPenSize = function(size) {
       if (size === 'default') {
           this.lineWidth = 2;
       } else {
           this.lineWidth = parseInt(size);
       }
   }

   publicApi.prototype.setColor = function(color) {
       if (color) {
           this.color = color;
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
       // remove images
       this.stateManager.reset(Sketch.image.removeImage);
       Sketch.eraseCanvas.call(this);
       this.trigger('interact.send', [{
           event: "clear"
       }]);
   };

   publicApi.prototype.eraser = function() {
       var _this = this;
       this.stateManager.setDrawingState('eraser', {
           down: function(x, y) {
               _this.stateManager.addState(x, y);
               Sketch.erase.call(_this, x, y, true);
           },
           move: function(x, y) {
               Sketch.erase.call(_this, x, y, true);
           },
           end: function(x, y) {
               Sketch.erase.call(_this, x, y, true);
               _this.stateManager.endState(x, y);
           }
       });
   };

   publicApi.prototype.undo = function() {
       var popedState = this.stateManager.pop();
       Sketch.image.removeImage(popedState);
       this.stateManager.valid = false;
       Sketch.redraw.call(this);
       popedState = null;
   };

   /**
    * free hand drawing
    */
   publicApi.prototype.freeHand = function() {
       var _this = this;
       this.stateManager.setDrawingState('freeHand', {
           down: function(x, y) {
               _this.stateManager.addState(x, y);
               Sketch.pencilOnBoard.apply(_this, [{
                   color: _this.getStyle(false),
                   x: x,
                   y: y,
                   lineWidth: _this.lineWidth
               }, true]);
           },
           move: function(x, y, px, py) {
               Sketch.freeHand.apply(_this, [{
                   x: px,
                   y: py,
                   x2: x,
                   y2: y,
                   color: _this.getStyle(false),
                   lineWidth: _this.lineWidth,
               }, true]);
           },
           end: function(x, y) {
               // update state
               _this.stateManager.endState(x, y);
           }
       }, false);
   };

   publicApi.prototype.dragSelect = function() {
       var _this = this;

       this.stateManager.setDrawingState('drag', {
           down: function(x, y) {
               _this.stateManager.contains(x, y, true);
           },
           move: function(x, y, px, py) {
               var cx = (x - px),
                   cy = (y - py);
               _this.stateManager.forEach(function(state) {
                   /**
                    * update the definition
                    */
                   if (state.isSelected) {
                       state.stacks[0].arg[0].x += cx;
                       state.stacks[0].arg[0].y += cy;
                       _this.stateManager.valid = false;
                       Sketch.redraw.call(_this, state);
                   }
               });
           },
           end: function(x, y) {
               _this.stateManager.forEach(function(state) {
                   /**
                    * update the definition
                    */
                   state.isSelected = false;
               });
           }
       });
   };

   publicApi.prototype.fill = function() {
       var _this = this,
           curObject = null;

       this.stateManager.setDrawingState('fill', {
           down: function(x, y) {
               curObject = _this.stateManager.contains(x, y, false);
           },
           move: function() {

           },
           end: function() {
               if (!curObject) {
                   return;
               }

               Sketch.colorPicker.open({
                   total: 3
               }, _this.canvas.parentNode, function(colorObj) {
                   var definition = curObject.state.stacks[0].arg[0];
                   definition.type = "fill";
                   if (colorObj) {
                       if (colorObj.gradient) {
                           definition.gradient = colorObj.gradient;
                       } else {
                           definition.color = colorObj.rgb;
                       }
                   }

                   _this.stateManager.valid = false;
                   Sketch.redraw.call(_this);
               });
           },
           onStateChange: function() {
               curObject = null;
           }
       });
   }

   /**
    * Core Select options
    * onclick on an item select the item 
    * based on there type
    */

   publicApi.prototype.select = function() {
       var _this = this,
           shapeEditorInstance = false,
           curObject = null;
       this.stateManager.setDrawingState('select', {
           down: function(x, y) {
               var selectedObject = _this.stateManager.contains(x, y, false);
               if (selectedObject) {
                   if (curObject && curObject.index === selectedObject.index) {
                       selectedObject = null;
                       return;
                   }
                   curObject = selectedObject;
                   selectedObject = null;
                   if (curObject.state.stacks[0].event === 'text') {
                       canvasTextArea(_this.canvas.parentNode, curObject.state.stacks[0].arg[0], function() {
                           // Sketch.text.scale.call(_this, curObject.state.stacks[0].arg[0]);
                           _this.stateManager.valid = false;
                           Sketch.redraw.call(_this);
                           _this.stateManager.clearState();
                       });
                   } else {
                       shapeEditorInstance = new CanvasShapeEditor(_this, curObject.state);
                       shapeEditorInstance.redraw = function() {
                           _this.stateManager.valid = false;
                           Sketch.redraw.call(_this);
                           this.setClips();
                       };

                       shapeEditorInstance.setClips();
                   }
               }
           },
           move: function(x, y, px, py) {
               if (shapeEditorInstance) {
                   shapeEditorInstance.onResize(x, y, px, py);
               }
           },
           end: function() {
               _this.canvas.style.cursor = 'auto';
           },
           onStateChange: function() {
               shapeEditorInstance = false;
               curObject = null;

           }
       });
   }

   /**
    * img: String,
    * width: number,
    * height: number,
    * x: number,
    * y: number
    * dragable: false
    */
   publicApi.prototype.addImage = function(definition) {
       definition.w = definition.w || this.options.width;
       definition.h = definition.h || this.options.height;
       Sketch.image.call(this, definition, true);
   };

   /**
    * text: string;
    * x: number;
    * y: number;
    * width?:number,
    * type?: string;
    * fontSize: string;
    * fontFamily: string;
    * style: object;
    * gradient: Array<gradients>;
    */
   publicApi.prototype.addText = function(definition) {
       var _this = this;
       var options = extend(true, {
           fontSize: 40,
           fontFamily: 'serif'
       }, definition);
       var isActiveModal = false;

       this.stateManager.setDrawingState('text', {
           down: function(x, y) {
               if (!isActiveModal) {
                   isActiveModal = true;
                   options.x = x;
                   options.y = y;
                   canvasTextArea(_this.canvas.parentNode, options, draw);
               }
           },
           move: function() {},
           end: function() {}
       });

       function draw() {
           if (options.text) {
               _this.stateManager
                   .addState(options.x, options.y, true);
               Sketch.text.apply(_this, [options, true]);
               _this.stateManager
                   .endState(options.x + options.textWidth, options.y);
           }
           isActiveModal = false;
       }
   };

   /**
    * position:'T' | 'B' | TB
    */
   publicApi.prototype.drawArrow = function(arrowPosition) {
       if (!arrowPosition) {
           this.stateManager.destroyDrawingState();
           return;
       }
       var _this = this,
           ax, ay;
       this.stateManager.setDrawingState('arrow', {
           down: function(x, y) {
               ax = x;
               ay = y;
               _this.stateManager.addState(x, y, true);
           },
           move: function(x, y) {
               draw(x, y, 'darkred', false);
           },
           end: function(x, y) {
               draw(x, y, _this.getStyle(false), true);
               _this.stateManager.endState(x, y);
           }
       });

       /**
        * 
        * @param {*} x 
        * @param {*} y 
        * @param {*} color 
        * @param {*} push 
        */
       function draw(x, y, color, push) {
           _this.stateManager.valid = false;
           Sketch.redraw.call(_this);
           Sketch.drawArrow.apply(_this, [{
               points: [{
                   x: ax,
                   y: ay,
                   y2: y,
                   x2: x
               }],
               lineWidth: _this.lineWidth,
               color: color,
               position: arrowPosition
           }, push]);
       }
   };

   /**
    * type of circle;
    * f = full
    * h = half
    * e = eclipse
    */
   publicApi.prototype.drawCircle = function(type, shape) {
       shape = shape || 'f';
       type = type || 'stroke';
       var _this = this,
           ax, ay;
       this.stateManager.setDrawingState('circle', {
           down: function(x, y) {
               _this.stateManager.addState(x, y, true);
               ax = x;
               ay = y;
           },
           move: function(x, y) {
               draw(x, y, 'darkred', false);
           },
           end: function(x, y) {
               draw(x, y, _this.getStyle(false), true);
               _this.stateManager.endState();
           }
       });

       /**
        * 
        * @param {*} x 
        * @param {*} y 
        * @param {*} color 
        * @param {*} push 
        */
       function draw(x, y, color, push) {
           _this.stateManager.valid = false;
           Sketch.redraw.call(_this);
           var radius = Math.sqrt(Math.pow(ax - x, 2) + Math.pow(ay - y, 2)),
               elas = 2 * Math.PI;
           /**
            * set shape
            */
           if (shape === 'h') {
               elas = Math.PI;
           }

           Sketch.arc.apply(_this, [{
               x: ax,
               y: ay,
               s: 0,
               e: elas,
               r: radius,
               lineWidth: _this.lineWidth,
               type: type,
               color: color
           }, push]);
       }
   };

   publicApi.prototype.drawRect = function(type) {
       var _this = this,
           rx, ry;
       this.stateManager.setDrawingState('rect', {
           down: function(x, y) {
               _this.stateManager.addState(x, y, true);
               rx = x;
               ry = y;
           },
           move: function(x, y) {
               draw(x, y, 'darkred', false);
           },
           end: function(x, y) {
               draw(x, y, _this.getStyle(false), true);
               _this.stateManager.endState(x, y);
           }
       });

       /**
        * 
        * @param {*} x 
        * @param {*} y 
        * @param {*} color 
        * @param {*} push 
        */
       function draw(x, y, color, push) {
           _this.stateManager.valid = false;
           Sketch.redraw.call(_this);
           Sketch.rect.apply(_this, [{
               x: rx,
               y: ry,
               w: (x - rx),
               h: (y - ry),
               lineWidth: _this.lineWidth,
               type: type,
               color: color
           }, push]);
       }
   };

   publicApi.prototype.drawLine = function() {
       var _this = this,
           _lx, _ly;
       this.stateManager.setDrawingState('line', {
           down: function(x, y) {
               _this.stateManager.addState(x, y, true);
               _lx = x;
               _ly = y;
           },
           move: function(x, y) {
               _this.stateManager.valid = false;
               Sketch.redraw.call(_this);
               Sketch.drawLine.apply(_this, [{
                   points: [{
                       x: _lx,
                       y: _ly,
                       y2: y,
                       x2: x
                   }],
                   lineWidth: _this.lineWidth,
                   color: 'darkred'
               }, false]);
           },
           end: function(x, y) {
               Sketch.drawLine.apply(_this, [{
                   points: [{
                       x: _lx,
                       y: _ly,
                       y2: y,
                       x2: x
                   }],
                   lineWidth: _this.lineWidth,
                   color: _this.getStyle(false)
               }, true]);
               _this.stateManager.endState(x, y);
           }
       });
   };

   publicApi.prototype.init = function(CB) {
       var eventHandler = SketchEvent(this);
       this.addEventListener(["mousedown", "touchstart", "touchmove", "mousemove", "mouseup", "mouseout", "touchend"], eventHandler, false);

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
           events.forEach(addEvent);
       } else {
           addEvent(events);
       }

       function addEvent(evName) {
           self.canvas.addEventListener(evName, fn);
       }

       return this;
   };

   publicApi.prototype.getDataURL = function(CB, mimeType) {
       var dataURL = this.canvas.toDataURL(mimeType || "image/png");
       // trigger our callback
       (CB || function() {})(dataURL);
   };

   publicApi.prototype.interact = function() {
       return new interaction(this);
   };

   publicApi.prototype.colorPicker = function(definition) {
       var _this = this;
       Sketch.colorPicker.open(definition, this.canvas.parentNode, function(colorObj) {
           _this.setColor(colorObj.rgb);
       });
   };

   publicApi.prototype.getImageData = function(x, y, w, h) {
       return this.ctx.getImageData(x, y, w, h);
   };

   publicApi.prototype.$on = $on;
   // trigger event
   publicApi.prototype.trigger = trigger;