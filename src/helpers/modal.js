/**
 * 
 * @param {*} dropZone 
 */
function Modal(dropZone, definition) {
    var container = document.createElement('div'),
        overlay = document.createElement('div'),
        options = Object.assign({
            overlay: true,
            onOverlayClick: function() {}
        }, definition || {}),
        styles = {
            position: 'absolute',
            minWidth: (dropZone.clientWidth / 2.5) + "px",
            minHeight: (dropZone.clientHeight / 5.5) + "px",
            top: '40%',
            left: '30%',
            padding: '5%'
        };

    /**
     * bind listener to overlay
     */
    overlay.addEventListener('click', options.onOverlayClick, false);


    return {
        destroy: function() {
            dropZone.removeChild(container);
            dropZone.removeChild(overlay);
            dropZone = null;
            container = null;
            overlay.removeEventListener('click', options.onOverlayClick);
            overlay = null;
        },
        addContent: function(html) {
            container.innerHTML = html;
            return this;
        },
        addEventListener: function() {

        },
        addStyle: function(styles) {
            var stylesheet = document.createElement('style');
            stylesheet.type = "text/css";
            if (stylesheet.styleSheet) {
                stylesheet.styleSheet.cssText = styles;
            } else {
                stylesheet.appendChild(document.createTextNode(styles));
            }

            container.appendChild(stylesheet);

            return this;
        },
        querySelector: function(query) {
            return container.querySelector(query);
        },
        init: function(style) {
            /**
             * set the overlay if defined
             */
            if (options.overlay) {
                overlay.style.height = dropZone.clientHeight + 'px';
                overlay.style.width = dropZone.clientWidth + 'px';
                overlay.style.background = '#f0f0f0';
                overlay.style.bottom = dropZone.clientHeight + 'px';
                overlay.style.position = 'relative';
                overlay.style.opacity = '0.5';
                dropZone.appendChild(overlay);
            }


            dropZone.appendChild(container);
            styles = Object.assign(styles, style || {});
            if (style.top) {
                if ((style.top + parseInt(styles.minHeight)) > dropZone.clientHeight) {
                    styles.bottom = '50px';
                    delete styles.top;
                } else {
                    styles.top = (style.top + 50) + 'px';
                }
            }


            if (style.left) {
                if ((style.left + parseInt(styles.minWidth)) > dropZone.clientWidth) {
                    styles.right = '0px';
                    delete styles.left;
                } else {
                    styles.left = style.left + 'px';
                }
            }
            /**
             * add Style
             */
            Object.keys(styles).forEach(function(key) {
                container.style[key] = styles[key];
            });
        },
        hide: function() {
            container.style.display = "none";
            overlay.style.display = "none";
        },
        show: function() {
            container.style.display = "block";
            overlay.style.display = "block";
        }
    };
}