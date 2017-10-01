# v.js
v.js is a tiny and modern library for interactive web apps.

## Features

v.js will only have a basic set of functionality, and you can decide to extend upon that if you want to. If you need more features, either extend or try something else.

v.js is currently in prototype stage and not ready for use. Use at your own risk.

v.js is built up around handlers (functions) for actions that happens in your web app. To make things simpler for you, you can either build a class that holds your handlers, or you can simply rely on global functions.

v.js supports actions, page views with external view loading, and form input and binding.

## Reference v.js

```html
<script src="v.js"></script>
```

## Initialize

Within your application logic, e.g. a file named "app.js" which must be included after the "v.js", you can initialize the v.js like the following example:

```js
var app = new V();
```

This is the most simple way of doing the initialization. There are options you can set to further customize the bootstrapping of v.js.

```js
var app = new V({
    root: 'my-app', 
    namespace: 'v', // 
    app: new MyApp() 
});
```
It can be used in two manners: global functions or scoped functions attached to the V instance through the app instance.

## v.js configuration options
* root: The starting HTML element. You can use multiple V instances that are connected to different HTML elements. If you don't supply the root ID, the body element will be used. This property is the ID of the DOM element, the only selector supported for root element.
* namespace: The namespace for data-* attributes. The default value is "v", you can specify custom values.
* app: Creates a new instance of an class where all your event handlers and callback handlers are registered. By default, the V instance will attempt to find the handlers on the global object.
* start: The id of the start page. If not set, will the first page be used.
* logging: Enables verbose debug logging.

## Pages

All pages in v.js are simply HTML elements, nothing more and nothing less.

Pages can be either in-line in the same markup as the rest of the page, or they can be dynamically loaded.


```html
<div id="page-welcome" data-v-page>
    Pages must started with "v-page" (or your custom namespace override) in their IDs.
</div>
```

```html
<div id="page-welcome" data-v-page="page-home.html">Loading...</div>
```

## Page Navigation

Navigating pages are done using the "data-v-page" attribute on buttons.

```html
<button data-v-page="welcome">Open Welcome Page</button>

<div id="page-welcome">
    <h1>Welcome page!</h1>
    <p>This is the introduction.</p>
</div>
```

When this button is clicked, the HTML element with the ID "page-welcome" will be come visible.

If you want to know when a page has been activated, you can register a handler using the "data-v-opened" attribute.

```html
<div id="page-welcome" data-v-opened="onDetailsOpened">
```

When a page navigation occurs, v.js will attempt to either call a globally defined function named onDetailsOpened, or if the app instance is defined on the V instance, that will be used.

```js
async function onDetailsOpened(parameters, page) {

}
```

The parameters are supplied custom parameters to the navigation, and the page is a DOM element reference to the page object itself.

## Forms and input

v.js supports basic forms and input. Simply create input fields either with a form element or any HTML element with the class "v-form". Everything with the form, or the element with class "v-form", will be submitted to the action handler. Having the option of using any HTML element with the class v-form, allows you to have a virtual form within a normal form. HTML specification does not allow a form within a form.

```html
<div class="v-form">
    <input type="text" name="profile-nickname">
    <button data-v-action="onProfileSave">Save</button>
</div>
```

The handler for actions receives the source and data. The source if the button that triggered the action, and the data contains a nicely formatted structure that maps the properties to individuals objects based on the "-" separator.

```js
function onProfileSave(source, data) {
    var nickname = data.profile.nickname;
}
```

### Binding

On the page handlers, you can load and set the data object which is then used by the data-v-bind attributes. If we expand the previous example, it will look like this:

```html
<form>
    <input type="text" name="profile-nickname" data-v-bind="profile.nickname">
    <button data-ume-action="onProfileSave">Save</button>
</form>
```

Within the data-v-opened page handler for this page, you must return an object containing a profile structure with a nickname value.

```js
async function onDetailsOpened(parameters, page) {

    var identity = await getUser(parameters);

    var data = {
        profile: identity.profile;
    };

    return data;
}
```

## Styling

To avoid pages being shown during initial load, you can copy the following CSS and include it in the head element of your HTML page. You must replace "v" with your custom namespace if you use that.

```css
    <style>
        [data-v-page] {
        display: none;
        }
    </style>
```

You also need to add this class to all pages, except the starting page.

## Lifecycle Hooks

**OnStart** - called at the very beginning when V is starting up. This occurs before any view parsing.

**OnStarted** - called when start initilization has completed.

**OnNavigation** - global handler for page navigation, can be used as an alternative to specific handlers for each page.

**OnEnd** - called when navigation away from the web app occurs or browser has been closed. You should not rely on this always being called, especially not if the browser crashes.

# Principles

v.js is built on certain principles which is partly responsible for its existence.

v.js is built to reduce dependency on third party libraries. This is partly to improve the security, by reducing dependencies and total amount of code.

v.js should be small enough for any developer to read and review in a short amount of time.

v.js should use the native capabilities of modern browsers and not take any care for backwards compatibility.

# Development and examples

If you want to contribute with development on v.js, clone the repo and install the watch-http-server globally:

```
npm install -g watch-http-server
```

Then run to host a webserver:

```
npm start
```

Then you can navigate to [http://localhost:8080/examples/01/](http://localhost:8080/examples/01/) to see the first example.

# To import, or not to import

v.js can be used with the latest import functionality in latest JavaScript versions, but you don't have to. Have a look at the samples which shows how to do both.

* [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) - defered and scoped module loading.

# License

v.js is published under "[The Unlicense](LICENSE)", making it as free as possible to do with as you please. Can be used for commercial projects, open source and everything else.
