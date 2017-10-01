
/** v.js is a tiny and quick library for interactive web apps.
 *  v0.0.1
 * 
 * URL: https://github.com/sondreb/v.js
 */
export class V {
    constructor(configuration) {
        if (!configuration) {
            configuration = {};
        }

        this.logging = configuration.logging;

        if (configuration.root) {
            this.root = this.el(configuration.root);
        } else {
            this.root = window.document;
        }

        this.log('Root configured to be: ', this.root);

        this.selector = 'data-';

        if (configuration.namespace) {
            this.namespace = configuration.namespace;
            this.selector += configuration.namespace + '-';
        } else {
            this.namespace = 'v';
            this.selector += 'v-';
        }

        this.log('Namespace: ' + this.namespace);
        this.log('Selector: ' + this.selector);

        if (configuration.app) {
            this.app = configuration.app;
        }
        else {
            this.app = window;
        }

        this.log('App object: ', this.app);

        if (configuration.start) {
            this.start = configuration.start;
            this.log('Start page: ', this.start);
        }

        this.activePage = null;

        this.init();
    }

    log(text, params) {
        if (!this.logging) {
            return;
        }

        if (params) {
            console.debug('v.js: ' + text, params);
        }
        else {
            console.debug('v.js: ' + text);
        }
    }

    error(text, params) {
        if (params) {
            console.error('v.js error: ' + text, params);
        }
        else {
            console.error('v.js error: ' + text);
        }
    }

    /** Selects a DOM element based upon the ID if input is a string. Else the same object is returned. */
    el(id) {
        if (typeof id === 'string') {
            return document.getElementById(id);
        } else {
            return id;
        }
    }
    
    /** Returns all elements using a query selector. */
    elements(type) {
        return this.root.querySelectorAll('[' + this.selector + type + ']');
    }

    /** Sets a style on a DOM element. */
    style(element, key, value)
    {
        element.style[key] = value;
    }

    /** Hides a DOM element. */
    hide(element) {
        var domElement = this.el(element);

        if (domElement) {
            this.style(domElement, 'display', 'none');
        }
    }

    /** Shows a DOM element. The "type" parameter can be used to display as block, as oppose to the default "inline-block". */
    show(element, type) {
        var domElement = this.el(element);

        if (!type) {
            type = 'inline-block';
        }

        if (domElement) {
            this.style(domElement, 'display', type);
        }
    }

    /** Navigates to a page. */
    page(id) {
        var self = this;

        // Hide the previous active page.
        self.hide(self.activePage);

        // data-v-page
        var pages = self.elements('page');

        var page = null;

        pages.forEach((page) => {
            var pageAtt = page.getAttribute(self.selector + 'page');

            if (pageAtt) {
                var values = pageAtt.split('|');

                if (values.length > 0) {
                    var pageName = values[0];

                    if (pageName == id) {
                        self.activePage = page;
                        return;
                    }
                }
            }
        });

        if (!self.activePage) {
            self.error('Unable to find a corresponding page for the action. Page name: ' + id);
            return;
        }

        self.show(self.activePage);
        self.initPage(self.activePage);

        // var pages = document.getElementsByClassName('page-open');

        // if (pages.length > 0) {
        //     pages[0].classList.remove('page-open');
        // }

        // var page = document.getElementById('page-' + id);
        // page.classList.add('page-open');

        var parameters = {};

        var openedEvent = self.activePage.getAttribute(this.selector + 'opened');

        if (openedEvent) {
            //var data = self.call(openedEvent, parameters, page);
            //self.bind(page, data);

            // Call the opened page and grab the return data structure used for binding.
            //var data = await this.root[openedEvent](parameters, page);
        }
    }

    bind(element, data) {
        var children = element.children;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];

            var bindAttribute = child.getAttribute(this.selector + 'bind');

            if (bindAttribute !== null) {
                var dataValue = this.getData(data, bindAttribute);

                if (dataValue === undefined) {
                    // We'll force the dataValue to be null, so we won't see "undefined" text in input fields.
                    dataValue = null;
                }

                if (child.nodeName === 'INPUT') {
                    child.value = dataValue;
                } else {
                    child.innerHTML = dataValue;
                }
            }

