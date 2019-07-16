    /**
     * reDraw the canvas
     * only trigger when dragable element is moved or on undo
     */
    Sketch.redraw = function() {
        if (!this.stateManager.valid) {
            Sketch.eraseCanvas.call(this);
            var _this = this;
            this.stateManager.forEach(function(state) {
                state.stacks.forEach(function(stack) {
                    Sketch[stack.event].call(_this, stack.arg[0], stack.arg[1], state);
                });
            });
            this.stateManager.valid = true;
        }
    };