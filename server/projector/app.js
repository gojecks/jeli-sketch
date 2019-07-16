(function() {
    var socket = io(),
        totalClients = 0,
        device = {
            height: window.innerHeight,
            width: document.body.clientWidth,
            halfHeight: window.innerHeight / 2,
            halfWidth: document.body.clientWidth / 2
        };

    // broadcast event
    socket.emit('device.role', {
        isAdmin: true
    });

    var interaction = new jsketch().interact(),
        par = document.getElementById("page_drop"),
        msg = document.getElementById("message");

    interaction.ajax.get.url = 'http://localhost/events/index.php';
    interaction.ajax.timer = 100;
    interaction.socketEnabled = true;
    interaction.socket = socket;

    interaction.watch()
        .$on('stacked.clients', function(data) {
            if (data) {
                for (var prop in data) {
                    interaction.trigger(data[prop].type, data[prop].payload);
                }
            }
        })
        .$on('interaction.stack.received', function(obj) {
            interaction.draw(obj);
        })
        .$on('connect.child', function(obj) {
            //msg.style.display="none";
            var canRedrawClient = false
            if (obj.stack.width > device.width) {
                obj.stack.width = device.width;
                canRedrawClient = true;
            } else if (device.width > obj.stack.width) {
                if (device.halfWidth <= obj.stack.width) {
                    obj.stack.width = device.halfWidth;
                }

                canRedrawClient = true;
            }

            if (obj.stack.height > device.halfHeight) {
                obj.stack.height = device.halfHeight;
                canRedrawClient = true;
            }

            if (canRedrawClient) {
                interaction.sendEvent('redraw.client', obj);
            }

            var div = document.createElement('div');
            div.setAttribute('id', obj.user);
            div.setAttribute('class', 'col-sm-6 no-padd');

            div.innerHTML = '<div class="childFrame"><div id="drawingBoard" style="width:' + obj.stack.width + 'px; height:' + obj.stack.height + 'px"><div class="waterMarkName">' + obj.stack.name + '</div></div></div>';

            par.appendChild(div);
            interaction.createChildFrame(obj, div.querySelector('#drawingBoard'));

            totalClients++;
        });

    socket.on('client.disconnected', function(data) {
        interaction.destroyFrame(data.id);
        // remove the child
        var child = document.getElementById(data.id);
        if (child) {
            par.removeChild(child);
        }

        totalClients--;

        if (!totalClients) {
            //msg.style.display = "block";
        }
    });
})();