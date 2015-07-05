'use strict';

var React = require('react');
var merge = require('merge');

/**
 * metaBuilder builds the metadata used by res.render and res.send
 * @param  {ReactElement}   reactElement
 * @param  {Object}         config
 * @return {JSON or Object}
 */
var metaBuilder = function(reactElement, config) {
    var isPjax = config.isPjax === true,
        isJSON = config.isJSON === true,
        reactState = config.reactState,
        _json = {};

    _json[config.reactStateTag] = JSON.stringify(reactState);
    // if no custom header, do server-side rendering
    if (!isPjax) {
        _json[config.reactMarkupTag] = React.renderToString(reactElement(reactState));
    }

    var _meta = merge(_json, config.meta || {});
    if (isJSON) {
        return JSON.stringify(_meta);
    } else {
        return _meta;
    }

};

/**
 * pjax
 * @param  {Object}
 * @return {Response}
 */
var pjax = function(options) {

    var opts = options || {},
        reqHeader = opts.reqHeader || 'X-REACT-PJAX',
        reactStateTag = opts.reactStateTag || 'reactState',
        reactMarkupTag = opts.reactMarkupTag || 'markup';

    return function(req, res, next) {

        if (req.header(reqHeader)) {
            req.isPjax = true;
        } else {
            req.isPjax = false;
        }

        res.pjaxJson = function(reactElement, reactState, meta) {
            res.setHeader('Content-Type', 'application/json');
            res.send(metaBuilder(reactElement, {
                isPjax: req.isPjax,
                reactState: reactState || '',
                reactStateTag: reactStateTag,
                reactMarkupTag: reactMarkupTag,
                meta: meta || {}
            }));
        };

        res.pjaxRender = function(view, reactElement, reactState, meta) {
            res.render(view, metaBuilder(reactElement, {
                isPjax: req.isPjax,
                reactState: reactState || '',
                reactStateTag: reactStateTag,
                reactMarkupTag: reactMarkupTag,
                meta: meta || {},
                isJSON: false
            }));
        };

        next();
    };

};

module.exports = pjax;
