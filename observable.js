/**
 * A simple Observer implementation used by Observable.
 * Observers are instantiated by an Observable subscribe call.
 * A chain of observers is created as each Observable subscribes to its upstream
 * predecessor.  Each Observer is connected to its downstream neighbour via the
 * destination property.
 */
var SafeObserver = /** @class */ (function () {
    function SafeObserver(destination) {
        // constructor enforces that we are always subscribed to destination
        this.isUnsubscribed = false;
        this.destination = destination;
        if (destination.unsub) {
            this.unsub = destination.unsub;
        }
    }
    /**
     * Notifications stream through the Observer chain via successive next calls.
     * @param value notification payload
     */
    SafeObserver.prototype.next = function (value) {
        if (!this.isUnsubscribed) {
            this.destination.next(value);
        }
    };
    /**
     * terminates the stream.
     */
    SafeObserver.prototype.complete = function () {
        if (!this.isUnsubscribed) {
            this.destination.complete();
            this.unsubscribe();
        }
    };
    /**
     * clean up at completion
     */
    SafeObserver.prototype.unsubscribe = function () {
        if (!this.isUnsubscribed) {
            this.isUnsubscribed = true;
            if (this.unsub)
                this.unsub();
        }
    };
    return SafeObserver;
}());
/**
 * Implementation of a simple Observable stream, to present a basic
 * Functional Reactive Programming interface.
 * Course notes:
 * https://docs.google.com/document/d/1V6maVGJX0J4ySdbkzVtIogC5pX3dh5fxKpBAsDIf4FU/edit#bookmark=id.1bu517452per
 */
var Observable = /** @class */ (function () {
    /**
     * @param _subscribe subscription function applied to the associated Observer (Observer is created by Observable constructor)
     */
    function Observable(_subscribe) {
        this._subscribe = _subscribe;
    }
    /**
     * Subscribes an observer to this observable
     * @param next action to perform on Observer firing
     * @param complete action to perform when Observer is completed
     * @return the unsubscribe function
     */
    Observable.prototype.subscribe = function (next, complete) {
        var safeObserver = new SafeObserver({
            next: next,
            complete: complete ? complete : function () { return console.log('complete'); }
        });
        safeObserver.unsub = this._subscribe(safeObserver);
        return safeObserver.unsubscribe.bind(safeObserver);
    };
    /**
     * create an Observable from a DOM Event
     * @param el HTML Element
     * @param name of event to observe
     * @return Observable with payload of Event objects
     */
    Observable.fromEvent = function (el, name) {
        return new Observable(function (observer) {
            var listener = (function (e) { return observer.next(e); });
            el.addEventListener(name, listener);
            return function () { return el.removeEventListener(name, listener); };
        });
    };
    /**
     * create an Observable sequence from an Array
     * @param arr array of elements to be passed through Observable
     * @return Observable of the array elements
     */
    Observable.fromArray = function (arr) {
        return new Observable(function (observer) {
            arr.forEach(function (el) { return observer.next(el); });
            observer.complete();
            return function () { };
        });
    };
    /**
     * The observable notifies repeatedly with the specified delay
     * @param milliseconds interval between observable notifications
     * @return Observable payload is total elapsed time
     */
    Observable.interval = function (milliseconds) {
        return new Observable(function (observer) {
            var elapsed = 0;
            var handle = setInterval(function () { return observer.next(elapsed += milliseconds); }, milliseconds);
            return function () { return clearInterval(handle); };
        });
    };
    /**
     * create a new observable that observes this observable and applies the transform function on next
     * @param transform function applied to each input from the upstream Observable
     * @return Observable of the result of transform
     */
    Observable.prototype.map = function (transform) {
        var _this = this;
        return new Observable(function (observer) {
            return _this.subscribe(function (e) { return observer.next(transform(e)); }, function () { return observer.complete(); });
        });
    };
    /** basically a ``tap'' function applies f to the input and passes that input (unchanged) downstream
     * @param f function applied to each input
     * @return Observable of the unchanged input
     */
    Observable.prototype.forEach = function (f) {
        var _this = this;
        return new Observable(function (observer) {
            return _this.subscribe(function (e) {
                f(e);
                return observer.next(e);
            }, function () { return observer.complete(); });
        });
    };
    /**
     * create a new observable that observes this observable but only conditionally notifies next
     * @param condition filter predicate
     * @return child Observable of only notifications that satisfy the condition
     */
    Observable.prototype.filter = function (condition) {
        var _this = this;
        // Your code here ...
        return new Observable(function (observer) {
            return _this.subscribe(function (e) {
                if (condition(e))
                    observer.next(e);
            }, function () { return observer.complete(); });
        });
    };
    /**
     * creates a child Observable that is detached when the given Observable fires
     * @param o Observable whose notification will complete this Observable
     * @return child Observable of notifications up until o fires
     */
    Observable.prototype.takeUntil = function (o) {
        var _this = this;
        return new Observable(function (observer) {
            var oUnsub = o.subscribe(function (_) {
                observer.complete();
                oUnsub();
            });
            return _this.subscribe(function (e) { return observer.next(e); }, function () {
                observer.complete();
                oUnsub();
            });
        });
    };
    /**
     * every time this Observable is notified, create an Observable using the specified stream creator
     * output is "flattened" into the original stream
     * @param streamCreator function to create the incoming Observable stream
     * @return single ``flattened'' stream from all the created observables
     */
    Observable.prototype.flatMap = function (streamCreator) {
        var _this = this;
        return new Observable(function (observer) {
            return _this.subscribe(function (t) { return streamCreator(t).subscribe(function (o) { return observer.next(o); }); }, function () { return observer.complete(); });
        });
    };
    /**
     * Similar to Fold or Reduce, but notifies with cumulative result of every input.
     * http://reactivex.io/documentation/operators/scan.html
     * @param initialVal starting value for accumulation
     * @param param binary accumulator function
     * @return Observable stream of V accumulated using the specified fun
     */
    Observable.prototype.scan = function (initialVal, fun) {
        var _this = this;
        return new Observable(function (observer) {
            var accumulator = initialVal;
            return _this.subscribe(function (v) {
                accumulator = fun(accumulator, v);
                observer.next(accumulator);
            }, function () { return observer.complete(); });
        });
    };
    return Observable;
}());
