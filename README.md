# react-pjax

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

Simple middleware of PJAX implementation with ReactJS

##Semantics

This module provides a solution for how to use PJAX with ReactJS, when a request with custom PJAX header is received, only state will be returned for partial update without server-side rendered markup. If it is not a PJAX request, markup and state will be returned together.

## Install

```bash
$ npm install react-pjax
```

## API v2.0

Integrate res.pjaxJson and res.pjaxRender in version 1.0.

#### res.pjaxRender(view,meta)

If custom PJAX header exists, it returns JSON. Otherwise it applies classic res.render(view,meta).

#### res.pjaxRender(view,meta,reactElement,reactState)

If custom PJAX header exists, a JSON merged meta with reactState will be returned. Otherwise, it renders the specified view with passing markup and state, sends the rendered HTML to client side.

#### [Deprecated] res.pjaxJson(reactElement,reactState,meta)

## API v1.0

```javascript
var reactPjax = require('react-pjax');
```

### reactPjax(options)

Create a new middleware with the options as follow.

#### Options

The module accepts these properties in the options object.

##### reqHeader (optional)

The header name to identify whether it is a PJAX request. Default is 'X-REACT-PJAX'.

##### reactStateTag (optional)

The property name of state in the returned object inside res.send() and res.render(). Default is 'reactState'.

##### reactMarkupTag (optional)

The property name of markup in the returned object inside res.send() and res.render(). Default is 'reactState'.

### Usage

There are currently two methods, res.pjaxJson and res.pjaxRender.

#### res.pjaxJson(reactElement,reactState,meta)

It returns a JSON.

##### reactElement

React element. It is defined by `var MyReactElement = React.createFactory(require('MyReactComponent'));`

##### reactState

React state in JSON format. It is used in server side rendering (SSR). e.g. `React.renderToString(MyReactElement(reactState));`

##### meta (optional)

Meta is an object with properties. (e.g. title)

#### res.pjaxRender(view,reactElement,reactState,meta)

Render your view with passing markup and state, sends the rendered HTML to client side. (Deprecated since v2.0)

##### view

Name of view.

## Example

### Application entry point (index.js)

```js
var reactPjax = require('react-pjax');
var express = require('express')

var app = express();

app.use(reactPjax({
    reqHeader: 'using-pjax',
    reactStateTag: 'myReactState',
    reactMarkupTag: 'myReactMarkup'
}));

/**
 * or using default setting
 *
 * app.use(reactPjax());
 */
```

### Controller handles the request and response

```js
var MyReactElement = React.createFactory(require('MyReactComponent'));

/*API v1.0*/
app.get('/', function(req, res) {
    res.pjaxRender('index', MyReactElement, myReactState, {
        title: 'home'
    });
});

app.get('/json', function(req, res) {
    res.pjaxJson(MyReactElement, myReactState, {
        foo: 'bar'
    });
});
/*API v2.0*/
app.get('/', function(req, res) {
    res.pjaxRender('index', {
        title: 'home'
    }, MyReactElement, myReactState);
});

app.get('/json', function(req, res) {
    res.pjaxRender('index', {
        foo: 'bar'
    }, MyReactElement, myReactState);
});
```

View (index.dust)

```html
{>"layouts/master" /}
{body}
    {markup|s}
    <script type="application/json" id="reactState">{reactState|s}</script>
{/body}
```

`reactState` is the reactStateTag and `markup` is the reactMarkupTag.

## License

[MIT](LICENSE)

## Copyright

Copyright (C) 2015 Tony Ngan, released under the MIT License.

[npm-url]: https://npmjs.org/package/react-pjax
[npm-image]: https://img.shields.io/npm/v/react-pjax.svg
[downloads-url]: https://npmjs.org/package/react-pjax
[downloads-image]: https://img.shields.io/npm/dm/react-pjax.svg
