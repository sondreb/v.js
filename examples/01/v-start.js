import { V } from '../../src/v.js';
import { MyApp } from './v-app.js';

// Sample that relies on globally defined handlers.
var appHeader = new V({
    root: 'header',
    logging: true
});

// Sample that relies on a class instance for handlers.
var app = new V({
    root: 'my-app',
    selector: 'v',
    logging: true,
    start: 'page-home',
    app: new MyApp()
});

// Even though these variables are not initialized within a class, they are not registered globally.
// If you need to access these instances somewhere else in code, you can uncomment this code:

// window.myApp = app;
