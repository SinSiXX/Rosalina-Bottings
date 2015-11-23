/*****************************************************************
  * Delayed: A collection of setTimeout-related function wranglers
  * Copyright (c) Rod Vagg (@rvagg) 2014
  * https://github.com/rvagg/delayed
  * License: MIT
  */

!(function init (name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define === 'function' && define.amd) define(name, definition)
  else this[name] = definition()
}('delayed', function setup () {

  var context = this
    , old     = context.delayed
    , deferMs = 1


  function slice (arr, i) {
    return Array.prototype.slice.call(arr, i)
  }


  function delay (fn, ms, ctx) {
    var args = slice(arguments, 3)
    return setTimeout(function delayer () {
      fn.apply(ctx || null, args)
    }, ms)
  }


  function defer (fn, ctx) {
    return delay.apply(null, [ fn, deferMs, ctx ].concat(slice(arguments, 2)))
  }


  function delayed () {
    var args = slice(arguments)
    return function delayeder () {
      return delay.apply(null, args.concat(slice(arguments)))
    }
  }


  function deferred (fn, ctx) {
    return delayed.apply(null, [ fn, deferMs, ctx ].concat(slice(arguments, 2)))
  }


  function cumulativeDelayed (fn, ms, ctx) {
    var args = slice(arguments, 3)
      , timeout = null

    return function cumulativeDelayeder () {
      var _args = slice(arguments)
        , f = function cumulativeDelayedCaller () {
            return fn.apply(ctx || null, args.concat(_args))
          }
      if (timeout != null)
        clearTimeout(timeout)
      return timeout = setTimeout(f, ms)
    }
  }


  function noConflict () {
    context.delayed = old
    return this
  }


  return {
      delay             : delay
    , defer             : defer
    , delayed           : delayed
    , deferred          : deferred
    , noConflict        : noConflict
    , cumulativeDelayed : cumulativeDelayed
    , debounce          : cumulativeDelayed
  }

}));
