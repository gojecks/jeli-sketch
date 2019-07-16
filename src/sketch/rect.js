/**
 * 
 * @param {*} definition 
 * @param {*} pushToStack 
 * @param {*} state 
 */
Sketch.rect = function(definition, pushToStack, state) {
    this.ctx.beginPath();
    this.ctx.save();
    this.ctx.rect(definition.x, definition.y, definition.w, definition.h);
    this.ctx.restore();

    /**
     * check for gradient color
     */
    var pos = Sketch.getPos(definition);
    if (definition.gradient) {
        definition.color = this.generateGradient({
            gradient: definition.gradient,
            x: definition.x,
            y: definition.y,
            x2: pos.x,
            y2: pos.y
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
        startY: definition.y,
        startX: definition.x,
        endX: pos.x,
        endY: pos.y
    }, state);

    // push the result to stack
    this.addToStack({
        arg: [definition, false],
        event: "rect"
    }, pushToStack);
};