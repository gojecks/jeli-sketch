/**
 * 
 * @param {*} dropZone 
 * @param {*} definition 
 * @param {*} cb 
 */
function canvasTextArea(dropZone, definition, cb) {
    var modal = new Modal(dropZone),
        fonts = ['serif', 'Georgia', '"Palatino Linotype"', '"Book Antiqua"', 'Palatino', '"Times New Roman"', 'Times', 'Arial', 'Helvetica', 'sans-serif', '"Arial Black"', 'Gadget', '"Comic Sans MS"', 'cursive', 'Impact', 'Charcoal', '"Lucida Sans Unicode"', '"Lucida Grande"', 'Tahoma', 'Geneva', '"Trebuchet MS"', 'Helvetica', 'Verdana', '"Courier New"', '"Lucida Console"'];

    // add the html to the container
    modal.addContent('<div style="padding:.5em 0px">Size: <select id="modalSizePicker"></select> Font:<select id="modalFontPicker"></select></div>\
        <div><textarea style="width:100%;border: 1px solid #000"></textarea></div>\
        <div><button style="float:right;">Done</button></div><br clear="both" />');
    var textArea = modal.querySelector('textarea'),
        sizePicker = modal.querySelector('select#modalSizePicker'),
        fontPicker = modal.querySelector('select#modalFontPicker'),
        button = modal.querySelector('button');

    if (definition.text) {
        textArea.value = definition.text;
    }

    // generate size picker
    var pickerOptions = '';
    for (var i = 1; i <= 50; i++) {
        var size = (i * 2);
        pickerOptions += '<option value="' + size + '"' + ((size === definition.fontSize) ? ' selected' : '') + '>' + size + '</option>';
    }
    sizePicker.innerHTML = pickerOptions;

    var fontOptions = '';
    fonts.forEach(function(font) {
        fontOptions += '<option value=' + font + ' style=font-family:' + font + ((font === definition.fontFamily) ? ' selected' : '') + '> ' + font + ' </option>';
    });
    fontPicker.innerHTML = fontOptions;
    /**
     * addEvent to button
     * on click trigger callback and remove modal
     */
    button.addEventListener('click', function() {
        definition.text = textArea.value;
        definition.fontSize = sizePicker.value;
        definition.fontFamily = fontPicker.value;

        cb();
        modal.destroy();
    });

    modal.init({
        left: definition.x,
        top: definition.y
    });
    // focus on textArea
    textArea.focus();
}