Sketch.drawLine = function(definition, pushToStack) {
    this.ctx.strokeStyle = definition.color;
    this.ctx.lineWidth = definition.lineWidth;
    // draw the line
    var _this = this;
    this.ctx.beginPath();
    definition.points.forEach(function(point) {
        _this.ctx.moveTo(point.x, point.y);
        _this.ctx.lineTo(point.x2, point.y2);
    });
    this.ctx.stroke();
    // push the result to stack
    _this.addToStack({
        arg: [definition, false],
        event: "drawLine"
    }, pushToStack);
}