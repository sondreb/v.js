
//** first parameter is the v instance, the second parameter is the source DOM element. third parameter is additional data. */
function onExpandHeader(v, s, d) {
    v.show('header-title', 'block');
    v.hide(s)
    v.show('collapse-button');
}

function onCollapseHeader(v, s) {
    v.hide('header-title');
    v.hide(s)
    v.show('expand-button');
}

function onStart(v) {
    v.hide('expand-button');
}

function onStarted(v) {
    //v.hide('expand-button');
}