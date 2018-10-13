function addSaveButton() {
    let closeButton = $('#button_clear');

    if(!closeButton) {
        return;
    }

    let buttonSave = $('<a title="Save Image" class="button_toolbar save" id="button_save" download></a>');
    buttonSave.click(() => saveImage(buttonSave));
    closeButton.after(buttonSave);
}

function saveImage(button) {
    let canvas = $('#canvas');
    var dataURL = canvas[0].toDataURL('image/png');
    button.attr('href', dataURL);
}