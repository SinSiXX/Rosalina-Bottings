gw2reset.js is a small library for calculating and dealing with [reset times](http://wiki.guildwars2.com/wiki/Upcoming_changes_and_features#Automated_changes) in Guild Wars 2.

The API is it is divided up into 4 namespaces:

* `gw2reset.daily` provides methods for dealing with the daily reset.
* `gw2reset.guild` provides methods for dealing with the weekly Guild reward reset.
* `gw2reset.wvw.na` provides methods for dealing with the North American WvW reset.
* `gw2reset.wvw.eu` provides methods for dealing with the European WvW reset.

Each of these namespaces provides 4 methods:

* `.previous` returns a `Date` object representing the previous time this item reset.
* `.next` returns a `Date` object representing the next time this item will reset.
* `.on` receives an event handler that will fire every time this reset happens
* `.off` if passed a reference to an event handler, that handler will be removed.
  If no parameters are passed, all handlers will be removed.

Installation
------------
You can install gw2reset by one of these methods:
* Bower: `bower install gw2reset`
* npm: `npm install gw2reset`
* Clone the Git repo.
* Or just grab a copy of the .min.js file from the dist/ dir.
