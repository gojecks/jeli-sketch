/**
 * shape.rect
 */
function shapes(core) {

    this.rect = function(definition) {
        core.ctx.beginPath();
        if (isArray(definition.points)) {
            definition.points.forEach(function(point) {
                var color = point.color || definition.color || fillStyle;
                if (!point.stroke) {
                    core.ctx.fillStyle = color;
                    core.ctx.fillRect(point.x, point.y, point.w, point.h);
                } else {
                    // stroke
                    core.ctx.strokeStyle = color;
                    core.ctx.strokeRect(point.x, point.y, point.w, point.h);
                }
            });
        }
        core.ctx.closePath();
    };
}