    /**
     * 
     * @param {*} color 
     * @param {*} currX 
     * @param {*} currY 
     * @param {*} pushToStack 
     */
    Sketch.pencilOnBoard = function(definition, pushToStack) {
        this.ctx.beginPath();
        this.ctx.fillStyle = definition.color;
        this.ctx.fillRect(definition.x, definition.y, definition.lineWidth, definition.lineWidth);
        this.ctx.closePath();
        this.addToStack({
            event: "pencilOnBoard",
            arg: [definition, false]
        }, pushToStack);

    };

    /**
     * 
     * @param {*} prevX 
     * @param {*} prevY 
     * @param {*} currX 
     * @param {*} currY 
     * @param {*} color 
     * @param {*} lineWidth 
     * @param {*} pushToStack 
     */
    Sketch.freeHand = function(definition, pushToStack) {
        this.ctx.beginPath();
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.moveTo(definition.x, definition.y);
        this.ctx.lineTo(definition.x2, definition.y2);
        this.ctx.strokeStyle = definition.color;
        this.ctx.lineWidth = definition.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        this.ctx.closePath();

        // push the result to stack
        this.addToStack({
            arg: [definition, false],
            event: "freeHand"
        }, pushToStack);
    };