   /**
    * 
    * @param {*} definition 
    * @param {*} pushToStack 
    */
   Sketch.text = function(definition, pushToStack, state) {
       Sketch.text.scale.call(this, definition);
       /**
        * draw styling
        */
       if (definition.style) {
           var _this = this;
           Object.keys(definition.style).forEach(function(key) {
               _this.ctx[key] = definition.style[key];
           });
       }

       this.ctx.font = (definition.fontSizesize + "px " + definition.fontFamily);

       if (definition.type === "stroke") {
           this.ctx.strokeStyle = definition.color;
           this.ctx.stokeText(definition.text, definition.x, definition.y);
       } else {
           this.ctx.fillStyle = definition.color;
           this.ctx.fillText(definition.text, definition.x, definition.y);
       }

       this.stateManager
           .updateState({
               startX: definition.x,
               startY: definition.y - definition.fontSize,
               endX: definition.x2,
               endY: definition.y2,
               selectable: definition.selectable || true
           }, state);

       this.addToStack({
           event: "text",
           arg: [definition, false]
       }, pushToStack);
   };

   /**
    * Text scaling
    */
   Sketch.text.scale = function(definition) {
       var size = parseInt(definition.fontSize || lineWidth);
       definition.fontFamily = (definition.fontFamily || "serif");
       this.ctx.font = size + "px " + definition.fontFamily;
       var measurement = this.ctx.measureText(definition.text);
       definition.textWidth = measurement.width;
       definition.fontSize = size;
       definition.color = definition.color || this.getStyle(false);
       definition.x = (definition.x || (this.options.width - measurement.width) / 2);
       definition.y = (definition.y || (this.options.height - size) / 2);
       definition.x2 = definition.x + definition.textWidth;
       definition.y2 = definition.y + definition.fontSize;
       /**
        * check for gradient
        * build gradient
        */
       if (definition.gradient) {
           // Create gradient
           definition.color = this.generateGradient(definition);
       }
   };