            this.bind(child, data);
        }
    }

    /** Get's a field on an object. */
    getData(data, prop) {
        if (typeof data === 'undefined') {
            return;
        }

        var _index = prop.indexOf('.');

        if (_index > -1) {
            return this.getData(data[prop.substring(0, _index)], prop.substr(_index + 1));
        }

        return data[prop];
    }

    /** Sets a field on an object. */
    setData(data, prop, value) {
        if (typeof data === 'undefined') {
            return;
        }

        var _index = prop.indexOf('.');

        if (_index > -1) {
            if (data[prop.substring(0, _index)] === undefined) {
                // Populate the data structure with a new empty object structure.
                data[prop.substring(0, _index)] = {};
            }

            return this.setData(data[prop.substring(0, _index)], prop.substr(_index + 1), value);
        }

        data[prop] = value;
    }

    /** Calls a method. */
    call(methodName, action, data) {
        if (methodName.toLowerCase() === 'eval') { // A minor basic attempt to improve security.
            this.log('What are you trying to do?');
            return;
        }

        var func = this.app[methodName];

        if (!func) {
            this.log('Handler not defined for: ' + methodName);
        } else {
            this.log('Calling: ' + methodName);
            //this.error('Calling: ' + methodName);
            func(this, action, data);
        }
    }

    /** Downloads files using XMLHttpRequest. */
    download(url, callback) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                callback(xhttp.responseText);
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }

    /** Initializes a page. */
    initPage(page) {
        var self = this;

        if (!page) {
            return;
        }

        self.show(page);

        var viewUrl = null;
        var pageAtt = page.getAttribute(this.selector + 'page');

        if (pageAtt) {
            var pageSetup = pageAtt.split('|');

            console.log(pageSetup);

            if (pageSetup.length > 1) {
                viewUrl = pageSetup[1].trim();
            }
        }

        this.activePage = page;

        // If there is a view URL, we need to download and cache the HTML view template.
        if (viewUrl) {
            this.download(viewUrl, (html) => {
                // After loading, remove the attribute and we'll re-call this same method to init the page.
                var existingAttributeValue = page.getAttribute(this.selector + 'page');

                page.setAttribute(this.selector + 'page', existingAttributeValue.replace(viewUrl, ''));
                page.innerHTML = html;

                // Init again, which will hook up handlers and binding.
                self.initPage(page);
            });
        }
        else {
            var actionLinks = self.root.querySelectorAll('[' + this.selector + 'action]');

            actionLinks.forEach((action) => {
                action.addEventListener('click', (source) => {
                    // Find all input element contained within the parent element that has a class named "input-form".
                    // var inputForm = findParentWithClass(action, 'input-form');

                    // if (inputForm) {
                    //     var inputElements = inputForm.getElementsByTagName('input');

                    //     var data = {
                    //     };

                    //     for (var i = 0; i < inputElements.length; i++) {
                    //         var input = inputElements[i];

                    //         var id = input.name.replace('-', '.');
                    //         var value = input.value;

                    //         setData(data, id, value);

                    //         // Replace the form input fields.
                    //         input.value = null;
                    //     }
                    // }

                    var data = {};

                    self.call(action.getAttribute(this.selector + 'action'), action, data);
                });
            });

            // Hook up page navigations
            var pageLinks = this.root.querySelectorAll('[' + this.selector + 'open]');

            pageLinks.forEach((action) => {
                action.addEventListener('click', () => {
                    this.page(action.getAttribute(this.selector + 'open'));
                });
            });

        }
    }

    /** Hides all pages. */
    hidePages() {
        var self = this;

        // Hide all defined pages by default.
        var pages = this.elements('page');

        pages.forEach((page) => {
            self.hide(page);
        });

        return pages;
    }

    /** Initialize method for v.js. */
    init() {
        var self = this;

        this.call('onStart');

        // Hide all the pages initially.
        var pages = this.hidePages();

        // Find the start page or select the first available page.
        var startPage = null;

        if (this.start) {
            startPage = document.getElementById(this.start);

            if (!startPage) {
                self.error('Unable to find the specified start page.');
            }

        } else {
            if (pages.length > 0) { // If no start page is defined, use the first.
                startPage = pages[0];
            }
            else { // If no pages is defined, use root.
                startPage = this.root;
            }
        }

        this.initPage(startPage);

        // // Hook up page navigations
        // var pageLinks = this.root.querySelectorAll('[' + this.namespace + 'page]');

        // pageLinks.forEach((action) => {
        //     action.addEventListener('click', () => {
        //         this.page(action.getAttribute(this.namespace + 'page'));
        //     });
        // });

        // // Hook up actions
        // var actionLinks = document.querySelectorAll('[' + this.namespace + 'action]');

        // actionLinks.forEach((action) => {
        //     action.addEventListener('click', (source) => {
        //         // Find all input element contained within the parent element that has a class named "input-form".
        //         var inputForm = findParentWithClass(action, 'input-form');

        //         if (inputForm) {
        //             var inputElements = inputForm.getElementsByTagName('input');

        //             var data = {
        //             };

        //             for (var i = 0; i < inputElements.length; i++) {
        //                 var input = inputElements[i];

        //                 var id = input.name.replace('-', '.');
        //                 var value = input.value;

        //                 setData(data, id, value);

        //                 // Replace the form input fields.
        //                 input.value = null;
        //             }
        //         }

        //         window[action.getAttribute(this.namespace + 'action')](action, data);
        //     });
        // });

        window.onbeforeunload = function (event) {
            self.call('onEnd');

            // var message = 'Discard changes?';
            // if (typeof event == 'undefined') {
            //     event = window.event;
            // }
            // if (event) {
            //     event.returnValue = message;
            // }
            // return message;
        };

        this.call('onStarted');
    }
}
