/**
 * 
 * @param {*} core 
 */
function SketchEvent(core) {
    var flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0;
    /**
     * 
     * @param {*} event 
     */
    function findxy(event) {
        event.preventDefault();
        var canvas = core.canvas,
            _ev = getMouseEvent(event),
            boundRect = canvas.getBoundingClientRect();
        prevX = currX;
        prevY = currY;
        currX = (_ev.clientX - boundRect.left);
        currY = (_ev.clientY - boundRect.top);
        if (mouseEvents.hasOwnProperty(event.type)) {
            mouseEvents[event.type]();
        }
    }

    /**
     * 
     * @param {*} event
     */
    function getMouseEvent(event) {
        return ({
            clientX: event.clientX || (event.targetTouches[0] || {}).clientX,
            clientY: event.clientY || (event.targetTouches[0] || {}).clientY
        });
    }

    function mouseMove() {
        if (flag) {
            core.stateManager.drawingState && core.stateManager.drawingState.listeners.move(currX, currY, prevX, prevY);
        }
    }

    function mouseEnter() {
        flag = true;
        core.stateManager.drawingState && core.stateManager.drawingState.listeners.down(currX, currY);
    }

    function mouseEnd() {
        if (flag) {
            core.stateManager.drawingState && core.stateManager.drawingState.listeners.end(prevX, prevY);
            flag = false;
        }
    }

    var mouseEvents = {
        mousedown: mouseEnter,
        touchstart: mouseEnter,
        mouseout: mouseEnd,
        mouseup: mouseEnd,
        touchend: mouseEnd,
        mousemove: mouseMove,
        touchmove: mouseMove
    };

    return findxy;
}