    /**
     * draw Arrow
     */
    Sketch.drawArrow = function(definition, pushToStack) {
        var _this = this;
        Sketch.drawLine.call(this, definition, false);
        this.ctx.fillStyle = definition.color;
        definition.points.forEach(function(point) {
            // draw the starting arrowhead
            var startRadians = endRadians = Math.atan((point.y2 - point.y) / (point.x2 - point.x));
            startRadians += ((point.x2 > point.x) ? -90 : 90) * Math.PI / 180;
            endRadians += ((point.x2 > point.x) ? 90 : -90) * Math.PI / 180;
            if (definition.position === 'B') {
                drawArrowhead(point.x2, point.y2, endRadians);
            } else if (definition.position === 'T') {
                drawArrowhead(point.x, point.y, startRadians);
            } else if (definition.position === 'TB') {
                drawArrowhead(point.x, point.y, startRadians);
                drawArrowhead(point.x2, point.y2, endRadians);
            }
        });


        /**
         * 
         * @param {*} x 
         * @param {*} y 
         */
        function drawArrowhead(x, y, radians) {
            var lx = 2 + definition.lineWidth,
                ly = 18 + definition.lineWidth;

            _this.ctx.save();
            _this.ctx.beginPath();
            _this.ctx.translate(x, y);
            _this.ctx.rotate(radians);
            _this.ctx.moveTo(0, 0);
            _this.ctx.lineTo(lx, ly);
            _this.ctx.lineTo(-lx, ly);
            _this.ctx.closePath();
            _this.ctx.restore();
            _this.ctx.fill();
        }

        // push the result to stack
        _this.addToStack({
            arg: [definition, false],
            event: "drawArrow"
        }, pushToStack);
    };