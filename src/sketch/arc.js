/**
 * 
 * @param {*} definition 
 * @param {*} pushToStack 
 * @param {*} state 
 */
Sketch.arc = function(definition, pushToStack, state) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(definition.x, definition.y, definition.r, definition.s, definition.e);
    this.ctx.restore();

    // set width and height for gradient calculation
    definition.w = definition.x + definition.r;
    definition.h = definition.y + definition.r;
    /**
     * check for gradient color
     */
    if (definition.gradient) {
        definition.color = this.generateGradient({
            gradient: definition.gradient,
            x: definition.x,
            y: definition.y,
            x2: definition.w,
            y2: definition.h
        });
    }

    if (definition.type === "stroke") {
        this.ctx.lineWidth = definition.lineWidth;
        this.ctx.strokeStyle = definition.color;
        this.ctx.stroke();
    } else {
        this.ctx.fillStyle = definition.color;
        this.ctx.fill();
    }
    this.ctx.closePath();

    this.stateManager.updateState({
        startX: definition.x - definition.r,
        startY: definition.y - definition.r,
        endX: definition.x + definition.r,
        endY: definition.y + definition.r
    }, state);

    // push the result to stack
    this.addToStack({
        arg: [definition, false],
        event: "arc"
    }, pushToStack);
};