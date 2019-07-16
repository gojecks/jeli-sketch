   /**
    * this method determines the x1 and x2 of a shape
    * used mainly for RECT / IMAGE / CIRCLE
    */
   Sketch.getPos = function(definition) {
       return {
           x: (definition.x + definition.w),
           y: (definition.y + definition.h)
       };
   };