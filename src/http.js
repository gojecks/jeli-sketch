/**
 * 
 * @param {*} options 
 */
function http(options, resolve, reject) {
    if (typeof options === "object") {
        var rawFile = new XMLHttpRequest(),
            data;
        rawFile.open(options.method, options.url, options.async || true);

        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    var contentType = rawFile.getResponseHeader('content-type');
                    if (/json/.test(options.dataType || contentType)) {
                        data = JSON.parse(rawFile.responseText);
                    } else if (/xml/.test(options.dataType || contentType)) {
                        data = parseXML(rawFile.responseText);
                    } else {
                        data = rawFile.responseText;
                    }

                    // trigger success
                    (resolve || function() {})(data);
                } else {
                    // trigger error
                    (reject || function() {})();
                }
            }
        }

        switch (options.method.toLowerCase()) {
            case ('post'):
                if (options.data && typeof options.data === "object") {
                    options.data = JSON.stringify(options.data);
                }
                break;
        }
        //send the request
        rawFile.send(options.data);
    }
};