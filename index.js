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

        res.pjaxRender = function(view, meta, reactElement, reactState){
            if(reactElement===undefined){
                if(req.isPjax){
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(meta));
                } else {
                    res.render(view, meta);
                }
            } else {
                var _basicMeta = {
                    isPjax: req.isPjax,
                    reactState: reactState || '',
                    reactStateTag: reactStateTag,
                    reactMarkupTag: reactMarkupTag,
                    meta: meta || {}
                };
                if(req.isPjax){
                    res.send(metaBuilder(reactElement, _basicMeta));
                } else {
                    res.render(view, metaBuilder(reactElement, merge(_basicMeta,{isJSON:false})));
                }
            }
        };

        next();
    };

};

module.exports = pjax;
