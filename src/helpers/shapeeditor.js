/**
 * 
 * @param {*} SketchInstance 
 * @param {*} state 
 */
function CanvasShapeEditor(SketchInstance, state) {
    var boxSize = 10,
        definition = state.stacks[0].arg[0],
        isCircle = state.stacks[0].event === "arc";

    function circleClip(x, y, r, angle, distance) {
        return {
            x: x + r * Math.cos(-angle * Math.PI / 180) * distance,
            y: y + r * Math.sin(-angle * Math.PI / 180) * distance
        };
    }

    this.setClips = function() {
        this.clips = [];
        if (isCircle) {
            var inc = 360 / 8;
            for (var i = 0; i <= 7; i++) {
                var clip = circleClip(definition.x, definition.y, definition.r, inc * i, 1);
                clip.r = 5;
                this.clips.push(clip);
            }
        } else {
            var hDiff = (state.endY - state.startY),
                wDiff = (state.endX - state.startX),
                half = boxSize / 2;
            // top clips
            this.clips.push({
                x: state.startX - half,
                y: state.startY - half,
                w: boxSize,
                h: boxSize
            });

            this.clips.push({
                x: (state.startX + (wDiff / 2) - half),
                y: state.startY - half,
                w: boxSize,
                h: boxSize
            });

            this.clips.push({
                x: (state.startX + wDiff - half),
                y: state.startY - half,
                w: boxSize,
                h: boxSize
            });

            // middle L/R clip
            this.clips.push({
                x: (state.startX - half),
                y: state.startY + (hDiff / 2) - half,
                w: boxSize,
                h: boxSize
            });

            this.clips.push({
                x: state.endX - half,
                y: state.endY - (hDiff / 2) - half,
                w: boxSize,
                h: boxSize
            });

            // Bottom Clips

            this.clips.push({
                x: (state.startX - half),
                y: state.startY + hDiff - half,
                w: boxSize,
                h: boxSize
            });

            this.clips.push({
                x: state.endX - (wDiff / 2) - half,
                y: state.endY - half,
                w: boxSize,
                h: boxSize
            });

            this.clips.push({
                x: state.endX - half,
                y: state.endY - half,
                w: boxSize,
                h: boxSize
            });
        }


        SketchInstance.ctx.fillStyle = 'darkred';
        this.clips.forEach(function(clip) {
            if (isCircle) {
                SketchInstance.ctx.beginPath();
                SketchInstance.ctx.arc(clip.x, clip.y, clip.r, 0, 2 * Math.PI);
                SketchInstance.ctx.fill();
            } else {
                SketchInstance.ctx.fillRect(clip.x, clip.y, clip.w, clip.h);
            }
        });
    };

    this.getSelectedClip = function(x, y, setCursor) {
        var selectedClip = -1;
        this.clips.forEach(function(clip, idx) {
            // we dont need to use the ghost context because
            // selection handles will always be rectangles
            if (isCircle) {
                var dx = clip.x - x;
                var dy = clip.y - y;
                // test if the mouse is inside this circle
                if (dx * dx + dy * dy < clip.r * clip.r) {
                    selectedClip = idx;
                }
            } else {
                if (x >= clip.x && x <= clip.x + clip.h &&
                    y >= clip.y && y <= clip.y + clip.w) {
                    selectedClip = idx;
                }
            }
        });

        /**
         * set the cursor type
         */
        if (setCursor && 0 <= selectedClip) {
            var styles = ['nw-resize', 'n-resize', 'ne-resize', 'w-resize', 'e-resize', 'sw-resize', 's-resize', 'se-resize'];
            SketchInstance.canvas.style.cursor = styles[selectedClip];
        }

        return selectedClip;
    }

    var resizers = {
        arc: function(selectedClip, x, y, px, py) {
            definition.r = Math.sqrt(Math.pow(px - x, 2) + Math.pow(py - y, 2))
        },
        rect: function(selectedClip, x, y, px, py) {
            switch (selectedClip) {
                case 0:
                    definition.x = x;
                    definition.y = y;
                    definition.w += px - x;
                    definition.h += py - y;
                    break;
                case 1:
                    definition.y = y;
                    definition.h += py - y;
                    break;
                case 2:
                    definition.y = y;
                    definition.w = x - px;
                    definition.h += py - y;
                    break;
                case 3:
                    definition.x = x;
                    definition.w += px - x;
                    break;
                case 4:
                    definition.w = x - px;
                    break;
                case 5:
                    definition.x = x;
                    definition.w += px - x;
                    definition.h = y - py;
                    break;
                case 6:
                    definition.h = y - py;
                    break;
                case 7:
                    definition.w = x - px;
                    definition.h = y - py;
                    break;
            }
        }
    };

    // set the imageResizer to rect
    resizers.image = resizers.rect;

    /**
     * Shape Resizer
     */
    this.onResize = function(x, y) {
        var selectedClip = this.getSelectedClip(x, y, true);
        if (0 <= selectedClip) {
            resizers[state.stacks[0].event](selectedClip, x, y, definition.x, definition.y);
            // trigger redraw
            this.redraw();
        }
    };
}

CanvasShapeEditor.prototype.redraw = function() {
    // do nothing
};