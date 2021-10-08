exports.validateEmail = function (value) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
}
exports.validatePhone = function (value) {
    var phoneno = /^\+?([0-9]{2})\)?[- ]?([0-9]{3})[- ]?([0-9]{4})[- ]?([0-9]{4})$/;
    return value.match(phoneno);
}
exports.getRandom = function (min, max) {
    return Math.random() * (max - min) + min;
}
const crypto = require('crypto')
exports.identify = function (socket, opts) {
    // Define (hackish enough) way of identifying users
    const clientInfo = {}
    const options = opts || { hash: true }

    if (typeof socket.request !== 'undefined') {
        if (typeof socket.request.headers !== 'undefined') {
            if (typeof socket.request.headers['x-real-ip'] !== 'undefined') {
                clientInfo['x-real-ip'] = socket.request.headers['x-real-ip']
            }
            if (typeof socket.request.headers['x-forwarded-for'] !== 'undefined') {
                clientInfo['x-forwarded-for'] = socket.request.headers['x-forwarded-for']
            }
        }
        if (typeof socket.request.connection !== 'undefined') {
            if (typeof socket.request.connection.remoteAddress !== 'undefined') {
                clientInfo['remoteAddress'] = socket.request.connection.remoteAddress
            }
        }
    }

    return options.hash ? crypto.createHmac('sha256', JSON.stringify(clientInfo)).digest('hex') : JSON.stringify(clientInfo)
}

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
