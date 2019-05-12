/**
 * shape.rect
 */
function shapes(core) {
    this.rect = function(options) {
        core.ctx.beginPath();
        core.ctx.fillStyle = fillStyle;
        core.ctx.fillRect(options.x, options.y, options.width, options.height);
        core.ctx.closePath();
    };
}