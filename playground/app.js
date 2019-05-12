var connectorName,
    connectWrapper,
    ip,
    canvasPage,
    userName,
    dropZone,
    _colorPicker,
    _sizePicker,
    drawingBoard,
    deviceInfo,
    socket;

function build() {
    connectorName = document.getElementById('connectorName');
    connectWrapper = document.getElementById('connectWrapper');
    ip = document.getElementById('IP');
    canvasPage = document.getElementById('page_drop');
    userName = document.getElementById('userName');
    dropZone = document.getElementById("drawingBoard");
    _colorPicker = document.getElementById("_colorPicker");
    _sizePicker = document.getElementById("_sizePicker");

    deviceInfo = {
        id: "_childView:" + +new Date
    };


    if (sessionStorage.IP && sessionStorage.userName) {
        init(sessionStorage.IP, sessionStorage.userName)
    }
}



function connectUser() {
    if (ip.value && userName.value) {
        init(ip.value, userName.value);
        // store our session
        sessionStorage.IP = ip.value;
        sessionStorage.userName = userName.value;
    }
}

function init(ip, uName) {
    connectorName.innerHTML = uName;
    connectWrapper.style.display = "none";
    canvasPage.style.display = "block";

    deviceInfo.name = uName;
    start(ip);
}

function start(ip) {
    // set the canvas size
    deviceInfo.height = dropZone.clientHeight;
    deviceInfo.width = dropZone.clientWidth;
    drawingBoard = new jsketch(deviceInfo, dropZone);
    drawingBoard.ctx.fillStyle = "green";
    if (window.io) {
        socket = io.connect(ip);
        // broadcast
        socket.emit('device.role', {
            isAdmin: false
        });
    }


    drawingBoard.init(function() {
        buildColorPicker(drawingBoard.colors, _colorPicker);
        buildColorPicker(drawingBoard.size, _sizePicker);
        if (window.io) {
            startInterraction();
        }
    });
}

function startInterraction() {
    var interaction = drawingBoard.interact();
    interaction.socketEnabled = true;
    interaction.socket = socket;
    // interaction.ajax.post.url = 'http://localhost/events/index.php';
    // interaction.ajax.get.url = 'http://localhost/events';
    interaction
        .connect()
        .watch();

    interaction.$on('redraw.client', function(obj) {
        drawingBoard.reScale(obj);
        dropZone.style.width = obj.stack.width + "px";
        dropZone.style.height = obj.stack.height + "px";
    });
}

function buildColorPicker(list, _pickerZone) {
    var option = "";
    list.forEach(function(color) {
        option += '<option value="' + color + '" style="background:' + color + '" ' + ((color === 'black') ? 'selected="true"' : "") + '>' + color + '</option>';
    });
    _pickerZone.innerHTML = option;
    option = "";
}

function capture() {
    drawingBoard.getDataURL(console.log);
}


function refresh() {
    history.go();
}
build();