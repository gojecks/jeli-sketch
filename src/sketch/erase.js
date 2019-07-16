    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} pushToStack 
     */
    Sketch.erase = function(x, y, pushToStack) {
        this.ctx.beginPath();
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.arc(x, y, 8, 0, Math.PI * 2, false);
        this.ctx.fill();
        this.addToStack({
            event: "erase",
            arg: [x, y, false]
        }, pushToStack);
    };

    Sketch.eraseCanvas = function() {
        this.ctx.clearRect(0, 0, this.options.width, this.options.height);
    };