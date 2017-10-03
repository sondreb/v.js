
//** first parameter is the v instance, the second parameter is the source DOM element. third parameter is additional data. */
function onExpandHeader(v, event, source, data) {
    v.show('header-title', 'block');
    v.hide(source)
    v.show('collapse-button');
}

function onCollapseHeader(v, event, source, data) {
    v.hide('header-title');
    v.hide(source)
    v.show('expand-button');
}

function onStart(v) {
    v.hide('expand-button');
}

function onStarted(v) {
    //v.hide('expand-button');
}