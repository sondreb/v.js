function onExpandHeader() {
    var headerTitle = document.getElementById('header-title');
    headerTitle.style.display = 'block';
}

function onCollapseHeader() {
    var headerTitle = document.getElementById('header-title');
    headerTitle.style.display = 'none';
}

function onStart() {
    console.log('onStart from header module!');
}