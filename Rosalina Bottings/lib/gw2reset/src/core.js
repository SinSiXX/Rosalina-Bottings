'use strict';
  var gw2reset = {},
    resetHourNAWvW = 1,
    resetHourEUWvW = 18,

    guid = 1,
    guidProp = '_gw2reset_guid',

    ms1Hour = 3600000,
    ms1Second = 1000,
    ms3Seconds = 3 * ms1Second,

    setZeroTime = function (d) {
      d.setUTCHours(0);
      d.setUTCMinutes(0);
      d.setUTCSeconds(0);
      d.setUTCMilliseconds(0);
      return d;
    },

    isFriday = function (d) {
      return d.getUTCDay() === 5;
    },
    isSaturday = function (d) {
      return d.getUTCDay() === 6;
    },
    isBeforeReset = function (d, resetHour) {
      var h = d.getUTCHours();
      if (h < resetHour) {
        return true;
      }
      return false;
    },
    /* dayOffset is an integer from 0 through 6
       representing Sunday through Saturday (like .getUTCDay)
       getNextDay(0) gets the next Sunday, getNextDay(1) gets the next Monday, etc. */
    getNextDay = function (d, dayOffset) {
      var currentDay = d.getUTCDay(),
        offset;

      offset = dayOffset - currentDay;
      offset += offset <= 0 ? 7 : 0;

      d.setUTCDate(d.getUTCDate() + offset);
      d = setZeroTime(d);
      return d;
    },

    getFridayAfter = function (d) {
      return getNextDay(d, 5);
    },
    getSaturdayAfter = function (d) {
      return getNextDay(d, 6);
    },
    getSundayAfter = function (d) {
      return getNextDay(d, 0);
    },

    getNextDailyReset = function () {
      var d = new Date();
      d = setZeroTime(d);
      d.setUTCDate(d.getUTCDate() + 1);
      return d;
    },

    getPreviousDailyReset = function () {
      var d = getNextDailyReset();
      d.setUTCDate(d.getUTCDate() - 1);
      return d;
    },

    getNextGuildReset = function () {
      var d = new Date();
      return getSundayAfter(d);
    },

    getPreviousGuildReset = function () {
      var d = getNextGuildReset();
      d.setUTCDate(d.getUTCDate() - 7);
      return d;
    },

    // WvW
    getNextNAWvWReset = function () {
      var d = new Date();

      if (!(isSaturday(d) && isBeforeReset(d, resetHourNAWvW))) {
        d = getSaturdayAfter(d);
      }

      d = setZeroTime(d);
      d.setUTCHours(resetHourNAWvW);

      return d;
    },
    getPreviousNAWvWReset = function () {
      var d = getNextNAWvWReset();
      d.setUTCDate(d.getUTCDate() - 7);
      return d;
    },
    getNextEUWvWReset = function () {
      var d = new Date();

      if (!(isFriday(d) && isBeforeReset(d, resetHourEUWvW))) {
        d = getFridayAfter(d);
      }

      d = setZeroTime(d);
      d.setUTCHours(resetHourEUWvW);

      return d;
    },
    getPreviousEUWvWReset = function () {
      var d = getNextEUWvWReset();
      d.setUTCDate(d.getUTCDate() - 7);
      return d;
    },

    getNextTick = function (d) {
      var interval = d.getTime() - Date.now();
      interval /= 2;

      if (interval > ms1Hour) {
        interval = ms1Hour;
      }

      if (interval < ms3Seconds) {
        interval = ms1Second;
      }

      return Math.floor(interval);
    },

    queues = {
    },

    getIndexByGuid = function (arr, guid) {
      var out;
      arr.some(function (item, index) {
        if (item[guidProp] === guid) {
          out = index;
          return true;
        }
        return false;
      });
      return out;
    },

    timerRun = function (type) {
      var n = Date.now(),
        queue = queues[type];
      if (n > queue.next.getTime()) {
        queue.next = queue.getNext();
        queue.callbacks.forEach(function (callback) {
          callback();
        });
      }

      if (queue.timer !== null) {
        queue.timer = setTimeout(timerRun.bind(null, type), getNextTick(queue.next));
      }
    },
    startTimer = function (type) {
      if (queues[type].callbacks.length > 0 && queues[type].timer === null) {
        queues[type].next = queues[type].getNext();
        queues[type].timer = false; // make .timer non-null so timerRun runs setTimeout. Don't have an actual id yet so set it false so we can differentiate it from null timers.
        timerRun(type);
      }
    },
    stopTimer = function (type) {
      var queue = queues[type],
        timerId = queue.timer;
      if (timerId !== null && timerId !== false) {
        clearTimeout(timerId);
      }
      queue.timer = null;
    },
    addToQueue = function (type, callback) {
      if (!callback[guidProp]) {
        callback[guidProp] = guid;
        guid += 1;
      }
      queues[type].callbacks.push(callback);
      startTimer(type);
    },
    clearQueue = function (type, callback) {
      var index;
      if (!callback) {
        queues[type].callbacks = [];
      } else {
        index = getIndexByGuid(queues[type].callbacks, callback[guidProp]);
        if (index !== undefined) {
          queues[type].callbacks.splice(index, 1);
        }
      }
      if (queues[type].callbacks.length < 1) {
        stopTimer(type);
      }
    },
    createQueue = function (type, getNext) {
      queues[type] = {
        add: addToQueue.bind(null, type),
        clear: clearQueue.bind(null, type),
        callbacks: [],
        timer: null,
        next: null,
        getNext: getNext
      };
    },
    createOn = function (type) {
      return function (callback) {
        queues[type].add(callback);
      };
    },
    createOff = function (type) {
      return function (callback) {
        queues[type].clear(callback);
      };
    },

    onDaily = createOn('daily'),
    onGuild = createOn('guild'),
    onNAWvW = createOn('NAWvW'),
    onEUWvW = createOn('EUWvW'),

    offDaily = createOff('daily'),
    offGuild = createOff('guild'),
    offNAWvW = createOff('NAWvW'),
    offEUWvW = createOff('EUWvW');

  createQueue('daily', getNextDailyReset);
  createQueue('guild', getNextGuildReset);
  createQueue('NAWvW', getNextNAWvWReset);
  createQueue('EUWvW', getNextEUWvWReset);

gw2reset.daily = {
  next: getNextDailyReset,
  previous: getPreviousDailyReset,
  on: onDaily,
  off: offDaily
};
gw2reset.guild = {
   next: getNextGuildReset,
   previous: getPreviousGuildReset,
   on: onGuild,
   off: offGuild
};
gw2reset.wvw = {
  na: {
    next: getNextNAWvWReset,
    previous: getPreviousNAWvWReset,
    on: onNAWvW,
    off: offNAWvW
  },
  eu: {
    next: getNextEUWvWReset,
    previous: getPreviousEUWvWReset,
    on: onEUWvW,
    off: offEUWvW
  }
};
