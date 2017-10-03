
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

    /** Used to get or set the attribute. The value must be the default undefined to read, otherwise it is set. If set to null, the attribute is removed. */
    att(type, element, value = undefined) {
        if (!element) {
            debugger;
        }

        if (value === undefined) {
            return element.getAttribute(this.selector + type);
        } else {
            if (value !== null) {
                element.setAttribute(this.select + type, value);
            } else {
                element.removeAttribute(this.select + type);
            }
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
    elements(type, element = this.root) {
        return element.querySelectorAll('[' + this.selector + type + ']');
    }

    /** Sets a style on a DOM element. */
    style(element, key, value) {
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
            var pageAtt = self.att('page', page);

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
        self.initPage(self.activePage, () => {

            var parameters = {};

            var openedEvent = self.att('opened', self.activePage);

            if (openedEvent) {
                var result = self.call(openedEvent, parameters, self.activePage);

                if (result && result.constructor.name === 'Promise') {
                    result.then((data) => {
                        self.bind(self.activePage, data);
                    });
                }
                else {
                    self.bind(self.activePage, result);
                }

                // Call the opened page and grab the return data structure used for binding.
                //var data = await this.root[openedEvent](parameters, page);
            }

        });

        // var pages = document.getElementsByClassName('page-open');

        // if (pages.length > 0) {
        //     pages[0].classList.remove('page-open');
        // }

        // var page = document.getElementById('page-' + id);
        // page.classList.add('page-open');
    }

    sanitizeDataSelector(text) {
        return text.split('-').join('.');
    }

    bind(element, data) {
        var self = this;

        var bindingElements = self.elements('bind', element);

        for (var i = 0; i < bindingElements.length; i++) {
            var inputElement = bindingElements[i];
            var bindAttribute = self.att('bind', inputElement);

            if (bindAttribute !== null) {
                var dataValue = self.getData(data, self.sanitizeDataSelector(bindAttribute));

                if (dataValue === undefined) {
                    // We'll force the dataValue to be null, so we won't see "undefined" text in input fields.
                    dataValue = null;
                }

                if (inputElement.nodeName === 'INPUT') {
                    inputElement.value = dataValue;
                }
                else if (inputElement.nodeName === 'SELECT') {
                    // Clear the existing list so we don't populate with duplicates.
                    inputElement.innerHTML = '';

                    if (dataValue.constructor.name === 'Array') {
                        for (var i = 0; i < dataValue.length; i++) {
                            var optionData = dataValue[i];
                            var opt = document.createElement('option');

                            // If the structure binded to the list has value/label syntax, use that, if not, use same value for both value and innerText.
                            if (optionData.label !== undefined) {
                                opt.value = optionData.value;
                                opt.innerText = optionData.label;
                            }
                            else {
                                opt.value = optionData;
                                opt.innerText = optionData;
                            }

                            inputElement.appendChild(opt);
                        }
                    }
                    else { // If there is only a single value that is not an array, we'll support that by making a single option value.
                        var opt = document.createElement('option');
                        opt.value = dataValue;
                        opt.innerText = dataValue;
                        inputElement.appendChild(opt);
                    }
                } else {
                    inputElement.innerHTML = dataValue;
                }
            }
        }

        // Hook up repeater lists.
        var repeaters = self.elements('list', element);

        repeaters.forEach((repeater) => {

            // Reset the repeater on every bind.

            var listatt = self.att('list', repeater).split('|');

            if (listatt.length != 2) {
                throw new Error('The list binding must include item name and array name, separated by an pipe ("|")');
            }

            var listdata = data[listatt[1]];
            var listitems = self.elements('item', repeater);

            var itemtemplates = [];

            listitems.forEach((listitem) => {
                var listatt = self.att('item', listitem);
                itemtemplates.push({ key: listatt, element: listitem });
            });

            // item actions are registered with a different action attribute than normal actions, the item-action.
            var itemActions = self.elements('item-action', repeater);

            // Repeat all items in the available data array.
            listdata.forEach((item) => {
                // Repeat all the items in the item.
                for (var k in item) {
                    if (item.hasOwnProperty(k)) {

                        var key = k;
                        var value = item[k];

                        // Find all elements that binds to the key.
                        var filteredItems = itemtemplates.filter((itemtemplate) => itemtemplate.key === key);

                        filteredItems.forEach((filteredItem) => {
                            filteredItem.element.innerHTML = value;
                        });
                    }
                }

                itemActions.forEach((itemAction) => {
                    itemAction.addEventListener('click', (event) => {
                        self.call(self.att('item-action', itemAction), event, event.srceElement, item);
                    });
                });
            });

            // Make sure we don't initialize again.
            // if (repeater.getAttribute(this.selector + 'init') === 'true') {
            //     return;
            // }

            // action.addEventListener('click', (e) => {
            //     self.onPage(e);
            // });

            // repeater.setAttribute(this.selector + 'init', 'true');
        });


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
    call(methodName, event, source, data) {
        if (methodName.toLowerCase() === 'eval') { // A minor basic attempt to improve security.
            this.log('What are you trying to do?');
            return;
        }

        var func = this.app[methodName];

        if (!func) {
            this.log('Handler not defined for: ' + methodName);
        } else {
            this.log('Calling: ' + methodName);
            return func(this, event, source, data);
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

    onAction(event, data) {
        this.call(this.att('action', event.srcElement), event, event.srcElement, data);
    }

    /** Attempts to find an attribute on parents if not exists on child. */
    findAttribute(element, attributeName) {
        if (!element) {
            return null;
        }

        var attribute = this.att('open', element);

        if (attribute) {
            return attribute;
        }
        else {
            return this.findAttribute(element.parentElement);
        }
    }

    onPage(event) {
        var attribute = this.findAttribute(event.srcElement);
        this.page(attribute);
    }

    /** Initializes a page. */
    initPage(page, cb) {
        var self = this;

        if (!page) {
            return;
        }

        self.show(page);

        var viewUrl = null;
        var pageAtt = self.att('page', page);

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
                var existingAttributeValue = this.att('page', page);

                page.setAttribute(this.selector + 'page', existingAttributeValue.replace(viewUrl, ''));
                page.innerHTML = html;

                // Init again, which will hook up handlers and binding.
                self.initPage(page, cb);
            });
        }
        else {
            var actionLinks = self.elements('action');

            actionLinks.forEach((action) => {

                // Make sure we don't initialize again.
                if (self.att('init', action) === 'true') {
                    return;
                }

                // Since we need to gain access to the scoped elements within this method inside the click handler, it
                // must be registered with in-line method as oppose to a simple handler functions (if we want to avoid global instance reference).
                action.addEventListener('click', (e) => {
                    var data = null;

                    // If the action source has a form connected, we'll parse it and supply it's content to the action handler.
                    if (e.srcElement.form) {
                        var inputElements = e.srcElement.form.getElementsByTagName('input');
                        var selectElements = e.srcElement.form.getElementsByTagName('select');

                        data = {
                        };

                        for (var i = 0; i < inputElements.length; i++) {
                            var input = inputElements[i];

                            if (input.name === '') {
                                continue;
                            }

                            var id = this.sanitizeDataSelector(input.name);
                            var value = input.value;

                            this.setData(data, id, value);

                            // Replace the form input fields.
                            input.value = null;
                        }

                        for (var i = 0; i < selectElements.length; i++) {
                            var select = selectElements[i];

                            if (select.name === '') {
                                continue;
                            }

                            var id = this.sanitizeDataSelector(select.name);
                            var value = select.value;

                            this.setData(data, id, value);

                            // Replace the form input fields.
                            //select.value = null;
                        }
                    }

                    self.onAction(e, data);
                });

                self.att('init', action, 'true');
            });

            // Hook up page navigations
            var pageLinks = this.elements('open');

            pageLinks.forEach((action) => {

                // Make sure we don't initialize again.
                if (self.att('init', action) === 'true') {
                    return;
                }

                action.addEventListener('click', (e) => {
                    self.onPage(e);
                });

                self.att('init', action, 'true');
            });

            cb();
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

        this.initPage(startPage, () => {
            this.call('onStarted');
        });

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
    }
}
