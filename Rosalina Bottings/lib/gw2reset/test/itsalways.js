/*!
 * itsalways.js v1.0.0
 * Copyright 2014 Peter Johnson
 * MIT license
 * https://github.com/uselesscode/itsalways.js
 */
var itsalways=function(n){"use strict";var t=n.UTC(2e3,0,1,0,0,0,0),e=function(){return t},a=function(){var e=[].slice.call(arguments,0);return 0===e.length?new n(t):new(Function.prototype.bind.apply(n,[null].concat(e)))};return a.UTC=function(){var t=[].slice.call(arguments,0);return n.UTC.apply(n,t)},a.now=function(){return t},a.parse=function(t){return n.parse(t)},e.set=function(){var e=[].slice.call(arguments,0);t=(new(Function.prototype.bind.apply(n,[null].concat(e)))).getTime()},e.UTC=function(){var e=[].slice.call(arguments,0);t=n.UTC.apply(n,e)},e.stop=function(){Date=n},e.start=function(){Date=a},e}(Date);