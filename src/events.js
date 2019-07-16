/**
 * 
 * @param {*} evName 
 * @param {*} fn 
 */
function $on(evName, fn) {
    this._events[evName] = fn;
    return this;
}

/**
 * 
 * @param {*} evName 
 * @param {*} arg 
 */
function trigger(evName, arg) {
    if (this._events[evName]) {
        this._events[evName].call(this._events[evName], arg);
    }

    return this;
}