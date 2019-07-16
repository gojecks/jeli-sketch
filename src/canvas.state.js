function CanvasStateMananger() {
    var states = [];
    this.selectedState = null;
    this.drawingState = null;
    this.previousState = null;
    /**
     * Create and add a state to state stack
     */
    this.reset = function(cb) {
        var len = states.length;
        while (len--) {
            cb(states.shift());
        }

    };

    this.addState = function(startX, startY, isDragable) {
        this.selectedState = ({
            startX: startX,
            startY: startY,
            endX: 0,
            endY: 0,
            isDragable: isDragable,
            selectable: isDragable,
            stacks: []
        });

        return this;
    }

    this.endState = function(endX, endY) {
        if (!this.selectedState) { return; }
        if (endX && endY) {
            this.selectedState.endX = endX;
            this.selectedState.endY = endY;
        }
        states.push(this.selectedState);
        this.clearState();
    }

    // Determine if a point is inside the shape's bounds
    this.contains = function(mx, my, multipleSelection) {
        // All we have to do is make sure the Mouse X,Y fall in the area between
        // the shape's X and (X + Width) and its Y and (Y + Height)
        var found = null;
        states.forEach(function(state, idx) {
            if (state.selectable && (state.startX <= mx) && (state.endX >= mx) &&
                (state.startY <= my) && (state.endY >= my)) {
                if (multipleSelection) {
                    state.isSelected = true;
                } else {
                    found = {
                        state: state,
                        index: idx
                    };
                }
            }
        });

        return found;
    };

    this.pop = function() {
        var state = states.pop();
        return state;
    };

    this.forEach = function(cb) {
        var len = states.length;
        while (len--) {
            cb(states[len]);
        }
    };

    this.getStateByIndex = function(idx) {
        return states[idx];
    }

    Object.defineProperty(this, 'all', {
        get: function() {
            return states;
        }
    });
}

CanvasStateMananger.prototype.pushStack = function(stack) {
    this.selectedState.stacks.push(stack);
};

CanvasStateMananger.prototype.isDragableState = function() {
    return this.selectedState && this.selectedState.isDragable && this.selectedState.isDragging;
};

CanvasStateMananger.prototype.updateState = function(definition, state) {
    if (!this.selectedState && !state) {
        return;
    }
    var _this = this;
    Object.keys(definition).forEach(function(prop) {
        (_this.selectedState || state)[prop] = definition[prop];
    });
};

CanvasStateMananger.prototype.clearState = function() {
    this.selectedState = null;
};

CanvasStateMananger.prototype.isSameState = function(stateName) {
    return (stateName === this.drawingState.type);
};

/**
 * @param stateName
 * @param listeners
 * @param saveCurrentState
 */
CanvasStateMananger.prototype.setDrawingState = function(stateName, listeners, saveCurrentState) {
    var _this = this;
    if (this.drawingState) {
        if (!this.isSameState(stateName)) {
            // change state
            addState();
        } else if (this.drawingState.listeners.destroyingOnReClick) {
            // destroy state
            this.destroyDraingState();
        }
    } else {
        addState();
    }

    function addState() {
        // save previous state
        _this.selectedState = null;
        if (saveCurrentState) {
            _this.previousState = _this.drawingState;
        }

        /**
         * trigger state change if defined
         */
        if (_this.drawingState && _this.drawingState.onStateChange) {
            _this.drawingState.onStateChange();
        }

        // change state
        _this.drawingState = {
            state: stateName,
            listeners: listeners
        };
    }
};

/**
 * @param restoreState
 */
CanvasStateMananger.prototype.destroyDrawingState = function(restoreState) {
    if (restoreState && this.previousState) {
        this.drawingState = this.previousState;
        this.previousState = null;
    } else {
        this.drawingState = null;
        this.previousState = null;
    }
};