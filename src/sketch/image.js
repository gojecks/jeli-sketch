    /**
     * 
     * @param {*} definition 
     */
    Sketch.image = function(definition, pushToStack, state) {
        if (state) {
            Sketch.image.style(state.imageContainerId, definition, this.options.width, this.options.height);
            var pos = Sketch.getPos(definition);
            this.stateManager.updateState({
                startX: definition.x,
                startY: definition.y,
                endX: pos.x,
                endY: pos.y
            }, state);
            return;
        }

        var img = new Image(),
            _this = this;
        /**
         * image onload method
         */
        img.onload = function() {
            var nwidth = this.naturalWidth,
                nheight = this.naturalHeight;
            /**
             * check definition
             */
            if (!definition.hasOwnProperty('x')) {
                if (definition.w > nwidth) {
                    definition.x = (definition.w - nwidth) / 2;
                    definition.w = nwidth;
                } else {
                    definition.x = 0;
                }
            }

            if (!definition.hasOwnProperty('y')) {
                if (definition.h > nheight) {
                    definition.y = (definition.h - nheight) / 2;
                    definition.h = nheight;
                } else {
                    definition.y = 0;
                }
            }

            /**
             * write to canvas if definition contains this property
             */
            if (!definition.toCanvas) {
                var container = document.createElement("div");
                container.style.backgroundImage = 'url(' + img.src + ')';
                _this.canvas.parentNode.appendChild(container);
                container.id = "_canvas_image_" + +new Date;
                Sketch.image.style(container.id, definition, _this.options.width, _this.options.height);
            }


            var pos = Sketch.getPos(definition);
            if (pushToStack) {
                _this.stateManager.addState(definition.x, definition.y, definition.dragable);
                _this.addToStack.call(_this, {
                    event: "image",
                    arg: [definition, false]
                }, true);
                if (!definition.toCanvas) {
                    _this.stateManager.selectedState.imageContainerId = container.id;
                }
                _this.stateManager.endState(pos.x, pos.y);
            }

            /**
             * write to canvas
             */
            if (definition.toCanvas) {
                _this.ctx.drawImage(img, definition.x, definition.y, definition.width, definition.height);
            }
        };

        /**
         * on error
         */
        img.onerror = function() {
            console.log(definition);
        };

        img.src = definition.img;
    };

    /**
     * Sketch image styling
     */
    Sketch.image.style = function(containerId, definition, canvasWidth, canvasHeight) {
        var container = document.getElementById(containerId),
            wDiff = (window.innerWidth - canvasWidth) / 2,
            hDiff = (window.innerHeight - canvasHeight) / 2,

            styles = {
                left: definition.x + wDiff + "px",
                top: definition.y + hDiff + "px",
                position: 'absolute',
                width: definition.w + "px",
                height: definition.h + "px",
                zIndex: "-1",
                backgroundRepeat: 'no-repeat'
            };

        Object.keys(styles).forEach(function(key) {
            container.style[key] = styles[key];
        });
    };

    /**
     * remove image from sketch view
     */
    Sketch.image.removeImage = function(state) {
        if (state) {
            if (state.hasOwnProperty('imageContainerId')) {
                var container = document.getElementById(state.imageContainerId);
                if (container) {
                    container.parentNode.removeChild(container);
                }
                container = null;
            }
        }
    };