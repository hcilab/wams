(() => {
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
/*
 * WAMS code to be executed in the client browser.
 */ /**
 * This file defines the entry point for the client side of a WAMS application.
 *
 * <br>
 * <img
 * src =
 * "https://raw.githubusercontent.com/mvanderkamp/wams.wiki/master/graphs/client.png"
 * style = "max-height: 200px;"
 * >
 *
 * @module client
 */ "use strict";
var $e307541a347955a1$exports = {};
"use strict";
const $f2d8da374b4b349a$export$c169aefb7330cccb = Object.create(null); // no Map = no polyfill
$f2d8da374b4b349a$export$c169aefb7330cccb["open"] = "0";
$f2d8da374b4b349a$export$c169aefb7330cccb["close"] = "1";
$f2d8da374b4b349a$export$c169aefb7330cccb["ping"] = "2";
$f2d8da374b4b349a$export$c169aefb7330cccb["pong"] = "3";
$f2d8da374b4b349a$export$c169aefb7330cccb["message"] = "4";
$f2d8da374b4b349a$export$c169aefb7330cccb["upgrade"] = "5";
$f2d8da374b4b349a$export$c169aefb7330cccb["noop"] = "6";
const $f2d8da374b4b349a$export$47791e8004edd485 = Object.create(null);
Object.keys($f2d8da374b4b349a$export$c169aefb7330cccb).forEach((key)=>{
    $f2d8da374b4b349a$export$47791e8004edd485[$f2d8da374b4b349a$export$c169aefb7330cccb[key]] = key;
});
const $f2d8da374b4b349a$export$c718b5840781f8a7 = {
    type: "error",
    data: "parser error"
};


const $8030ebc9004ffa85$var$withNativeBlob = typeof Blob === "function" || typeof Blob !== "undefined" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]";
const $8030ebc9004ffa85$var$withNativeArrayBuffer = typeof ArrayBuffer === "function";
// ArrayBuffer.isView method is not defined in IE10
const $8030ebc9004ffa85$var$isView = (obj)=>{
    return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj && obj.buffer instanceof ArrayBuffer;
};
const $8030ebc9004ffa85$var$encodePacket = ({ type: type , data: data  }, supportsBinary, callback)=>{
    if ($8030ebc9004ffa85$var$withNativeBlob && data instanceof Blob) {
        if (supportsBinary) return callback(data);
        else return $8030ebc9004ffa85$var$encodeBlobAsBase64(data, callback);
    } else if ($8030ebc9004ffa85$var$withNativeArrayBuffer && (data instanceof ArrayBuffer || $8030ebc9004ffa85$var$isView(data))) {
        if (supportsBinary) return callback(data);
        else return $8030ebc9004ffa85$var$encodeBlobAsBase64(new Blob([
            data
        ]), callback);
    }
    // plain string
    return callback((0, $f2d8da374b4b349a$export$c169aefb7330cccb)[type] + (data || ""));
};
const $8030ebc9004ffa85$var$encodeBlobAsBase64 = (data, callback)=>{
    const fileReader = new FileReader();
    fileReader.onload = function() {
        const content = fileReader.result.split(",")[1];
        callback("b" + (content || ""));
    };
    return fileReader.readAsDataURL(data);
};
var $8030ebc9004ffa85$export$2e2bcd8739ae039 = $8030ebc9004ffa85$var$encodePacket;



// imported from https://github.com/socketio/base64-arraybuffer
const $3982f4088db19486$var$chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
// Use a lookup table to find the index.
const $3982f4088db19486$var$lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for(let i = 0; i < $3982f4088db19486$var$chars.length; i++)$3982f4088db19486$var$lookup[$3982f4088db19486$var$chars.charCodeAt(i)] = i;
const $3982f4088db19486$export$c564cdbbe6da493 = (arraybuffer)=>{
    let bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = "";
    for(i = 0; i < len; i += 3){
        base64 += $3982f4088db19486$var$chars[bytes[i] >> 2];
        base64 += $3982f4088db19486$var$chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
        base64 += $3982f4088db19486$var$chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
        base64 += $3982f4088db19486$var$chars[bytes[i + 2] & 63];
    }
    if (len % 3 === 2) base64 = base64.substring(0, base64.length - 1) + "=";
    else if (len % 3 === 1) base64 = base64.substring(0, base64.length - 2) + "==";
    return base64;
};
const $3982f4088db19486$export$2f872c0f2117be69 = (base64)=>{
    let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
    if (base64[base64.length - 1] === "=") {
        bufferLength--;
        if (base64[base64.length - 2] === "=") bufferLength--;
    }
    const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
    for(i = 0; i < len; i += 4){
        encoded1 = $3982f4088db19486$var$lookup[base64.charCodeAt(i)];
        encoded2 = $3982f4088db19486$var$lookup[base64.charCodeAt(i + 1)];
        encoded3 = $3982f4088db19486$var$lookup[base64.charCodeAt(i + 2)];
        encoded4 = $3982f4088db19486$var$lookup[base64.charCodeAt(i + 3)];
        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return arraybuffer;
};


const $d0fcdc5a9956e2a7$var$withNativeArrayBuffer = typeof ArrayBuffer === "function";
const $d0fcdc5a9956e2a7$var$decodePacket = (encodedPacket, binaryType)=>{
    if (typeof encodedPacket !== "string") return {
        type: "message",
        data: $d0fcdc5a9956e2a7$var$mapBinary(encodedPacket, binaryType)
    };
    const type = encodedPacket.charAt(0);
    if (type === "b") return {
        type: "message",
        data: $d0fcdc5a9956e2a7$var$decodeBase64Packet(encodedPacket.substring(1), binaryType)
    };
    const packetType = (0, $f2d8da374b4b349a$export$47791e8004edd485)[type];
    if (!packetType) return 0, $f2d8da374b4b349a$export$c718b5840781f8a7;
    return encodedPacket.length > 1 ? {
        type: (0, $f2d8da374b4b349a$export$47791e8004edd485)[type],
        data: encodedPacket.substring(1)
    } : {
        type: (0, $f2d8da374b4b349a$export$47791e8004edd485)[type]
    };
};
const $d0fcdc5a9956e2a7$var$decodeBase64Packet = (data, binaryType)=>{
    if ($d0fcdc5a9956e2a7$var$withNativeArrayBuffer) {
        const decoded = (0, $3982f4088db19486$export$2f872c0f2117be69)(data);
        return $d0fcdc5a9956e2a7$var$mapBinary(decoded, binaryType);
    } else return {
        base64: true,
        data: data
    }; // fallback for old browsers
};
const $d0fcdc5a9956e2a7$var$mapBinary = (data, binaryType)=>{
    switch(binaryType){
        case "blob":
            return data instanceof ArrayBuffer ? new Blob([
                data
            ]) : data;
        case "arraybuffer":
        default:
            return data; // assuming the data is already an ArrayBuffer
    }
};
var $d0fcdc5a9956e2a7$export$2e2bcd8739ae039 = $d0fcdc5a9956e2a7$var$decodePacket;


const $9bf46e541922caf5$var$SEPARATOR = String.fromCharCode(30); // see https://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
const $9bf46e541922caf5$export$144d64fe58dad441 = (packets, callback)=>{
    // some packets may be added to the array while encoding, so the initial length must be saved
    const length = packets.length;
    const encodedPackets = new Array(length);
    let count = 0;
    packets.forEach((packet, i)=>{
        // force base64 encoding for binary packets
        (0, $8030ebc9004ffa85$export$2e2bcd8739ae039)(packet, false, (encodedPacket)=>{
            encodedPackets[i] = encodedPacket;
            if (++count === length) callback(encodedPackets.join($9bf46e541922caf5$var$SEPARATOR));
        });
    });
};
const $9bf46e541922caf5$export$d10cc2e7f7566a2d = (encodedPayload, binaryType)=>{
    const encodedPackets = encodedPayload.split($9bf46e541922caf5$var$SEPARATOR);
    const packets = [];
    for(let i = 0; i < encodedPackets.length; i++){
        const decodedPacket = (0, $d0fcdc5a9956e2a7$export$2e2bcd8739ae039)(encodedPackets[i], binaryType);
        packets.push(decodedPacket);
        if (decodedPacket.type === "error") break;
    }
    return packets;
};
const $9bf46e541922caf5$export$a51d6b395ff4c65a = 4;


function $db2c3bd39de38ed9$export$4293555f241ae35a(obj) {
    if (obj) return $db2c3bd39de38ed9$var$mixin(obj);
}
/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */ function $db2c3bd39de38ed9$var$mixin(obj) {
    for(var key in $db2c3bd39de38ed9$export$4293555f241ae35a.prototype)obj[key] = $db2c3bd39de38ed9$export$4293555f241ae35a.prototype[key];
    return obj;
}
/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */ $db2c3bd39de38ed9$export$4293555f241ae35a.prototype.on = $db2c3bd39de38ed9$export$4293555f241ae35a.prototype.addEventListener = function(event, fn) {
    this._callbacks = this._callbacks || {};
    (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
    return this;
};
/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */ $db2c3bd39de38ed9$export$4293555f241ae35a.prototype.once = function(event, fn) {
    function on() {
        this.off(event, on);
        fn.apply(this, arguments);
    }
    on.fn = fn;
    this.on(event, on);
    return this;
};
/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */ $db2c3bd39de38ed9$export$4293555f241ae35a.prototype.off = $db2c3bd39de38ed9$export$4293555f241ae35a.prototype.removeListener = $db2c3bd39de38ed9$export$4293555f241ae35a.prototype.removeAllListeners = $db2c3bd39de38ed9$export$4293555f241ae35a.prototype.removeEventListener = function(event, fn) {
    this._callbacks = this._callbacks || {};
    // all
    if (0 == arguments.length) {
        this._callbacks = {};
        return this;
    }
    // specific event
    var callbacks = this._callbacks["$" + event];
    if (!callbacks) return this;
    // remove all handlers
    if (1 == arguments.length) {
        delete this._callbacks["$" + event];
        return this;
    }
    // remove specific handler
    var cb;
    for(var i = 0; i < callbacks.length; i++){
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1);
            break;
        }
    }
    // Remove event specific arrays for event types that no
    // one is subscribed for to avoid memory leak.
    if (callbacks.length === 0) delete this._callbacks["$" + event];
    return this;
};
/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */ $db2c3bd39de38ed9$export$4293555f241ae35a.prototype.emit = function(event) {
    this._callbacks = this._callbacks || {};
    var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event];
    for(var i = 1; i < arguments.length; i++)args[i - 1] = arguments[i];
    if (callbacks) {
        callbacks = callbacks.slice(0);
        for(var i = 0, len = callbacks.length; i < len; ++i)callbacks[i].apply(this, args);
    }
    return this;
};
// alias used for reserved events (protected method)
$db2c3bd39de38ed9$export$4293555f241ae35a.prototype.emitReserved = $db2c3bd39de38ed9$export$4293555f241ae35a.prototype.emit;
/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */ $db2c3bd39de38ed9$export$4293555f241ae35a.prototype.listeners = function(event) {
    this._callbacks = this._callbacks || {};
    return this._callbacks["$" + event] || [];
};
/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */ $db2c3bd39de38ed9$export$4293555f241ae35a.prototype.hasListeners = function(event) {
    return !!this.listeners(event).length;
};


const $5a9ef5aab719729c$export$394f9358f6231289 = (()=>{
    if (typeof self !== "undefined") return self;
    else if (typeof window !== "undefined") return window;
    else return Function("return this")();
})();


function $8ba281d8602934c4$export$357523c63a2253b9(obj, ...attr) {
    return attr.reduce((acc, k)=>{
        if (obj.hasOwnProperty(k)) acc[k] = obj[k];
        return acc;
    }, {});
}
// Keep a reference to the real timeout functions so they can be used when overridden
const $8ba281d8602934c4$var$NATIVE_SET_TIMEOUT = (0, $5a9ef5aab719729c$export$394f9358f6231289).setTimeout;
const $8ba281d8602934c4$var$NATIVE_CLEAR_TIMEOUT = (0, $5a9ef5aab719729c$export$394f9358f6231289).clearTimeout;
function $8ba281d8602934c4$export$2f67576668b97183(obj, opts) {
    if (opts.useNativeTimers) {
        obj.setTimeoutFn = $8ba281d8602934c4$var$NATIVE_SET_TIMEOUT.bind((0, $5a9ef5aab719729c$export$394f9358f6231289));
        obj.clearTimeoutFn = $8ba281d8602934c4$var$NATIVE_CLEAR_TIMEOUT.bind((0, $5a9ef5aab719729c$export$394f9358f6231289));
    } else {
        obj.setTimeoutFn = (0, $5a9ef5aab719729c$export$394f9358f6231289).setTimeout.bind((0, $5a9ef5aab719729c$export$394f9358f6231289));
        obj.clearTimeoutFn = (0, $5a9ef5aab719729c$export$394f9358f6231289).clearTimeout.bind((0, $5a9ef5aab719729c$export$394f9358f6231289));
    }
}
// base64 encoded buffers are about 33% bigger (https://en.wikipedia.org/wiki/Base64)
const $8ba281d8602934c4$var$BASE64_OVERHEAD = 1.33;
function $8ba281d8602934c4$export$a48f0734ac7c2329(obj) {
    if (typeof obj === "string") return $8ba281d8602934c4$var$utf8Length(obj);
    // arraybuffer or blob
    return Math.ceil((obj.byteLength || obj.size) * $8ba281d8602934c4$var$BASE64_OVERHEAD);
}
function $8ba281d8602934c4$var$utf8Length(str) {
    let c = 0, length = 0;
    for(let i = 0, l = str.length; i < l; i++){
        c = str.charCodeAt(i);
        if (c < 0x80) length += 1;
        else if (c < 0x800) length += 2;
        else if (c < 0xd800 || c >= 0xe000) length += 3;
        else {
            i++;
            length += 4;
        }
    }
    return length;
}


class $be63a89c53bdd5ba$var$TransportError extends Error {
    constructor(reason, description, context){
        super(reason);
        this.description = description;
        this.context = context;
        this.type = "TransportError";
    }
}
class $be63a89c53bdd5ba$export$86495b081fef8e52 extends (0, $db2c3bd39de38ed9$export$4293555f241ae35a) {
    /**
     * Transport abstract constructor.
     *
     * @param {Object} opts - options
     * @protected
     */ constructor(opts){
        super();
        this.writable = false;
        (0, $8ba281d8602934c4$export$2f67576668b97183)(this, opts);
        this.opts = opts;
        this.query = opts.query;
        this.socket = opts.socket;
    }
    /**
     * Emits an error.
     *
     * @param {String} reason
     * @param description
     * @param context - the error context
     * @return {Transport} for chaining
     * @protected
     */ onError(reason, description, context) {
        super.emitReserved("error", new $be63a89c53bdd5ba$var$TransportError(reason, description, context));
        return this;
    }
    /**
     * Opens the transport.
     */ open() {
        this.readyState = "opening";
        this.doOpen();
        return this;
    }
    /**
     * Closes the transport.
     */ close() {
        if (this.readyState === "opening" || this.readyState === "open") {
            this.doClose();
            this.onClose();
        }
        return this;
    }
    /**
     * Sends multiple packets.
     *
     * @param {Array} packets
     */ send(packets) {
        if (this.readyState === "open") this.write(packets);
    }
    /**
     * Called upon open
     *
     * @protected
     */ onOpen() {
        this.readyState = "open";
        this.writable = true;
        super.emitReserved("open");
    }
    /**
     * Called with data.
     *
     * @param {String} data
     * @protected
     */ onData(data) {
        const packet = (0, $d0fcdc5a9956e2a7$export$2e2bcd8739ae039)(data, this.socket.binaryType);
        this.onPacket(packet);
    }
    /**
     * Called with a decoded packet.
     *
     * @protected
     */ onPacket(packet) {
        super.emitReserved("packet", packet);
    }
    /**
     * Called upon close.
     *
     * @protected
     */ onClose(details) {
        this.readyState = "closed";
        super.emitReserved("close", details);
    }
    /**
     * Pauses the transport, in order not to lose packets during an upgrade.
     *
     * @param onPause
     */ pause(onPause) {}
}


// imported from https://github.com/unshiftio/yeast
"use strict";
const $b02a24b88decc9b7$var$alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""), $b02a24b88decc9b7$var$length = 64, $b02a24b88decc9b7$var$map = {};
let $b02a24b88decc9b7$var$seed = 0, $b02a24b88decc9b7$var$i = 0, $b02a24b88decc9b7$var$prev;
function $b02a24b88decc9b7$export$c564cdbbe6da493(num) {
    let encoded = "";
    do {
        encoded = $b02a24b88decc9b7$var$alphabet[num % $b02a24b88decc9b7$var$length] + encoded;
        num = Math.floor(num / $b02a24b88decc9b7$var$length);
    }while (num > 0);
    return encoded;
}
function $b02a24b88decc9b7$export$2f872c0f2117be69(str) {
    let decoded = 0;
    for($b02a24b88decc9b7$var$i = 0; $b02a24b88decc9b7$var$i < str.length; $b02a24b88decc9b7$var$i++)decoded = decoded * $b02a24b88decc9b7$var$length + $b02a24b88decc9b7$var$map[str.charAt($b02a24b88decc9b7$var$i)];
    return decoded;
}
function $b02a24b88decc9b7$export$5bb64b92cb4135a() {
    const now = $b02a24b88decc9b7$export$c564cdbbe6da493(+new Date());
    if (now !== $b02a24b88decc9b7$var$prev) return $b02a24b88decc9b7$var$seed = 0, $b02a24b88decc9b7$var$prev = now;
    return now + "." + $b02a24b88decc9b7$export$c564cdbbe6da493($b02a24b88decc9b7$var$seed++);
}
//
// Map each character to its index.
//
for(; $b02a24b88decc9b7$var$i < $b02a24b88decc9b7$var$length; $b02a24b88decc9b7$var$i++)$b02a24b88decc9b7$var$map[$b02a24b88decc9b7$var$alphabet[$b02a24b88decc9b7$var$i]] = $b02a24b88decc9b7$var$i;


function $62ebe56818ac3efc$export$c564cdbbe6da493(obj) {
    let str = "";
    for(let i in obj)if (obj.hasOwnProperty(i)) {
        if (str.length) str += "&";
        str += encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]);
    }
    return str;
}
function $62ebe56818ac3efc$export$2f872c0f2117be69(qs) {
    let qry = {};
    let pairs = qs.split("&");
    for(let i = 0, l = pairs.length; i < l; i++){
        let pair = pairs[i].split("=");
        qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return qry;
}



// imported from https://github.com/component/has-cors
let $ef7bb2d5b27b1fa8$var$value = false;
try {
    $ef7bb2d5b27b1fa8$var$value = typeof XMLHttpRequest !== "undefined" && "withCredentials" in new XMLHttpRequest();
} catch (err) {
// if XMLHttp support is disabled in IE then it will throw
// when trying to create
}
const $ef7bb2d5b27b1fa8$export$5235bbd4a1ef06e = $ef7bb2d5b27b1fa8$var$value;



function $fa3c87f435a30fad$export$a2d42eb087c10497(opts) {
    const xdomain = opts.xdomain;
    // XMLHttpRequest can be disabled on IE
    try {
        if ("undefined" !== typeof XMLHttpRequest && (!xdomain || (0, $ef7bb2d5b27b1fa8$export$5235bbd4a1ef06e))) return new XMLHttpRequest();
    } catch (e) {}
    if (!xdomain) try {
        return new (0, $5a9ef5aab719729c$export$394f9358f6231289)[[
            "Active"
        ].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch (e1) {}
}





function $daae5bc44f7e64a0$var$empty() {}
const $daae5bc44f7e64a0$var$hasXHR2 = function() {
    const xhr = new (0, $fa3c87f435a30fad$export$a2d42eb087c10497)({
        xdomain: false
    });
    return null != xhr.responseType;
}();
class $daae5bc44f7e64a0$export$265ee5eefd4c309b extends (0, $be63a89c53bdd5ba$export$86495b081fef8e52) {
    /**
     * XHR Polling constructor.
     *
     * @param {Object} opts
     * @package
     */ constructor(opts){
        super(opts);
        this.polling = false;
        if (typeof location !== "undefined") {
            const isSSL = "https:" === location.protocol;
            let port = location.port;
            // some user agents have empty `location.port`
            if (!port) port = isSSL ? "443" : "80";
            this.xd = typeof location !== "undefined" && opts.hostname !== location.hostname || port !== opts.port;
            this.xs = opts.secure !== isSSL;
        }
        /**
         * XHR supports binary
         */ const forceBase64 = opts && opts.forceBase64;
        this.supportsBinary = $daae5bc44f7e64a0$var$hasXHR2 && !forceBase64;
    }
    get name() {
        return "polling";
    }
    /**
     * Opens the socket (triggers polling). We write a PING message to determine
     * when the transport is open.
     *
     * @protected
     */ doOpen() {
        this.poll();
    }
    /**
     * Pauses polling.
     *
     * @param {Function} onPause - callback upon buffers are flushed and transport is paused
     * @package
     */ pause(onPause) {
        this.readyState = "pausing";
        const pause = ()=>{
            this.readyState = "paused";
            onPause();
        };
        if (this.polling || !this.writable) {
            let total = 0;
            if (this.polling) {
                total++;
                this.once("pollComplete", function() {
                    --total || pause();
                });
            }
            if (!this.writable) {
                total++;
                this.once("drain", function() {
                    --total || pause();
                });
            }
        } else pause();
    }
    /**
     * Starts polling cycle.
     *
     * @private
     */ poll() {
        this.polling = true;
        this.doPoll();
        this.emitReserved("poll");
    }
    /**
     * Overloads onData to detect payloads.
     *
     * @protected
     */ onData(data) {
        const callback = (packet)=>{
            // if its the first message we consider the transport open
            if ("opening" === this.readyState && packet.type === "open") this.onOpen();
            // if its a close packet, we close the ongoing requests
            if ("close" === packet.type) {
                this.onClose({
                    description: "transport closed by the server"
                });
                return false;
            }
            // otherwise bypass onData and handle the message
            this.onPacket(packet);
        };
        // decode payload
        (0, $9bf46e541922caf5$export$d10cc2e7f7566a2d)(data, this.socket.binaryType).forEach(callback);
        // if an event did not trigger closing
        if ("closed" !== this.readyState) {
            // if we got data we're not polling
            this.polling = false;
            this.emitReserved("pollComplete");
            if ("open" === this.readyState) this.poll();
        }
    }
    /**
     * For polling, send a close packet.
     *
     * @protected
     */ doClose() {
        const close = ()=>{
            this.write([
                {
                    type: "close"
                }
            ]);
        };
        if ("open" === this.readyState) close();
        else // in case we're trying to close while
        // handshaking is in progress (GH-164)
        this.once("open", close);
    }
    /**
     * Writes a packets payload.
     *
     * @param {Array} packets - data packets
     * @protected
     */ write(packets) {
        this.writable = false;
        (0, $9bf46e541922caf5$export$144d64fe58dad441)(packets, (data)=>{
            this.doWrite(data, ()=>{
                this.writable = true;
                this.emitReserved("drain");
            });
        });
    }
    /**
     * Generates uri for connection.
     *
     * @private
     */ uri() {
        let query = this.query || {};
        const schema = this.opts.secure ? "https" : "http";
        let port = "";
        // cache busting is forced
        if (false !== this.opts.timestampRequests) query[this.opts.timestampParam] = (0, $b02a24b88decc9b7$export$5bb64b92cb4135a)();
        if (!this.supportsBinary && !query.sid) query.b64 = 1;
        // avoid port if default for schema
        if (this.opts.port && ("https" === schema && Number(this.opts.port) !== 443 || "http" === schema && Number(this.opts.port) !== 80)) port = ":" + this.opts.port;
        const encodedQuery = (0, $62ebe56818ac3efc$export$c564cdbbe6da493)(query);
        const ipv6 = this.opts.hostname.indexOf(":") !== -1;
        return schema + "://" + (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) + port + this.opts.path + (encodedQuery.length ? "?" + encodedQuery : "");
    }
    /**
     * Creates a request.
     *
     * @param {String} method
     * @private
     */ request(opts = {}) {
        Object.assign(opts, {
            xd: this.xd,
            xs: this.xs
        }, this.opts);
        return new $daae5bc44f7e64a0$export$7fa6c5b6f8193917(this.uri(), opts);
    }
    /**
     * Sends data.
     *
     * @param {String} data to send.
     * @param {Function} called upon flush.
     * @private
     */ doWrite(data, fn) {
        const req = this.request({
            method: "POST",
            data: data
        });
        req.on("success", fn);
        req.on("error", (xhrStatus, context)=>{
            this.onError("xhr post error", xhrStatus, context);
        });
    }
    /**
     * Starts a poll cycle.
     *
     * @private
     */ doPoll() {
        const req = this.request();
        req.on("data", this.onData.bind(this));
        req.on("error", (xhrStatus, context)=>{
            this.onError("xhr poll error", xhrStatus, context);
        });
        this.pollXhr = req;
    }
}
class $daae5bc44f7e64a0$export$7fa6c5b6f8193917 extends (0, $db2c3bd39de38ed9$export$4293555f241ae35a) {
    /**
     * Request constructor
     *
     * @param {Object} options
     * @package
     */ constructor(uri, opts){
        super();
        (0, $8ba281d8602934c4$export$2f67576668b97183)(this, opts);
        this.opts = opts;
        this.method = opts.method || "GET";
        this.uri = uri;
        this.async = false !== opts.async;
        this.data = undefined !== opts.data ? opts.data : null;
        this.create();
    }
    /**
     * Creates the XHR object and sends the request.
     *
     * @private
     */ create() {
        const opts = (0, $8ba281d8602934c4$export$357523c63a2253b9)(this.opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
        opts.xdomain = !!this.opts.xd;
        opts.xscheme = !!this.opts.xs;
        const xhr = this.xhr = new (0, $fa3c87f435a30fad$export$a2d42eb087c10497)(opts);
        try {
            xhr.open(this.method, this.uri, this.async);
            try {
                if (this.opts.extraHeaders) {
                    xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
                    for(let i in this.opts.extraHeaders)if (this.opts.extraHeaders.hasOwnProperty(i)) xhr.setRequestHeader(i, this.opts.extraHeaders[i]);
                }
            } catch (e) {}
            if ("POST" === this.method) try {
                xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
            } catch (e1) {}
            try {
                xhr.setRequestHeader("Accept", "*/*");
            } catch (e2) {}
            // ie6 check
            if ("withCredentials" in xhr) xhr.withCredentials = this.opts.withCredentials;
            if (this.opts.requestTimeout) xhr.timeout = this.opts.requestTimeout;
            xhr.onreadystatechange = ()=>{
                if (4 !== xhr.readyState) return;
                if (200 === xhr.status || 1223 === xhr.status) this.onLoad();
                else // make sure the `error` event handler that's user-set
                // does not throw in the same tick and gets caught here
                this.setTimeoutFn(()=>{
                    this.onError(typeof xhr.status === "number" ? xhr.status : 0);
                }, 0);
            };
            xhr.send(this.data);
        } catch (e3) {
            // Need to defer since .create() is called directly from the constructor
            // and thus the 'error' event can only be only bound *after* this exception
            // occurs.  Therefore, also, we cannot throw here at all.
            this.setTimeoutFn(()=>{
                this.onError(e3);
            }, 0);
            return;
        }
        if (typeof document !== "undefined") {
            this.index = $daae5bc44f7e64a0$export$7fa6c5b6f8193917.requestsCount++;
            $daae5bc44f7e64a0$export$7fa6c5b6f8193917.requests[this.index] = this;
        }
    }
    /**
     * Called upon error.
     *
     * @private
     */ onError(err) {
        this.emitReserved("error", err, this.xhr);
        this.cleanup(true);
    }
    /**
     * Cleans up house.
     *
     * @private
     */ cleanup(fromError) {
        if ("undefined" === typeof this.xhr || null === this.xhr) return;
        this.xhr.onreadystatechange = $daae5bc44f7e64a0$var$empty;
        if (fromError) try {
            this.xhr.abort();
        } catch (e) {}
        if (typeof document !== "undefined") delete $daae5bc44f7e64a0$export$7fa6c5b6f8193917.requests[this.index];
        this.xhr = null;
    }
    /**
     * Called upon load.
     *
     * @private
     */ onLoad() {
        const data = this.xhr.responseText;
        if (data !== null) {
            this.emitReserved("data", data);
            this.emitReserved("success");
            this.cleanup();
        }
    }
    /**
     * Aborts the request.
     *
     * @package
     */ abort() {
        this.cleanup();
    }
}
$daae5bc44f7e64a0$export$7fa6c5b6f8193917.requestsCount = 0;
$daae5bc44f7e64a0$export$7fa6c5b6f8193917.requests = {};
/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */ if (typeof document !== "undefined") {
    // @ts-ignore
    if (typeof attachEvent === "function") // @ts-ignore
    attachEvent("onunload", $daae5bc44f7e64a0$var$unloadHandler);
    else if (typeof addEventListener === "function") {
        const terminationEvent = "onpagehide" in (0, $5a9ef5aab719729c$export$394f9358f6231289) ? "pagehide" : "unload";
        addEventListener(terminationEvent, $daae5bc44f7e64a0$var$unloadHandler, false);
    }
}
function $daae5bc44f7e64a0$var$unloadHandler() {
    for(let i in $daae5bc44f7e64a0$export$7fa6c5b6f8193917.requests)if ($daae5bc44f7e64a0$export$7fa6c5b6f8193917.requests.hasOwnProperty(i)) $daae5bc44f7e64a0$export$7fa6c5b6f8193917.requests[i].abort();
}







const $0d0867257e52d371$export$bdd553fddd433dcb = (()=>{
    const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
    if (isPromiseAvailable) return (cb)=>Promise.resolve().then(cb);
    else return (cb, setTimeoutFn)=>setTimeoutFn(cb, 0);
})();
const $0d0867257e52d371$export$3909fb301d3dc8c9 = (0, $5a9ef5aab719729c$export$394f9358f6231289).WebSocket || (0, $5a9ef5aab719729c$export$394f9358f6231289).MozWebSocket;
const $0d0867257e52d371$export$3407ba5dfb7a683d = true;
const $0d0867257e52d371$export$790dcbc41e2d75d5 = "arraybuffer";



var $ef9975513e2e43d1$export$a143d493d941bafc;
var $ef9975513e2e43d1$export$e4cf37d7f6fb9e0a;
var $ef9975513e2e43d1$export$f99ded8fe4b79145;
var $ef9975513e2e43d1$export$599f31c3813fae4d;
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */ /* eslint-disable no-proto */ "use strict";
var $b5831eb1d6c96426$export$a48f0734ac7c2329;
var $b5831eb1d6c96426$export$d622b2ad8d90c771;
var $b5831eb1d6c96426$export$6100ba28696e12de;
"use strict";
$b5831eb1d6c96426$export$a48f0734ac7c2329 = $b5831eb1d6c96426$var$byteLength;
$b5831eb1d6c96426$export$d622b2ad8d90c771 = $b5831eb1d6c96426$var$toByteArray;
$b5831eb1d6c96426$export$6100ba28696e12de = $b5831eb1d6c96426$var$fromByteArray;
var $b5831eb1d6c96426$var$lookup = [];
var $b5831eb1d6c96426$var$revLookup = [];
var $b5831eb1d6c96426$var$Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
var $b5831eb1d6c96426$var$code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for(var $b5831eb1d6c96426$var$i = 0, $b5831eb1d6c96426$var$len = $b5831eb1d6c96426$var$code.length; $b5831eb1d6c96426$var$i < $b5831eb1d6c96426$var$len; ++$b5831eb1d6c96426$var$i){
    $b5831eb1d6c96426$var$lookup[$b5831eb1d6c96426$var$i] = $b5831eb1d6c96426$var$code[$b5831eb1d6c96426$var$i];
    $b5831eb1d6c96426$var$revLookup[$b5831eb1d6c96426$var$code.charCodeAt($b5831eb1d6c96426$var$i)] = $b5831eb1d6c96426$var$i;
}
// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
$b5831eb1d6c96426$var$revLookup["-".charCodeAt(0)] = 62;
$b5831eb1d6c96426$var$revLookup["_".charCodeAt(0)] = 63;
function $b5831eb1d6c96426$var$getLens(b64) {
    var len = b64.length;
    if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
    // Trim off extra bytes after placeholder bytes are found
    // See: https://github.com/beatgammit/base64-js/issues/42
    var validLen = b64.indexOf("=");
    if (validLen === -1) validLen = len;
    var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
    return [
        validLen,
        placeHoldersLen
    ];
}
// base64 is 4/3 + up to two characters of the original data
function $b5831eb1d6c96426$var$byteLength(b64) {
    var lens = $b5831eb1d6c96426$var$getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function $b5831eb1d6c96426$var$_byteLength(b64, validLen, placeHoldersLen) {
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function $b5831eb1d6c96426$var$toByteArray(b64) {
    var tmp;
    var lens = $b5831eb1d6c96426$var$getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    var arr = new $b5831eb1d6c96426$var$Arr($b5831eb1d6c96426$var$_byteLength(b64, validLen, placeHoldersLen));
    var curByte = 0;
    // if there are placeholders, only get up to the last complete 4 chars
    var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
    var i;
    for(i = 0; i < len; i += 4){
        tmp = $b5831eb1d6c96426$var$revLookup[b64.charCodeAt(i)] << 18 | $b5831eb1d6c96426$var$revLookup[b64.charCodeAt(i + 1)] << 12 | $b5831eb1d6c96426$var$revLookup[b64.charCodeAt(i + 2)] << 6 | $b5831eb1d6c96426$var$revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = tmp >> 16 & 0xFF;
        arr[curByte++] = tmp >> 8 & 0xFF;
        arr[curByte++] = tmp & 0xFF;
    }
    if (placeHoldersLen === 2) {
        tmp = $b5831eb1d6c96426$var$revLookup[b64.charCodeAt(i)] << 2 | $b5831eb1d6c96426$var$revLookup[b64.charCodeAt(i + 1)] >> 4;
        arr[curByte++] = tmp & 0xFF;
    }
    if (placeHoldersLen === 1) {
        tmp = $b5831eb1d6c96426$var$revLookup[b64.charCodeAt(i)] << 10 | $b5831eb1d6c96426$var$revLookup[b64.charCodeAt(i + 1)] << 4 | $b5831eb1d6c96426$var$revLookup[b64.charCodeAt(i + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 0xFF;
        arr[curByte++] = tmp & 0xFF;
    }
    return arr;
}
function $b5831eb1d6c96426$var$tripletToBase64(num) {
    return $b5831eb1d6c96426$var$lookup[num >> 18 & 0x3F] + $b5831eb1d6c96426$var$lookup[num >> 12 & 0x3F] + $b5831eb1d6c96426$var$lookup[num >> 6 & 0x3F] + $b5831eb1d6c96426$var$lookup[num & 0x3F];
}
function $b5831eb1d6c96426$var$encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for(var i = start; i < end; i += 3){
        tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
        output.push($b5831eb1d6c96426$var$tripletToBase64(tmp));
    }
    return output.join("");
}
function $b5831eb1d6c96426$var$fromByteArray(uint8) {
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
    ;
    var parts = [];
    var maxChunkLength = 16383 // must be multiple of 3
    ;
    // go through the array every three bytes, we'll deal with trailing stuff later
    for(var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength)parts.push($b5831eb1d6c96426$var$encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
        tmp = uint8[len - 1];
        parts.push($b5831eb1d6c96426$var$lookup[tmp >> 2] + $b5831eb1d6c96426$var$lookup[tmp << 4 & 0x3F] + "==");
    } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push($b5831eb1d6c96426$var$lookup[tmp >> 10] + $b5831eb1d6c96426$var$lookup[tmp >> 4 & 0x3F] + $b5831eb1d6c96426$var$lookup[tmp << 2 & 0x3F] + "=");
    }
    return parts.join("");
}


/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */ var $a11c6733277d3ca0$export$aafa59e2e03f2942;
var $a11c6733277d3ca0$export$68d8715fc104d294;
$a11c6733277d3ca0$export$aafa59e2e03f2942 = function(buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];
    i += d;
    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;
    for(; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for(; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);
    if (e === 0) e = 1 - eBias;
    else if (e === eMax) return m ? NaN : (s ? -1 : 1) * Infinity;
    else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};
$a11c6733277d3ca0$export$68d8715fc104d294 = function(buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
    } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
        }
        if (e + eBias >= 1) value += rt / c;
        else value += rt * Math.pow(2, 1 - eBias);
        if (value * c >= 2) {
            e++;
            c /= 2;
        }
        if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
        } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
        } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
        }
    }
    for(; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);
    e = e << mLen | m;
    eLen += mLen;
    for(; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);
    buffer[offset + i - d] |= s * 128;
};


const $ef9975513e2e43d1$var$customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" // eslint-disable-line dot-notation
 ? Symbol["for"]("nodejs.util.inspect.custom") // eslint-disable-line dot-notation
 : null;
$ef9975513e2e43d1$export$a143d493d941bafc = $ef9975513e2e43d1$var$Buffer;
$ef9975513e2e43d1$export$e4cf37d7f6fb9e0a = $ef9975513e2e43d1$var$SlowBuffer;
$ef9975513e2e43d1$export$f99ded8fe4b79145 = 50;
const $ef9975513e2e43d1$var$K_MAX_LENGTH = 0x7fffffff;
$ef9975513e2e43d1$export$599f31c3813fae4d = $ef9975513e2e43d1$var$K_MAX_LENGTH;
/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */ $ef9975513e2e43d1$var$Buffer.TYPED_ARRAY_SUPPORT = $ef9975513e2e43d1$var$typedArraySupport();
if (!$ef9975513e2e43d1$var$Buffer.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
function $ef9975513e2e43d1$var$typedArraySupport() {
    // Can typed array instances can be augmented?
    try {
        const arr = new Uint8Array(1);
        const proto = {
            foo: function() {
                return 42;
            }
        };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
    } catch (e) {
        return false;
    }
}
Object.defineProperty($ef9975513e2e43d1$var$Buffer.prototype, "parent", {
    enumerable: true,
    get: function() {
        if (!$ef9975513e2e43d1$var$Buffer.isBuffer(this)) return undefined;
        return this.buffer;
    }
});
Object.defineProperty($ef9975513e2e43d1$var$Buffer.prototype, "offset", {
    enumerable: true,
    get: function() {
        if (!$ef9975513e2e43d1$var$Buffer.isBuffer(this)) return undefined;
        return this.byteOffset;
    }
});
function $ef9975513e2e43d1$var$createBuffer(length) {
    if (length > $ef9975513e2e43d1$var$K_MAX_LENGTH) throw new RangeError('The value "' + length + '" is invalid for option "size"');
    // Return an augmented `Uint8Array` instance
    const buf = new Uint8Array(length);
    Object.setPrototypeOf(buf, $ef9975513e2e43d1$var$Buffer.prototype);
    return buf;
}
/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */ function $ef9975513e2e43d1$var$Buffer(arg, encodingOrOffset, length) {
    // Common case.
    if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") throw new TypeError('The "string" argument must be of type string. Received type number');
        return $ef9975513e2e43d1$var$allocUnsafe(arg);
    }
    return $ef9975513e2e43d1$var$from(arg, encodingOrOffset, length);
}
$ef9975513e2e43d1$var$Buffer.poolSize = 8192 // not used by this implementation
;
function $ef9975513e2e43d1$var$from(value, encodingOrOffset, length) {
    if (typeof value === "string") return $ef9975513e2e43d1$var$fromString(value, encodingOrOffset);
    if (ArrayBuffer.isView(value)) return $ef9975513e2e43d1$var$fromArrayView(value);
    if (value == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
    if ($ef9975513e2e43d1$var$isInstance(value, ArrayBuffer) || value && $ef9975513e2e43d1$var$isInstance(value.buffer, ArrayBuffer)) return $ef9975513e2e43d1$var$fromArrayBuffer(value, encodingOrOffset, length);
    if (typeof SharedArrayBuffer !== "undefined" && ($ef9975513e2e43d1$var$isInstance(value, SharedArrayBuffer) || value && $ef9975513e2e43d1$var$isInstance(value.buffer, SharedArrayBuffer))) return $ef9975513e2e43d1$var$fromArrayBuffer(value, encodingOrOffset, length);
    if (typeof value === "number") throw new TypeError('The "value" argument must not be of type number. Received type number');
    const valueOf = value.valueOf && value.valueOf();
    if (valueOf != null && valueOf !== value) return $ef9975513e2e43d1$var$Buffer.from(valueOf, encodingOrOffset, length);
    const b = $ef9975513e2e43d1$var$fromObject(value);
    if (b) return b;
    if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") return $ef9975513e2e43d1$var$Buffer.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
}
/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/ $ef9975513e2e43d1$var$Buffer.from = function(value, encodingOrOffset, length) {
    return $ef9975513e2e43d1$var$from(value, encodingOrOffset, length);
};
// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf($ef9975513e2e43d1$var$Buffer.prototype, Uint8Array.prototype);
Object.setPrototypeOf($ef9975513e2e43d1$var$Buffer, Uint8Array);
function $ef9975513e2e43d1$var$assertSize(size) {
    if (typeof size !== "number") throw new TypeError('"size" argument must be of type number');
    else if (size < 0) throw new RangeError('The value "' + size + '" is invalid for option "size"');
}
function $ef9975513e2e43d1$var$alloc(size, fill, encoding) {
    $ef9975513e2e43d1$var$assertSize(size);
    if (size <= 0) return $ef9975513e2e43d1$var$createBuffer(size);
    if (fill !== undefined) // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpreted as a start offset.
    return typeof encoding === "string" ? $ef9975513e2e43d1$var$createBuffer(size).fill(fill, encoding) : $ef9975513e2e43d1$var$createBuffer(size).fill(fill);
    return $ef9975513e2e43d1$var$createBuffer(size);
}
/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/ $ef9975513e2e43d1$var$Buffer.alloc = function(size, fill, encoding) {
    return $ef9975513e2e43d1$var$alloc(size, fill, encoding);
};
function $ef9975513e2e43d1$var$allocUnsafe(size) {
    $ef9975513e2e43d1$var$assertSize(size);
    return $ef9975513e2e43d1$var$createBuffer(size < 0 ? 0 : $ef9975513e2e43d1$var$checked(size) | 0);
}
/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */ $ef9975513e2e43d1$var$Buffer.allocUnsafe = function(size) {
    return $ef9975513e2e43d1$var$allocUnsafe(size);
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */ $ef9975513e2e43d1$var$Buffer.allocUnsafeSlow = function(size) {
    return $ef9975513e2e43d1$var$allocUnsafe(size);
};
function $ef9975513e2e43d1$var$fromString(string, encoding) {
    if (typeof encoding !== "string" || encoding === "") encoding = "utf8";
    if (!$ef9975513e2e43d1$var$Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
    const length = $ef9975513e2e43d1$var$byteLength(string, encoding) | 0;
    let buf = $ef9975513e2e43d1$var$createBuffer(length);
    const actual = buf.write(string, encoding);
    if (actual !== length) // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual);
    return buf;
}
function $ef9975513e2e43d1$var$fromArrayLike(array) {
    const length = array.length < 0 ? 0 : $ef9975513e2e43d1$var$checked(array.length) | 0;
    const buf = $ef9975513e2e43d1$var$createBuffer(length);
    for(let i = 0; i < length; i += 1)buf[i] = array[i] & 255;
    return buf;
}
function $ef9975513e2e43d1$var$fromArrayView(arrayView) {
    if ($ef9975513e2e43d1$var$isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView);
        return $ef9975513e2e43d1$var$fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
    }
    return $ef9975513e2e43d1$var$fromArrayLike(arrayView);
}
function $ef9975513e2e43d1$var$fromArrayBuffer(array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError('"offset" is outside of buffer bounds');
    if (array.byteLength < byteOffset + (length || 0)) throw new RangeError('"length" is outside of buffer bounds');
    let buf;
    if (byteOffset === undefined && length === undefined) buf = new Uint8Array(array);
    else if (length === undefined) buf = new Uint8Array(array, byteOffset);
    else buf = new Uint8Array(array, byteOffset, length);
    // Return an augmented `Uint8Array` instance
    Object.setPrototypeOf(buf, $ef9975513e2e43d1$var$Buffer.prototype);
    return buf;
}
function $ef9975513e2e43d1$var$fromObject(obj) {
    if ($ef9975513e2e43d1$var$Buffer.isBuffer(obj)) {
        const len = $ef9975513e2e43d1$var$checked(obj.length) | 0;
        const buf = $ef9975513e2e43d1$var$createBuffer(len);
        if (buf.length === 0) return buf;
        obj.copy(buf, 0, 0, len);
        return buf;
    }
    if (obj.length !== undefined) {
        if (typeof obj.length !== "number" || $ef9975513e2e43d1$var$numberIsNaN(obj.length)) return $ef9975513e2e43d1$var$createBuffer(0);
        return $ef9975513e2e43d1$var$fromArrayLike(obj);
    }
    if (obj.type === "Buffer" && Array.isArray(obj.data)) return $ef9975513e2e43d1$var$fromArrayLike(obj.data);
}
function $ef9975513e2e43d1$var$checked(length) {
    // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
    // length is NaN (which is otherwise coerced to zero.)
    if (length >= $ef9975513e2e43d1$var$K_MAX_LENGTH) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + $ef9975513e2e43d1$var$K_MAX_LENGTH.toString(16) + " bytes");
    return length | 0;
}
function $ef9975513e2e43d1$var$SlowBuffer(length) {
    if (+length != length) length = 0;
    return $ef9975513e2e43d1$var$Buffer.alloc(+length);
}
$ef9975513e2e43d1$var$Buffer.isBuffer = function isBuffer(b) {
    return b != null && b._isBuffer === true && b !== $ef9975513e2e43d1$var$Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
    ;
};
$ef9975513e2e43d1$var$Buffer.compare = function compare(a, b) {
    if ($ef9975513e2e43d1$var$isInstance(a, Uint8Array)) a = $ef9975513e2e43d1$var$Buffer.from(a, a.offset, a.byteLength);
    if ($ef9975513e2e43d1$var$isInstance(b, Uint8Array)) b = $ef9975513e2e43d1$var$Buffer.from(b, b.offset, b.byteLength);
    if (!$ef9975513e2e43d1$var$Buffer.isBuffer(a) || !$ef9975513e2e43d1$var$Buffer.isBuffer(b)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    if (a === b) return 0;
    let x = a.length;
    let y = b.length;
    for(let i = 0, len = Math.min(x, y); i < len; ++i)if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break;
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
};
$ef9975513e2e43d1$var$Buffer.isEncoding = function isEncoding(encoding) {
    switch(String(encoding).toLowerCase()){
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return true;
        default:
            return false;
    }
};
$ef9975513e2e43d1$var$Buffer.concat = function concat(list, length) {
    if (!Array.isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
    if (list.length === 0) return $ef9975513e2e43d1$var$Buffer.alloc(0);
    let i;
    if (length === undefined) {
        length = 0;
        for(i = 0; i < list.length; ++i)length += list[i].length;
    }
    const buffer = $ef9975513e2e43d1$var$Buffer.allocUnsafe(length);
    let pos = 0;
    for(i = 0; i < list.length; ++i){
        let buf = list[i];
        if ($ef9975513e2e43d1$var$isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
                if (!$ef9975513e2e43d1$var$Buffer.isBuffer(buf)) buf = $ef9975513e2e43d1$var$Buffer.from(buf);
                buf.copy(buffer, pos);
            } else Uint8Array.prototype.set.call(buffer, buf, pos);
        } else if (!$ef9975513e2e43d1$var$Buffer.isBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
        else buf.copy(buffer, pos);
        pos += buf.length;
    }
    return buffer;
};
function $ef9975513e2e43d1$var$byteLength(string, encoding) {
    if ($ef9975513e2e43d1$var$Buffer.isBuffer(string)) return string.length;
    if (ArrayBuffer.isView(string) || $ef9975513e2e43d1$var$isInstance(string, ArrayBuffer)) return string.byteLength;
    if (typeof string !== "string") throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
    const len = string.length;
    const mustMatch = arguments.length > 2 && arguments[2] === true;
    if (!mustMatch && len === 0) return 0;
    // Use a for loop to avoid recursion
    let loweredCase = false;
    for(;;)switch(encoding){
        case "ascii":
        case "latin1":
        case "binary":
            return len;
        case "utf8":
        case "utf-8":
            return $ef9975513e2e43d1$var$utf8ToBytes(string).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return len * 2;
        case "hex":
            return len >>> 1;
        case "base64":
            return $ef9975513e2e43d1$var$base64ToBytes(string).length;
        default:
            if (loweredCase) return mustMatch ? -1 : $ef9975513e2e43d1$var$utf8ToBytes(string).length // assume utf8
            ;
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
    }
}
$ef9975513e2e43d1$var$Buffer.byteLength = $ef9975513e2e43d1$var$byteLength;
function $ef9975513e2e43d1$var$slowToString(encoding, start, end) {
    let loweredCase = false;
    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
    // property of a typed array.
    // This behaves neither like String nor Uint8Array in that we set start/end
    // to their upper/lower bounds if the value passed is out of range.
    // undefined is handled specially as per ECMA-262 6th Edition,
    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
    if (start === undefined || start < 0) start = 0;
    // Return early if start > this.length. Done here to prevent potential uint32
    // coercion fail below.
    if (start > this.length) return "";
    if (end === undefined || end > this.length) end = this.length;
    if (end <= 0) return "";
    // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0;
    start >>>= 0;
    if (end <= start) return "";
    if (!encoding) encoding = "utf8";
    while(true)switch(encoding){
        case "hex":
            return $ef9975513e2e43d1$var$hexSlice(this, start, end);
        case "utf8":
        case "utf-8":
            return $ef9975513e2e43d1$var$utf8Slice(this, start, end);
        case "ascii":
            return $ef9975513e2e43d1$var$asciiSlice(this, start, end);
        case "latin1":
        case "binary":
            return $ef9975513e2e43d1$var$latin1Slice(this, start, end);
        case "base64":
            return $ef9975513e2e43d1$var$base64Slice(this, start, end);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return $ef9975513e2e43d1$var$utf16leSlice(this, start, end);
        default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
    }
}
// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
$ef9975513e2e43d1$var$Buffer.prototype._isBuffer = true;
function $ef9975513e2e43d1$var$swap(b, n, m) {
    const i = b[n];
    b[n] = b[m];
    b[m] = i;
}
$ef9975513e2e43d1$var$Buffer.prototype.swap16 = function swap16() {
    const len = this.length;
    if (len % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
    for(let i = 0; i < len; i += 2)$ef9975513e2e43d1$var$swap(this, i, i + 1);
    return this;
};
$ef9975513e2e43d1$var$Buffer.prototype.swap32 = function swap32() {
    const len = this.length;
    if (len % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
    for(let i = 0; i < len; i += 4){
        $ef9975513e2e43d1$var$swap(this, i, i + 3);
        $ef9975513e2e43d1$var$swap(this, i + 1, i + 2);
    }
    return this;
};
$ef9975513e2e43d1$var$Buffer.prototype.swap64 = function swap64() {
    const len = this.length;
    if (len % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
    for(let i = 0; i < len; i += 8){
        $ef9975513e2e43d1$var$swap(this, i, i + 7);
        $ef9975513e2e43d1$var$swap(this, i + 1, i + 6);
        $ef9975513e2e43d1$var$swap(this, i + 2, i + 5);
        $ef9975513e2e43d1$var$swap(this, i + 3, i + 4);
    }
    return this;
};
$ef9975513e2e43d1$var$Buffer.prototype.toString = function toString() {
    const length = this.length;
    if (length === 0) return "";
    if (arguments.length === 0) return $ef9975513e2e43d1$var$utf8Slice(this, 0, length);
    return $ef9975513e2e43d1$var$slowToString.apply(this, arguments);
};
$ef9975513e2e43d1$var$Buffer.prototype.toLocaleString = $ef9975513e2e43d1$var$Buffer.prototype.toString;
$ef9975513e2e43d1$var$Buffer.prototype.equals = function equals(b) {
    if (!$ef9975513e2e43d1$var$Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
    if (this === b) return true;
    return $ef9975513e2e43d1$var$Buffer.compare(this, b) === 0;
};
$ef9975513e2e43d1$var$Buffer.prototype.inspect = function inspect() {
    let str = "";
    const max = $ef9975513e2e43d1$export$f99ded8fe4b79145;
    str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
    if (this.length > max) str += " ... ";
    return "<Buffer " + str + ">";
};
if ($ef9975513e2e43d1$var$customInspectSymbol) $ef9975513e2e43d1$var$Buffer.prototype[$ef9975513e2e43d1$var$customInspectSymbol] = $ef9975513e2e43d1$var$Buffer.prototype.inspect;
$ef9975513e2e43d1$var$Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if ($ef9975513e2e43d1$var$isInstance(target, Uint8Array)) target = $ef9975513e2e43d1$var$Buffer.from(target, target.offset, target.byteLength);
    if (!$ef9975513e2e43d1$var$Buffer.isBuffer(target)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
    if (start === undefined) start = 0;
    if (end === undefined) end = target ? target.length : 0;
    if (thisStart === undefined) thisStart = 0;
    if (thisEnd === undefined) thisEnd = this.length;
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError("out of range index");
    if (thisStart >= thisEnd && start >= end) return 0;
    if (thisStart >= thisEnd) return -1;
    if (start >= end) return 1;
    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target) return 0;
    let x = thisEnd - thisStart;
    let y = end - start;
    const len = Math.min(x, y);
    const thisCopy = this.slice(thisStart, thisEnd);
    const targetCopy = target.slice(start, end);
    for(let i = 0; i < len; ++i)if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break;
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
};
// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function $ef9975513e2e43d1$var$bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    // Empty buffer means no match
    if (buffer.length === 0) return -1;
    // Normalize byteOffset
    if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
    } else if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff;
    else if (byteOffset < -2147483648) byteOffset = -2147483648;
    byteOffset = +byteOffset // Coerce to Number.
    ;
    if ($ef9975513e2e43d1$var$numberIsNaN(byteOffset)) // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : buffer.length - 1;
    // Normalize byteOffset: negative offsets start from the end of the buffer
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
    }
    // Normalize val
    if (typeof val === "string") val = $ef9975513e2e43d1$var$Buffer.from(val, encoding);
    // Finally, search either indexOf (if dir is true) or lastIndexOf
    if ($ef9975513e2e43d1$var$Buffer.isBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) return -1;
        return $ef9975513e2e43d1$var$arrayIndexOf(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
        val = val & 0xFF // Search for a byte value [0-255]
        ;
        if (typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            else return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
        }
        return $ef9975513e2e43d1$var$arrayIndexOf(buffer, [
            val
        ], byteOffset, encoding, dir);
    }
    throw new TypeError("val must be string, number or Buffer");
}
function $ef9975513e2e43d1$var$arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    let indexSize = 1;
    let arrLength = arr.length;
    let valLength = val.length;
    if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) return -1;
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
        }
    }
    function read(buf, i) {
        if (indexSize === 1) return buf[i];
        else return buf.readUInt16BE(i * indexSize);
    }
    let i;
    if (dir) {
        let foundIndex = -1;
        for(i = byteOffset; i < arrLength; i++)if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
        } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
        }
    } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for(i = byteOffset; i >= 0; i--){
            let found = true;
            for(let j = 0; j < valLength; j++)if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
            }
            if (found) return i;
        }
    }
    return -1;
}
$ef9975513e2e43d1$var$Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
};
$ef9975513e2e43d1$var$Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return $ef9975513e2e43d1$var$bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};
$ef9975513e2e43d1$var$Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return $ef9975513e2e43d1$var$bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};
function $ef9975513e2e43d1$var$hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    const remaining = buf.length - offset;
    if (!length) length = remaining;
    else {
        length = Number(length);
        if (length > remaining) length = remaining;
    }
    const strLen = string.length;
    if (length > strLen / 2) length = strLen / 2;
    let i;
    for(i = 0; i < length; ++i){
        const parsed = parseInt(string.substr(i * 2, 2), 16);
        if ($ef9975513e2e43d1$var$numberIsNaN(parsed)) return i;
        buf[offset + i] = parsed;
    }
    return i;
}
function $ef9975513e2e43d1$var$utf8Write(buf, string, offset, length) {
    return $ef9975513e2e43d1$var$blitBuffer($ef9975513e2e43d1$var$utf8ToBytes(string, buf.length - offset), buf, offset, length);
}
function $ef9975513e2e43d1$var$asciiWrite(buf, string, offset, length) {
    return $ef9975513e2e43d1$var$blitBuffer($ef9975513e2e43d1$var$asciiToBytes(string), buf, offset, length);
}
function $ef9975513e2e43d1$var$base64Write(buf, string, offset, length) {
    return $ef9975513e2e43d1$var$blitBuffer($ef9975513e2e43d1$var$base64ToBytes(string), buf, offset, length);
}
function $ef9975513e2e43d1$var$ucs2Write(buf, string, offset, length) {
    return $ef9975513e2e43d1$var$blitBuffer($ef9975513e2e43d1$var$utf16leToBytes(string, buf.length - offset), buf, offset, length);
}
$ef9975513e2e43d1$var$Buffer.prototype.write = function write(string, offset, length, encoding) {
    // Buffer#write(string)
    if (offset === undefined) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
    // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
    // Buffer#write(string, offset[, length][, encoding])
    } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === undefined) encoding = "utf8";
        } else {
            encoding = length;
            length = undefined;
        }
    } else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    const remaining = this.length - offset;
    if (length === undefined || length > remaining) length = remaining;
    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
    if (!encoding) encoding = "utf8";
    let loweredCase = false;
    for(;;)switch(encoding){
        case "hex":
            return $ef9975513e2e43d1$var$hexWrite(this, string, offset, length);
        case "utf8":
        case "utf-8":
            return $ef9975513e2e43d1$var$utf8Write(this, string, offset, length);
        case "ascii":
        case "latin1":
        case "binary":
            return $ef9975513e2e43d1$var$asciiWrite(this, string, offset, length);
        case "base64":
            // Warning: maxLength not taken into account in base64Write
            return $ef9975513e2e43d1$var$base64Write(this, string, offset, length);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return $ef9975513e2e43d1$var$ucs2Write(this, string, offset, length);
        default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
    }
};
$ef9975513e2e43d1$var$Buffer.prototype.toJSON = function toJSON() {
    return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
    };
};
function $ef9975513e2e43d1$var$base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) return $b5831eb1d6c96426$export$6100ba28696e12de(buf);
    else return $b5831eb1d6c96426$export$6100ba28696e12de(buf.slice(start, end));
}
function $ef9975513e2e43d1$var$utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    const res = [];
    let i = start;
    while(i < end){
        const firstByte = buf[i];
        let codePoint = null;
        let bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;
        if (i + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch(bytesPerSequence){
                case 1:
                    if (firstByte < 0x80) codePoint = firstByte;
                    break;
                case 2:
                    secondByte = buf[i + 1];
                    if ((secondByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
                        if (tempCodePoint > 0x7F) codePoint = tempCodePoint;
                    }
                    break;
                case 3:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) codePoint = tempCodePoint;
                    }
                    break;
                case 4:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    fourthByte = buf[i + 3];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) codePoint = tempCodePoint;
                    }
            }
        }
        if (codePoint === null) {
            // we did not generate a valid codePoint so insert a
            // replacement char (U+FFFD) and advance only 1 byte
            codePoint = 0xFFFD;
            bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
            // encode to utf16 (surrogate pair dance)
            codePoint -= 0x10000;
            res.push(codePoint >>> 10 & 0x3FF | 0xD800);
            codePoint = 0xDC00 | codePoint & 0x3FF;
        }
        res.push(codePoint);
        i += bytesPerSequence;
    }
    return $ef9975513e2e43d1$var$decodeCodePointsArray(res);
}
// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
const $ef9975513e2e43d1$var$MAX_ARGUMENTS_LENGTH = 0x1000;
function $ef9975513e2e43d1$var$decodeCodePointsArray(codePoints) {
    const len = codePoints.length;
    if (len <= $ef9975513e2e43d1$var$MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    ;
    // Decode in chunks to avoid "call stack size exceeded".
    let res = "";
    let i = 0;
    while(i < len)res += String.fromCharCode.apply(String, codePoints.slice(i, i += $ef9975513e2e43d1$var$MAX_ARGUMENTS_LENGTH));
    return res;
}
function $ef9975513e2e43d1$var$asciiSlice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for(let i = start; i < end; ++i)ret += String.fromCharCode(buf[i] & 0x7F);
    return ret;
}
function $ef9975513e2e43d1$var$latin1Slice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for(let i = start; i < end; ++i)ret += String.fromCharCode(buf[i]);
    return ret;
}
function $ef9975513e2e43d1$var$hexSlice(buf, start, end) {
    const len = buf.length;
    if (!start || start < 0) start = 0;
    if (!end || end < 0 || end > len) end = len;
    let out = "";
    for(let i = start; i < end; ++i)out += $ef9975513e2e43d1$var$hexSliceLookupTable[buf[i]];
    return out;
}
function $ef9975513e2e43d1$var$utf16leSlice(buf, start, end) {
    const bytes = buf.slice(start, end);
    let res = "";
    // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
    for(let i = 0; i < bytes.length - 1; i += 2)res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    return res;
}
$ef9975513e2e43d1$var$Buffer.prototype.slice = function slice(start, end) {
    const len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;
    if (start < 0) {
        start += len;
        if (start < 0) start = 0;
    } else if (start > len) start = len;
    if (end < 0) {
        end += len;
        if (end < 0) end = 0;
    } else if (end > len) end = len;
    if (end < start) end = start;
    const newBuf = this.subarray(start, end);
    // Return an augmented `Uint8Array` instance
    Object.setPrototypeOf(newBuf, $ef9975513e2e43d1$var$Buffer.prototype);
    return newBuf;
};
/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */ function $ef9975513e2e43d1$var$checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
    if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
}
$ef9975513e2e43d1$var$Buffer.prototype.readUintLE = $ef9975513e2e43d1$var$Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, byteLength, this.length);
    let val = this[offset];
    let mul = 1;
    let i = 0;
    while(++i < byteLength && (mul *= 0x100))val += this[offset + i] * mul;
    return val;
};
$ef9975513e2e43d1$var$Buffer.prototype.readUintBE = $ef9975513e2e43d1$var$Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, byteLength, this.length);
    let val = this[offset + --byteLength];
    let mul = 1;
    while(byteLength > 0 && (mul *= 0x100))val += this[offset + --byteLength] * mul;
    return val;
};
$ef9975513e2e43d1$var$Buffer.prototype.readUint8 = $ef9975513e2e43d1$var$Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 1, this.length);
    return this[offset];
};
$ef9975513e2e43d1$var$Buffer.prototype.readUint16LE = $ef9975513e2e43d1$var$Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 2, this.length);
    return this[offset] | this[offset + 1] << 8;
};
$ef9975513e2e43d1$var$Buffer.prototype.readUint16BE = $ef9975513e2e43d1$var$Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 2, this.length);
    return this[offset] << 8 | this[offset + 1];
};
$ef9975513e2e43d1$var$Buffer.prototype.readUint32LE = $ef9975513e2e43d1$var$Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 4, this.length);
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
};
$ef9975513e2e43d1$var$Buffer.prototype.readUint32BE = $ef9975513e2e43d1$var$Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 4, this.length);
    return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};
$ef9975513e2e43d1$var$Buffer.prototype.readBigUInt64LE = $ef9975513e2e43d1$var$defineBigIntMethod(function readBigUInt64LE(offset) {
    offset = offset >>> 0;
    $ef9975513e2e43d1$var$validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === undefined || last === undefined) $ef9975513e2e43d1$var$boundsError(offset, this.length - 8);
    const lo = first + this[++offset] * 256 + this[++offset] * 65536 + this[++offset] * 2 ** 24;
    const hi = this[++offset] + this[++offset] * 256 + this[++offset] * 65536 + last * 2 ** 24;
    return BigInt(lo) + (BigInt(hi) << BigInt(32));
});
$ef9975513e2e43d1$var$Buffer.prototype.readBigUInt64BE = $ef9975513e2e43d1$var$defineBigIntMethod(function readBigUInt64BE(offset) {
    offset = offset >>> 0;
    $ef9975513e2e43d1$var$validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === undefined || last === undefined) $ef9975513e2e43d1$var$boundsError(offset, this.length - 8);
    const hi = first * 2 ** 24 + this[++offset] * 65536 + this[++offset] * 256 + this[++offset];
    const lo = this[++offset] * 2 ** 24 + this[++offset] * 65536 + this[++offset] * 256 + last;
    return (BigInt(hi) << BigInt(32)) + BigInt(lo);
});
$ef9975513e2e43d1$var$Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, byteLength, this.length);
    let val = this[offset];
    let mul = 1;
    let i = 0;
    while(++i < byteLength && (mul *= 0x100))val += this[offset + i] * mul;
    mul *= 0x80;
    if (val >= mul) val -= Math.pow(2, 8 * byteLength);
    return val;
};
$ef9975513e2e43d1$var$Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, byteLength, this.length);
    let i = byteLength;
    let mul = 1;
    let val = this[offset + --i];
    while(i > 0 && (mul *= 0x100))val += this[offset + --i] * mul;
    mul *= 0x80;
    if (val >= mul) val -= Math.pow(2, 8 * byteLength);
    return val;
};
$ef9975513e2e43d1$var$Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80)) return this[offset];
    return (0xff - this[offset] + 1) * -1;
};
$ef9975513e2e43d1$var$Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 2, this.length);
    const val = this[offset] | this[offset + 1] << 8;
    return val & 0x8000 ? val | 0xFFFF0000 : val;
};
$ef9975513e2e43d1$var$Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 2, this.length);
    const val = this[offset + 1] | this[offset] << 8;
    return val & 0x8000 ? val | 0xFFFF0000 : val;
};
$ef9975513e2e43d1$var$Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 4, this.length);
    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};
$ef9975513e2e43d1$var$Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 4, this.length);
    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};
$ef9975513e2e43d1$var$Buffer.prototype.readBigInt64LE = $ef9975513e2e43d1$var$defineBigIntMethod(function readBigInt64LE(offset) {
    offset = offset >>> 0;
    $ef9975513e2e43d1$var$validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === undefined || last === undefined) $ef9975513e2e43d1$var$boundsError(offset, this.length - 8);
    const val = this[offset + 4] + this[offset + 5] * 256 + this[offset + 6] * 65536 + (last << 24 // Overflow
    );
    return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 256 + this[++offset] * 65536 + this[++offset] * 2 ** 24);
});
$ef9975513e2e43d1$var$Buffer.prototype.readBigInt64BE = $ef9975513e2e43d1$var$defineBigIntMethod(function readBigInt64BE(offset) {
    offset = offset >>> 0;
    $ef9975513e2e43d1$var$validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === undefined || last === undefined) $ef9975513e2e43d1$var$boundsError(offset, this.length - 8);
    const val = (first << 24) + this[++offset] * 65536 + this[++offset] * 256 + this[++offset];
    return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 65536 + this[++offset] * 256 + last);
});
$ef9975513e2e43d1$var$Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 4, this.length);
    return $a11c6733277d3ca0$export$aafa59e2e03f2942(this, offset, true, 23, 4);
};
$ef9975513e2e43d1$var$Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 4, this.length);
    return $a11c6733277d3ca0$export$aafa59e2e03f2942(this, offset, false, 23, 4);
};
$ef9975513e2e43d1$var$Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 8, this.length);
    return $a11c6733277d3ca0$export$aafa59e2e03f2942(this, offset, true, 52, 8);
};
$ef9975513e2e43d1$var$Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkOffset(offset, 8, this.length);
    return $a11c6733277d3ca0$export$aafa59e2e03f2942(this, offset, false, 52, 8);
};
function $ef9975513e2e43d1$var$checkInt(buf, value, offset, ext, max, min) {
    if (!$ef9975513e2e43d1$var$Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length) throw new RangeError("Index out of range");
}
$ef9975513e2e43d1$var$Buffer.prototype.writeUintLE = $ef9975513e2e43d1$var$Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength) - 1;
        $ef9975513e2e43d1$var$checkInt(this, value, offset, byteLength, maxBytes, 0);
    }
    let mul = 1;
    let i = 0;
    this[offset] = value & 0xFF;
    while(++i < byteLength && (mul *= 0x100))this[offset + i] = value / mul & 0xFF;
    return offset + byteLength;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeUintBE = $ef9975513e2e43d1$var$Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength) - 1;
        $ef9975513e2e43d1$var$checkInt(this, value, offset, byteLength, maxBytes, 0);
    }
    let i = byteLength - 1;
    let mul = 1;
    this[offset + i] = value & 0xFF;
    while(--i >= 0 && (mul *= 0x100))this[offset + i] = value / mul & 0xFF;
    return offset + byteLength;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeUint8 = $ef9975513e2e43d1$var$Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkInt(this, value, offset, 1, 0xff, 0);
    this[offset] = value & 0xff;
    return offset + 1;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeUint16LE = $ef9975513e2e43d1$var$Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkInt(this, value, offset, 2, 0xffff, 0);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    return offset + 2;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeUint16BE = $ef9975513e2e43d1$var$Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkInt(this, value, offset, 2, 0xffff, 0);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
    return offset + 2;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeUint32LE = $ef9975513e2e43d1$var$Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkInt(this, value, offset, 4, 0xffffffff, 0);
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 0xff;
    return offset + 4;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeUint32BE = $ef9975513e2e43d1$var$Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkInt(this, value, offset, 4, 0xffffffff, 0);
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
    return offset + 4;
};
function $ef9975513e2e43d1$var$wrtBigUInt64LE(buf, value, offset, min, max) {
    $ef9975513e2e43d1$var$checkIntBI(value, min, max, buf, offset, 7);
    let lo = Number(value & BigInt(0xffffffff));
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    return offset;
}
function $ef9975513e2e43d1$var$wrtBigUInt64BE(buf, value, offset, min, max) {
    $ef9975513e2e43d1$var$checkIntBI(value, min, max, buf, offset, 7);
    let lo = Number(value & BigInt(0xffffffff));
    buf[offset + 7] = lo;
    lo = lo >> 8;
    buf[offset + 6] = lo;
    lo = lo >> 8;
    buf[offset + 5] = lo;
    lo = lo >> 8;
    buf[offset + 4] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
    buf[offset + 3] = hi;
    hi = hi >> 8;
    buf[offset + 2] = hi;
    hi = hi >> 8;
    buf[offset + 1] = hi;
    hi = hi >> 8;
    buf[offset] = hi;
    return offset + 8;
}
$ef9975513e2e43d1$var$Buffer.prototype.writeBigUInt64LE = $ef9975513e2e43d1$var$defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
    return $ef9975513e2e43d1$var$wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
});
$ef9975513e2e43d1$var$Buffer.prototype.writeBigUInt64BE = $ef9975513e2e43d1$var$defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
    return $ef9975513e2e43d1$var$wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
});
$ef9975513e2e43d1$var$Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength - 1);
        $ef9975513e2e43d1$var$checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    let i = 0;
    let mul = 1;
    let sub = 0;
    this[offset] = value & 0xFF;
    while(++i < byteLength && (mul *= 0x100)){
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) sub = 1;
        this[offset + i] = (value / mul >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength - 1);
        $ef9975513e2e43d1$var$checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    let i = byteLength - 1;
    let mul = 1;
    let sub = 0;
    this[offset + i] = value & 0xFF;
    while(--i >= 0 && (mul *= 0x100)){
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) sub = 1;
        this[offset + i] = (value / mul >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkInt(this, value, offset, 1, 0x7f, -128);
    if (value < 0) value = 0xff + value + 1;
    this[offset] = value & 0xff;
    return offset + 1;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkInt(this, value, offset, 2, 0x7fff, -32768);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    return offset + 2;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkInt(this, value, offset, 2, 0x7fff, -32768);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
    return offset + 2;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
    return offset + 4;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
    if (value < 0) value = 0xffffffff + value + 1;
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
    return offset + 4;
};
$ef9975513e2e43d1$var$Buffer.prototype.writeBigInt64LE = $ef9975513e2e43d1$var$defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
    return $ef9975513e2e43d1$var$wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
});
$ef9975513e2e43d1$var$Buffer.prototype.writeBigInt64BE = $ef9975513e2e43d1$var$defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
    return $ef9975513e2e43d1$var$wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
});
function $ef9975513e2e43d1$var$checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError("Index out of range");
    if (offset < 0) throw new RangeError("Index out of range");
}
function $ef9975513e2e43d1$var$writeFloat(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -340282346638528860000000000000000000000);
    $a11c6733277d3ca0$export$68d8715fc104d294(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
}
$ef9975513e2e43d1$var$Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return $ef9975513e2e43d1$var$writeFloat(this, value, offset, true, noAssert);
};
$ef9975513e2e43d1$var$Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return $ef9975513e2e43d1$var$writeFloat(this, value, offset, false, noAssert);
};
function $ef9975513e2e43d1$var$writeDouble(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $ef9975513e2e43d1$var$checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000);
    $a11c6733277d3ca0$export$68d8715fc104d294(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
}
$ef9975513e2e43d1$var$Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return $ef9975513e2e43d1$var$writeDouble(this, value, offset, true, noAssert);
};
$ef9975513e2e43d1$var$Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return $ef9975513e2e43d1$var$writeDouble(this, value, offset, false, noAssert);
};
// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
$ef9975513e2e43d1$var$Buffer.prototype.copy = function copy(target, targetStart, start, end) {
    if (!$ef9975513e2e43d1$var$Buffer.isBuffer(target)) throw new TypeError("argument should be a Buffer");
    if (!start) start = 0;
    if (!end && end !== 0) end = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;
    // Copy 0 bytes; we're done
    if (end === start) return 0;
    if (target.length === 0 || this.length === 0) return 0;
    // Fatal error conditions
    if (targetStart < 0) throw new RangeError("targetStart out of bounds");
    if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
    if (end < 0) throw new RangeError("sourceEnd out of bounds");
    // Are we oob?
    if (end > this.length) end = this.length;
    if (target.length - targetStart < end - start) end = target.length - targetStart + start;
    const len = end - start;
    if (this === target && typeof Uint8Array.prototype.copyWithin === "function") // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end);
    else Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
    return len;
};
// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
$ef9975513e2e43d1$var$Buffer.prototype.fill = function fill(val, start, end, encoding) {
    // Handle string cases:
    if (typeof val === "string") {
        if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
        } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
        }
        if (encoding !== undefined && typeof encoding !== "string") throw new TypeError("encoding must be a string");
        if (typeof encoding === "string" && !$ef9975513e2e43d1$var$Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
        if (val.length === 1) {
            const code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") // Fast path: If `val` fits into a single byte, use that numeric value.
            val = code;
        }
    } else if (typeof val === "number") val = val & 255;
    else if (typeof val === "boolean") val = Number(val);
    // Invalid ranges are not set to a default, so can range check early.
    if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
    if (end <= start) return this;
    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;
    if (!val) val = 0;
    let i;
    if (typeof val === "number") for(i = start; i < end; ++i)this[i] = val;
    else {
        const bytes = $ef9975513e2e43d1$var$Buffer.isBuffer(val) ? val : $ef9975513e2e43d1$var$Buffer.from(val, encoding);
        const len = bytes.length;
        if (len === 0) throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        for(i = 0; i < end - start; ++i)this[i + start] = bytes[i % len];
    }
    return this;
};
// CUSTOM ERRORS
// =============
// Simplified versions from Node, changed for Buffer-only usage
const $ef9975513e2e43d1$var$errors = {};
function $ef9975513e2e43d1$var$E(sym, getMessage, Base) {
    $ef9975513e2e43d1$var$errors[sym] = class NodeError extends Base {
        constructor(){
            super();
            Object.defineProperty(this, "message", {
                value: getMessage.apply(this, arguments),
                writable: true,
                configurable: true
            });
            // Add the error code to the name to include it in the stack trace.
            this.name = `${this.name} [${sym}]`;
            // Access the stack to generate the error message including the error code
            // from the name.
            this.stack // eslint-disable-line no-unused-expressions
            ;
            // Reset the name to the actual name.
            delete this.name;
        }
        get code() {
            return sym;
        }
        set code(value) {
            Object.defineProperty(this, "code", {
                configurable: true,
                enumerable: true,
                value: value,
                writable: true
            });
        }
        toString() {
            return `${this.name} [${sym}]: ${this.message}`;
        }
    };
}
$ef9975513e2e43d1$var$E("ERR_BUFFER_OUT_OF_BOUNDS", function(name) {
    if (name) return `${name} is outside of buffer bounds`;
    return "Attempt to access memory outside buffer bounds";
}, RangeError);
$ef9975513e2e43d1$var$E("ERR_INVALID_ARG_TYPE", function(name, actual) {
    return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
}, TypeError);
$ef9975513e2e43d1$var$E("ERR_OUT_OF_RANGE", function(str, range, input) {
    let msg = `The value of "${str}" is out of range.`;
    let received = input;
    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) received = $ef9975513e2e43d1$var$addNumericalSeparator(String(input));
    else if (typeof input === "bigint") {
        received = String(input);
        if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) received = $ef9975513e2e43d1$var$addNumericalSeparator(received);
        received += "n";
    }
    msg += ` It must be ${range}. Received ${received}`;
    return msg;
}, RangeError);
function $ef9975513e2e43d1$var$addNumericalSeparator(val) {
    let res = "";
    let i = val.length;
    const start = val[0] === "-" ? 1 : 0;
    for(; i >= start + 4; i -= 3)res = `_${val.slice(i - 3, i)}${res}`;
    return `${val.slice(0, i)}${res}`;
}
// CHECK FUNCTIONS
// ===============
function $ef9975513e2e43d1$var$checkBounds(buf, offset, byteLength) {
    $ef9975513e2e43d1$var$validateNumber(offset, "offset");
    if (buf[offset] === undefined || buf[offset + byteLength] === undefined) $ef9975513e2e43d1$var$boundsError(offset, buf.length - (byteLength + 1));
}
function $ef9975513e2e43d1$var$checkIntBI(value, min, max, buf, offset, byteLength) {
    if (value > max || value < min) {
        const n = typeof min === "bigint" ? "n" : "";
        let range;
        if (byteLength > 3) {
            if (min === 0 || min === BigInt(0)) range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`;
            else range = `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` + `${(byteLength + 1) * 8 - 1}${n}`;
        } else range = `>= ${min}${n} and <= ${max}${n}`;
        throw new $ef9975513e2e43d1$var$errors.ERR_OUT_OF_RANGE("value", range, value);
    }
    $ef9975513e2e43d1$var$checkBounds(buf, offset, byteLength);
}
function $ef9975513e2e43d1$var$validateNumber(value, name) {
    if (typeof value !== "number") throw new $ef9975513e2e43d1$var$errors.ERR_INVALID_ARG_TYPE(name, "number", value);
}
function $ef9975513e2e43d1$var$boundsError(value, length, type) {
    if (Math.floor(value) !== value) {
        $ef9975513e2e43d1$var$validateNumber(value, type);
        throw new $ef9975513e2e43d1$var$errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
    }
    if (length < 0) throw new $ef9975513e2e43d1$var$errors.ERR_BUFFER_OUT_OF_BOUNDS();
    throw new $ef9975513e2e43d1$var$errors.ERR_OUT_OF_RANGE(type || "offset", `>= ${type ? 1 : 0} and <= ${length}`, value);
}
// HELPER FUNCTIONS
// ================
const $ef9975513e2e43d1$var$INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
function $ef9975513e2e43d1$var$base64clean(str) {
    // Node takes equal signs as end of the Base64 encoding
    str = str.split("=")[0];
    // Node strips out invalid characters like \n and \t from the string, base64-js does not
    str = str.trim().replace($ef9975513e2e43d1$var$INVALID_BASE64_RE, "");
    // Node converts strings with length < 2 to ''
    if (str.length < 2) return "";
    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
    while(str.length % 4 !== 0)str = str + "=";
    return str;
}
function $ef9975513e2e43d1$var$utf8ToBytes(string, units) {
    units = units || Infinity;
    let codePoint;
    const length = string.length;
    let leadSurrogate = null;
    const bytes = [];
    for(let i = 0; i < length; ++i){
        codePoint = string.charCodeAt(i);
        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
            // last char was a lead
            if (!leadSurrogate) {
                // no lead yet
                if (codePoint > 0xDBFF) {
                    // unexpected trail
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                } else if (i + 1 === length) {
                    // unpaired lead
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                }
                // valid lead
                leadSurrogate = codePoint;
                continue;
            }
            // 2 leads in a row
            if (codePoint < 0xDC00) {
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                leadSurrogate = codePoint;
                continue;
            }
            // valid surrogate pair
            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) // valid bmp char, but last char was a lead
        {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }
        leadSurrogate = null;
        // encode utf8
        if (codePoint < 0x80) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
        } else if (codePoint < 0x800) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
        } else if (codePoint < 0x10000) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
        } else if (codePoint < 0x110000) {
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
        } else throw new Error("Invalid code point");
    }
    return bytes;
}
function $ef9975513e2e43d1$var$asciiToBytes(str) {
    const byteArray = [];
    for(let i = 0; i < str.length; ++i)// Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
    return byteArray;
}
function $ef9975513e2e43d1$var$utf16leToBytes(str, units) {
    let c, hi, lo;
    const byteArray = [];
    for(let i = 0; i < str.length; ++i){
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
    }
    return byteArray;
}
function $ef9975513e2e43d1$var$base64ToBytes(str) {
    return $b5831eb1d6c96426$export$d622b2ad8d90c771($ef9975513e2e43d1$var$base64clean(str));
}
function $ef9975513e2e43d1$var$blitBuffer(src, dst, offset, length) {
    let i;
    for(i = 0; i < length; ++i){
        if (i + offset >= dst.length || i >= src.length) break;
        dst[i + offset] = src[i];
    }
    return i;
}
// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function $ef9975513e2e43d1$var$isInstance(obj, type) {
    return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
}
function $ef9975513e2e43d1$var$numberIsNaN(obj) {
    // For IE11 support
    return obj !== obj // eslint-disable-line no-self-compare
    ;
}
// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
const $ef9975513e2e43d1$var$hexSliceLookupTable = function() {
    const alphabet = "0123456789abcdef";
    const table = new Array(256);
    for(let i = 0; i < 16; ++i){
        const i16 = i * 16;
        for(let j = 0; j < 16; ++j)table[i16 + j] = alphabet[i] + alphabet[j];
    }
    return table;
}();
// Return not function with Error if BigInt not supported
function $ef9975513e2e43d1$var$defineBigIntMethod(fn) {
    return typeof BigInt === "undefined" ? $ef9975513e2e43d1$var$BufferBigIntNotDefined : fn;
}
function $ef9975513e2e43d1$var$BufferBigIntNotDefined() {
    throw new Error("BigInt not supported");
}


var $23f4fcbe8c43f2d7$require$Buffer = $ef9975513e2e43d1$export$a143d493d941bafc;
// detect ReactNative environment
const $23f4fcbe8c43f2d7$var$isReactNative = typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
class $23f4fcbe8c43f2d7$export$911baa0677ac404c extends (0, $be63a89c53bdd5ba$export$86495b081fef8e52) {
    /**
     * WebSocket transport constructor.
     *
     * @param {Object} opts - connection options
     * @protected
     */ constructor(opts){
        super(opts);
        this.supportsBinary = !opts.forceBase64;
    }
    get name() {
        return "websocket";
    }
    doOpen() {
        if (!this.check()) // let probe timeout
        return;
        const uri = this.uri();
        const protocols = this.opts.protocols;
        // React Native only supports the 'headers' option, and will print a warning if anything else is passed
        const opts = $23f4fcbe8c43f2d7$var$isReactNative ? {} : (0, $8ba281d8602934c4$export$357523c63a2253b9)(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
        if (this.opts.extraHeaders) opts.headers = this.opts.extraHeaders;
        try {
            this.ws = (0, $0d0867257e52d371$export$3407ba5dfb7a683d) && !$23f4fcbe8c43f2d7$var$isReactNative ? protocols ? new (0, $0d0867257e52d371$export$3909fb301d3dc8c9)(uri, protocols) : new (0, $0d0867257e52d371$export$3909fb301d3dc8c9)(uri) : new (0, $0d0867257e52d371$export$3909fb301d3dc8c9)(uri, protocols, opts);
        } catch (err) {
            return this.emitReserved("error", err);
        }
        this.ws.binaryType = this.socket.binaryType || (0, $0d0867257e52d371$export$790dcbc41e2d75d5);
        this.addEventListeners();
    }
    /**
     * Adds event listeners to the socket
     *
     * @private
     */ addEventListeners() {
        this.ws.onopen = ()=>{
            if (this.opts.autoUnref) this.ws._socket.unref();
            this.onOpen();
        };
        this.ws.onclose = (closeEvent)=>this.onClose({
                description: "websocket connection closed",
                context: closeEvent
            });
        this.ws.onmessage = (ev)=>this.onData(ev.data);
        this.ws.onerror = (e)=>this.onError("websocket error", e);
    }
    write(packets) {
        this.writable = false;
        // encodePacket efficient as it uses WS framing
        // no need for encodePayload
        for(let i = 0; i < packets.length; i++){
            const packet = packets[i];
            const lastPacket = i === packets.length - 1;
            (0, $8030ebc9004ffa85$export$2e2bcd8739ae039)(packet, this.supportsBinary, (data)=>{
                // always create a new object (GH-437)
                const opts = {};
                if (!(0, $0d0867257e52d371$export$3407ba5dfb7a683d)) {
                    if (packet.options) opts.compress = packet.options.compress;
                    if (this.opts.perMessageDeflate) {
                        const len = // @ts-ignore
                        "string" === typeof data ? $23f4fcbe8c43f2d7$require$Buffer.byteLength(data) : data.length;
                        if (len < this.opts.perMessageDeflate.threshold) opts.compress = false;
                    }
                }
                // Sometimes the websocket has already been closed but the browser didn't
                // have a chance of informing us about it yet, in that case send will
                // throw an error
                try {
                    if (0, $0d0867257e52d371$export$3407ba5dfb7a683d) // TypeError is thrown when passing the second argument on Safari
                    this.ws.send(data);
                    else this.ws.send(data, opts);
                } catch (e) {}
                if (lastPacket) // fake drain
                // defer to next tick to allow Socket to clear writeBuffer
                (0, $0d0867257e52d371$export$bdd553fddd433dcb)(()=>{
                    this.writable = true;
                    this.emitReserved("drain");
                }, this.setTimeoutFn);
            });
        }
    }
    doClose() {
        if (typeof this.ws !== "undefined") {
            this.ws.close();
            this.ws = null;
        }
    }
    /**
     * Generates uri for connection.
     *
     * @private
     */ uri() {
        let query = this.query || {};
        const schema = this.opts.secure ? "wss" : "ws";
        let port = "";
        // avoid port if default for schema
        if (this.opts.port && ("wss" === schema && Number(this.opts.port) !== 443 || "ws" === schema && Number(this.opts.port) !== 80)) port = ":" + this.opts.port;
        // append timestamp to URI
        if (this.opts.timestampRequests) query[this.opts.timestampParam] = (0, $b02a24b88decc9b7$export$5bb64b92cb4135a)();
        // communicate binary support capabilities
        if (!this.supportsBinary) query.b64 = 1;
        const encodedQuery = (0, $62ebe56818ac3efc$export$c564cdbbe6da493)(query);
        const ipv6 = this.opts.hostname.indexOf(":") !== -1;
        return schema + "://" + (ipv6 ? "[" + this.opts.hostname + "]" : this.opts.hostname) + port + this.opts.path + (encodedQuery.length ? "?" + encodedQuery : "");
    }
    /**
     * Feature detection for WebSocket.
     *
     * @return {Boolean} whether this transport is available.
     * @private
     */ check() {
        return !!(0, $0d0867257e52d371$export$3909fb301d3dc8c9);
    }
}


const $c1612040b076676b$export$46dec00755c1153b = {
    websocket: (0, $23f4fcbe8c43f2d7$export$911baa0677ac404c),
    polling: (0, $daae5bc44f7e64a0$export$265ee5eefd4c309b)
};




// imported from https://github.com/galkn/parseuri
/**
 * Parses a URI
 *
 * Note: we could also have used the built-in URL object, but it isn't supported on all platforms.
 *
 * See:
 * - https://developer.mozilla.org/en-US/docs/Web/API/URL
 * - https://caniuse.com/url
 * - https://www.rfc-editor.org/rfc/rfc3986#appendix-B
 *
 * History of the parse() method:
 * - first commit: https://github.com/socketio/socket.io-client/commit/4ee1d5d94b3906a9c052b459f1a818b15f38f91c
 * - export into its own module: https://github.com/socketio/engine.io-client/commit/de2c561e4564efeb78f1bdb1ba39ef81b2822cb3
 * - reimport: https://github.com/socketio/engine.io-client/commit/df32277c3f6d622eec5ed09f493cae3f3391d242
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */ const $a15566998db3e298$var$re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
const $a15566998db3e298$var$parts = [
    "source",
    "protocol",
    "authority",
    "userInfo",
    "user",
    "password",
    "host",
    "port",
    "relative",
    "path",
    "directory",
    "file",
    "query",
    "anchor"
];
function $a15566998db3e298$export$98e6a39c04603d36(str) {
    const src = str, b = str.indexOf("["), e = str.indexOf("]");
    if (b != -1 && e != -1) str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ";") + str.substring(e, str.length);
    let m = $a15566998db3e298$var$re.exec(str || ""), uri = {}, i = 14;
    while(i--)uri[$a15566998db3e298$var$parts[i]] = m[i] || "";
    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
        uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
        uri.ipv6uri = true;
    }
    uri.pathNames = $a15566998db3e298$var$pathNames(uri, uri["path"]);
    uri.queryKey = $a15566998db3e298$var$queryKey(uri, uri["query"]);
    return uri;
}
function $a15566998db3e298$var$pathNames(obj, path) {
    const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
    if (path.slice(0, 1) == "/" || path.length === 0) names.splice(0, 1);
    if (path.slice(-1) == "/") names.splice(names.length - 1, 1);
    return names;
}
function $a15566998db3e298$var$queryKey(uri, query) {
    const data = {};
    query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
        if ($1) data[$1] = $2;
    });
    return data;
}




class $abe47ab8241b7aa5$export$4798917dbf149b79 extends (0, $db2c3bd39de38ed9$export$4293555f241ae35a) {
    /**
     * Socket constructor.
     *
     * @param {String|Object} uri - uri or options
     * @param {Object} opts - options
     */ constructor(uri, opts = {}){
        super();
        this.writeBuffer = [];
        if (uri && "object" === typeof uri) {
            opts = uri;
            uri = null;
        }
        if (uri) {
            uri = (0, $a15566998db3e298$export$98e6a39c04603d36)(uri);
            opts.hostname = uri.host;
            opts.secure = uri.protocol === "https" || uri.protocol === "wss";
            opts.port = uri.port;
            if (uri.query) opts.query = uri.query;
        } else if (opts.host) opts.hostname = (0, $a15566998db3e298$export$98e6a39c04603d36)(opts.host).host;
        (0, $8ba281d8602934c4$export$2f67576668b97183)(this, opts);
        this.secure = null != opts.secure ? opts.secure : typeof location !== "undefined" && "https:" === location.protocol;
        if (opts.hostname && !opts.port) // if no port is specified manually, use the protocol default
        opts.port = this.secure ? "443" : "80";
        this.hostname = opts.hostname || (typeof location !== "undefined" ? location.hostname : "localhost");
        this.port = opts.port || (typeof location !== "undefined" && location.port ? location.port : this.secure ? "443" : "80");
        this.transports = opts.transports || [
            "polling",
            "websocket"
        ];
        this.writeBuffer = [];
        this.prevBufferLen = 0;
        this.opts = Object.assign({
            path: "/engine.io",
            agent: false,
            withCredentials: false,
            upgrade: true,
            timestampParam: "t",
            rememberUpgrade: false,
            addTrailingSlash: true,
            rejectUnauthorized: true,
            perMessageDeflate: {
                threshold: 1024
            },
            transportOptions: {},
            closeOnBeforeunload: true
        }, opts);
        this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : "");
        if (typeof this.opts.query === "string") this.opts.query = (0, $62ebe56818ac3efc$export$2f872c0f2117be69)(this.opts.query);
        // set on handshake
        this.id = null;
        this.upgrades = null;
        this.pingInterval = null;
        this.pingTimeout = null;
        // set on heartbeat
        this.pingTimeoutTimer = null;
        if (typeof addEventListener === "function") {
            if (this.opts.closeOnBeforeunload) {
                // Firefox closes the connection when the "beforeunload" event is emitted but not Chrome. This event listener
                // ensures every browser behaves the same (no "disconnect" event at the Socket.IO level when the page is
                // closed/reloaded)
                this.beforeunloadEventListener = ()=>{
                    if (this.transport) {
                        // silently close the transport
                        this.transport.removeAllListeners();
                        this.transport.close();
                    }
                };
                addEventListener("beforeunload", this.beforeunloadEventListener, false);
            }
            if (this.hostname !== "localhost") {
                this.offlineEventListener = ()=>{
                    this.onClose("transport close", {
                        description: "network connection lost"
                    });
                };
                addEventListener("offline", this.offlineEventListener, false);
            }
        }
        this.open();
    }
    /**
     * Creates transport of the given type.
     *
     * @param {String} name - transport name
     * @return {Transport}
     * @private
     */ createTransport(name) {
        const query = Object.assign({}, this.opts.query);
        // append engine.io protocol identifier
        query.EIO = (0, $9bf46e541922caf5$export$a51d6b395ff4c65a);
        // transport name
        query.transport = name;
        // session id if we already have one
        if (this.id) query.sid = this.id;
        const opts = Object.assign({}, this.opts.transportOptions[name], this.opts, {
            query: query,
            socket: this,
            hostname: this.hostname,
            secure: this.secure,
            port: this.port
        });
        return new (0, $c1612040b076676b$export$46dec00755c1153b)[name](opts);
    }
    /**
     * Initializes transport to use and starts probe.
     *
     * @private
     */ open() {
        let transport;
        if (this.opts.rememberUpgrade && $abe47ab8241b7aa5$export$4798917dbf149b79.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1) transport = "websocket";
        else if (0 === this.transports.length) {
            // Emit error on next tick so it can be listened to
            this.setTimeoutFn(()=>{
                this.emitReserved("error", "No transports available");
            }, 0);
            return;
        } else transport = this.transports[0];
        this.readyState = "opening";
        // Retry with the next transport if the transport is disabled (jsonp: false)
        try {
            transport = this.createTransport(transport);
        } catch (e) {
            this.transports.shift();
            this.open();
            return;
        }
        transport.open();
        this.setTransport(transport);
    }
    /**
     * Sets the current transport. Disables the existing one (if any).
     *
     * @private
     */ setTransport(transport) {
        if (this.transport) this.transport.removeAllListeners();
        // set up transport
        this.transport = transport;
        // set up transport listeners
        transport.on("drain", this.onDrain.bind(this)).on("packet", this.onPacket.bind(this)).on("error", this.onError.bind(this)).on("close", (reason)=>this.onClose("transport close", reason));
    }
    /**
     * Probes a transport.
     *
     * @param {String} name - transport name
     * @private
     */ probe(name) {
        let transport = this.createTransport(name);
        let failed = false;
        $abe47ab8241b7aa5$export$4798917dbf149b79.priorWebsocketSuccess = false;
        const onTransportOpen = ()=>{
            if (failed) return;
            transport.send([
                {
                    type: "ping",
                    data: "probe"
                }
            ]);
            transport.once("packet", (msg)=>{
                if (failed) return;
                if ("pong" === msg.type && "probe" === msg.data) {
                    this.upgrading = true;
                    this.emitReserved("upgrading", transport);
                    if (!transport) return;
                    $abe47ab8241b7aa5$export$4798917dbf149b79.priorWebsocketSuccess = "websocket" === transport.name;
                    this.transport.pause(()=>{
                        if (failed) return;
                        if ("closed" === this.readyState) return;
                        cleanup();
                        this.setTransport(transport);
                        transport.send([
                            {
                                type: "upgrade"
                            }
                        ]);
                        this.emitReserved("upgrade", transport);
                        transport = null;
                        this.upgrading = false;
                        this.flush();
                    });
                } else {
                    const err = new Error("probe error");
                    // @ts-ignore
                    err.transport = transport.name;
                    this.emitReserved("upgradeError", err);
                }
            });
        };
        function freezeTransport() {
            if (failed) return;
            // Any callback called by transport should be ignored since now
            failed = true;
            cleanup();
            transport.close();
            transport = null;
        }
        // Handle any error that happens while probing
        const onerror = (err)=>{
            const error = new Error("probe error: " + err);
            // @ts-ignore
            error.transport = transport.name;
            freezeTransport();
            this.emitReserved("upgradeError", error);
        };
        function onTransportClose() {
            onerror("transport closed");
        }
        // When the socket is closed while we're probing
        function onclose() {
            onerror("socket closed");
        }
        // When the socket is upgraded while we're probing
        function onupgrade(to) {
            if (transport && to.name !== transport.name) freezeTransport();
        }
        // Remove all listeners on the transport and on self
        const cleanup = ()=>{
            transport.removeListener("open", onTransportOpen);
            transport.removeListener("error", onerror);
            transport.removeListener("close", onTransportClose);
            this.off("close", onclose);
            this.off("upgrading", onupgrade);
        };
        transport.once("open", onTransportOpen);
        transport.once("error", onerror);
        transport.once("close", onTransportClose);
        this.once("close", onclose);
        this.once("upgrading", onupgrade);
        transport.open();
    }
    /**
     * Called when connection is deemed open.
     *
     * @private
     */ onOpen() {
        this.readyState = "open";
        $abe47ab8241b7aa5$export$4798917dbf149b79.priorWebsocketSuccess = "websocket" === this.transport.name;
        this.emitReserved("open");
        this.flush();
        // we check for `readyState` in case an `open`
        // listener already closed the socket
        if ("open" === this.readyState && this.opts.upgrade) {
            let i = 0;
            const l = this.upgrades.length;
            for(; i < l; i++)this.probe(this.upgrades[i]);
        }
    }
    /**
     * Handles a packet.
     *
     * @private
     */ onPacket(packet) {
        if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
            this.emitReserved("packet", packet);
            // Socket is live - any packet counts
            this.emitReserved("heartbeat");
            switch(packet.type){
                case "open":
                    this.onHandshake(JSON.parse(packet.data));
                    break;
                case "ping":
                    this.resetPingTimeout();
                    this.sendPacket("pong");
                    this.emitReserved("ping");
                    this.emitReserved("pong");
                    break;
                case "error":
                    const err = new Error("server error");
                    // @ts-ignore
                    err.code = packet.data;
                    this.onError(err);
                    break;
                case "message":
                    this.emitReserved("data", packet.data);
                    this.emitReserved("message", packet.data);
                    break;
            }
        }
    }
    /**
     * Called upon handshake completion.
     *
     * @param {Object} data - handshake obj
     * @private
     */ onHandshake(data) {
        this.emitReserved("handshake", data);
        this.id = data.sid;
        this.transport.query.sid = data.sid;
        this.upgrades = this.filterUpgrades(data.upgrades);
        this.pingInterval = data.pingInterval;
        this.pingTimeout = data.pingTimeout;
        this.maxPayload = data.maxPayload;
        this.onOpen();
        // In case open handler closes socket
        if ("closed" === this.readyState) return;
        this.resetPingTimeout();
    }
    /**
     * Sets and resets ping timeout timer based on server pings.
     *
     * @private
     */ resetPingTimeout() {
        this.clearTimeoutFn(this.pingTimeoutTimer);
        this.pingTimeoutTimer = this.setTimeoutFn(()=>{
            this.onClose("ping timeout");
        }, this.pingInterval + this.pingTimeout);
        if (this.opts.autoUnref) this.pingTimeoutTimer.unref();
    }
    /**
     * Called on `drain` event
     *
     * @private
     */ onDrain() {
        this.writeBuffer.splice(0, this.prevBufferLen);
        // setting prevBufferLen = 0 is very important
        // for example, when upgrading, upgrade packet is sent over,
        // and a nonzero prevBufferLen could cause problems on `drain`
        this.prevBufferLen = 0;
        if (0 === this.writeBuffer.length) this.emitReserved("drain");
        else this.flush();
    }
    /**
     * Flush write buffers.
     *
     * @private
     */ flush() {
        if ("closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
            const packets = this.getWritablePackets();
            this.transport.send(packets);
            // keep track of current length of writeBuffer
            // splice writeBuffer and callbackBuffer on `drain`
            this.prevBufferLen = packets.length;
            this.emitReserved("flush");
        }
    }
    /**
     * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
     * long-polling)
     *
     * @private
     */ getWritablePackets() {
        const shouldCheckPayloadSize = this.maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1;
        if (!shouldCheckPayloadSize) return this.writeBuffer;
        let payloadSize = 1; // first packet type
        for(let i = 0; i < this.writeBuffer.length; i++){
            const data = this.writeBuffer[i].data;
            if (data) payloadSize += (0, $8ba281d8602934c4$export$a48f0734ac7c2329)(data);
            if (i > 0 && payloadSize > this.maxPayload) return this.writeBuffer.slice(0, i);
            payloadSize += 2; // separator + packet type
        }
        return this.writeBuffer;
    }
    /**
     * Sends a message.
     *
     * @param {String} msg - message.
     * @param {Object} options.
     * @param {Function} callback function.
     * @return {Socket} for chaining.
     */ write(msg, options, fn) {
        this.sendPacket("message", msg, options, fn);
        return this;
    }
    send(msg, options, fn) {
        this.sendPacket("message", msg, options, fn);
        return this;
    }
    /**
     * Sends a packet.
     *
     * @param {String} type: packet type.
     * @param {String} data.
     * @param {Object} options.
     * @param {Function} fn - callback function.
     * @private
     */ sendPacket(type, data, options, fn) {
        if ("function" === typeof data) {
            fn = data;
            data = undefined;
        }
        if ("function" === typeof options) {
            fn = options;
            options = null;
        }
        if ("closing" === this.readyState || "closed" === this.readyState) return;
        options = options || {};
        options.compress = false !== options.compress;
        const packet = {
            type: type,
            data: data,
            options: options
        };
        this.emitReserved("packetCreate", packet);
        this.writeBuffer.push(packet);
        if (fn) this.once("flush", fn);
        this.flush();
    }
    /**
     * Closes the connection.
     */ close() {
        const close = ()=>{
            this.onClose("forced close");
            this.transport.close();
        };
        const cleanupAndClose = ()=>{
            this.off("upgrade", cleanupAndClose);
            this.off("upgradeError", cleanupAndClose);
            close();
        };
        const waitForUpgrade = ()=>{
            // wait for upgrade to finish since we can't send packets while pausing a transport
            this.once("upgrade", cleanupAndClose);
            this.once("upgradeError", cleanupAndClose);
        };
        if ("opening" === this.readyState || "open" === this.readyState) {
            this.readyState = "closing";
            if (this.writeBuffer.length) this.once("drain", ()=>{
                if (this.upgrading) waitForUpgrade();
                else close();
            });
            else if (this.upgrading) waitForUpgrade();
            else close();
        }
        return this;
    }
    /**
     * Called upon transport error
     *
     * @private
     */ onError(err) {
        $abe47ab8241b7aa5$export$4798917dbf149b79.priorWebsocketSuccess = false;
        this.emitReserved("error", err);
        this.onClose("transport error", err);
    }
    /**
     * Called upon transport close.
     *
     * @private
     */ onClose(reason, description) {
        if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
            // clear timers
            this.clearTimeoutFn(this.pingTimeoutTimer);
            // stop event from firing again for transport
            this.transport.removeAllListeners("close");
            // ensure transport won't stay open
            this.transport.close();
            // ignore further transport communication
            this.transport.removeAllListeners();
            if (typeof removeEventListener === "function") {
                removeEventListener("beforeunload", this.beforeunloadEventListener, false);
                removeEventListener("offline", this.offlineEventListener, false);
            }
            // set ready state
            this.readyState = "closed";
            // clear session id
            this.id = null;
            // emit close event
            this.emitReserved("close", reason, description);
            // clean buffers after, so users can still
            // grab the buffers on `close` event
            this.writeBuffer = [];
            this.prevBufferLen = 0;
        }
    }
    /**
     * Filters upgrades, returning only those matching client transports.
     *
     * @param {Array} upgrades - server upgrades
     * @private
     */ filterUpgrades(upgrades) {
        const filteredUpgrades = [];
        let i = 0;
        const j = upgrades.length;
        for(; i < j; i++)if (~this.transports.indexOf(upgrades[i])) filteredUpgrades.push(upgrades[i]);
        return filteredUpgrades;
    }
}
$abe47ab8241b7aa5$export$4798917dbf149b79.protocol = (0, $9bf46e541922caf5$export$a51d6b395ff4c65a);







const $2a29b3c430eba438$export$a51d6b395ff4c65a = (0, $abe47ab8241b7aa5$export$4798917dbf149b79).protocol;


function $5c08770552c9b753$export$128fa18b7194ef(uri, path = "", loc) {
    let obj = uri;
    // default to window.location
    loc = loc || typeof location !== "undefined" && location;
    if (null == uri) uri = loc.protocol + "//" + loc.host;
    // relative path support
    if (typeof uri === "string") {
        if ("/" === uri.charAt(0)) {
            if ("/" === uri.charAt(1)) uri = loc.protocol + uri;
            else uri = loc.host + uri;
        }
        if (!/^(https?|wss?):\/\//.test(uri)) {
            if ("undefined" !== typeof loc) uri = loc.protocol + "//" + uri;
            else uri = "https://" + uri;
        }
        // parse
        obj = (0, $a15566998db3e298$export$98e6a39c04603d36)(uri);
    }
    // make sure we treat `localhost:80` and `localhost` equally
    if (!obj.port) {
        if (/^(http|ws)$/.test(obj.protocol)) obj.port = "80";
        else if (/^(http|ws)s$/.test(obj.protocol)) obj.port = "443";
    }
    obj.path = obj.path || "/";
    const ipv6 = obj.host.indexOf(":") !== -1;
    const host = ipv6 ? "[" + obj.host + "]" : obj.host;
    // define unique id
    obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
    // define href
    obj.href = obj.protocol + "://" + host + (loc && loc.port === obj.port ? "" : ":" + obj.port);
    return obj;
}



var $03a3b72c603cd207$exports = {};

$parcel$export($03a3b72c603cd207$exports, "protocol", () => $03a3b72c603cd207$export$a51d6b395ff4c65a);
$parcel$export($03a3b72c603cd207$exports, "PacketType", () => $03a3b72c603cd207$export$84d4095e16c6fc19);
$parcel$export($03a3b72c603cd207$exports, "Encoder", () => $03a3b72c603cd207$export$a50aceb0e02a00aa);
$parcel$export($03a3b72c603cd207$exports, "Decoder", () => $03a3b72c603cd207$export$f9de6ca0bc043724);

const $956ffe83d58cb181$var$withNativeArrayBuffer = typeof ArrayBuffer === "function";
const $956ffe83d58cb181$var$isView = (obj)=>{
    return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj.buffer instanceof ArrayBuffer;
};
const $956ffe83d58cb181$var$toString = Object.prototype.toString;
const $956ffe83d58cb181$var$withNativeBlob = typeof Blob === "function" || typeof Blob !== "undefined" && $956ffe83d58cb181$var$toString.call(Blob) === "[object BlobConstructor]";
const $956ffe83d58cb181$var$withNativeFile = typeof File === "function" || typeof File !== "undefined" && $956ffe83d58cb181$var$toString.call(File) === "[object FileConstructor]";
function $956ffe83d58cb181$export$37488ff1135b1696(obj) {
    return $956ffe83d58cb181$var$withNativeArrayBuffer && (obj instanceof ArrayBuffer || $956ffe83d58cb181$var$isView(obj)) || $956ffe83d58cb181$var$withNativeBlob && obj instanceof Blob || $956ffe83d58cb181$var$withNativeFile && obj instanceof File;
}
function $956ffe83d58cb181$export$5234c529abdb5610(obj, toJSON) {
    if (!obj || typeof obj !== "object") return false;
    if (Array.isArray(obj)) {
        for(let i = 0, l = obj.length; i < l; i++){
            if ($956ffe83d58cb181$export$5234c529abdb5610(obj[i])) return true;
        }
        return false;
    }
    if ($956ffe83d58cb181$export$37488ff1135b1696(obj)) return true;
    if (obj.toJSON && typeof obj.toJSON === "function" && arguments.length === 1) return $956ffe83d58cb181$export$5234c529abdb5610(obj.toJSON(), true);
    for(const key in obj){
        if (Object.prototype.hasOwnProperty.call(obj, key) && $956ffe83d58cb181$export$5234c529abdb5610(obj[key])) return true;
    }
    return false;
}


function $006e1f32ba7ca057$export$ac2edb9eb7af56f6(packet) {
    const buffers = [];
    const packetData = packet.data;
    const pack = packet;
    pack.data = $006e1f32ba7ca057$var$_deconstructPacket(packetData, buffers);
    pack.attachments = buffers.length; // number of binary 'attachments'
    return {
        packet: pack,
        buffers: buffers
    };
}
function $006e1f32ba7ca057$var$_deconstructPacket(data, buffers) {
    if (!data) return data;
    if ((0, $956ffe83d58cb181$export$37488ff1135b1696)(data)) {
        const placeholder = {
            _placeholder: true,
            num: buffers.length
        };
        buffers.push(data);
        return placeholder;
    } else if (Array.isArray(data)) {
        const newData = new Array(data.length);
        for(let i = 0; i < data.length; i++)newData[i] = $006e1f32ba7ca057$var$_deconstructPacket(data[i], buffers);
        return newData;
    } else if (typeof data === "object" && !(data instanceof Date)) {
        const newData1 = {};
        for(const key in data)if (Object.prototype.hasOwnProperty.call(data, key)) newData1[key] = $006e1f32ba7ca057$var$_deconstructPacket(data[key], buffers);
        return newData1;
    }
    return data;
}
function $006e1f32ba7ca057$export$a00da3b1ec037a04(packet, buffers) {
    packet.data = $006e1f32ba7ca057$var$_reconstructPacket(packet.data, buffers);
    delete packet.attachments; // no longer useful
    return packet;
}
function $006e1f32ba7ca057$var$_reconstructPacket(data, buffers) {
    if (!data) return data;
    if (data && data._placeholder === true) {
        const isIndexValid = typeof data.num === "number" && data.num >= 0 && data.num < buffers.length;
        if (isIndexValid) return buffers[data.num]; // appropriate buffer (should be natural order anyway)
        else throw new Error("illegal attachments");
    } else if (Array.isArray(data)) for(let i = 0; i < data.length; i++)data[i] = $006e1f32ba7ca057$var$_reconstructPacket(data[i], buffers);
    else if (typeof data === "object") {
        for(const key in data)if (Object.prototype.hasOwnProperty.call(data, key)) data[key] = $006e1f32ba7ca057$var$_reconstructPacket(data[key], buffers);
    }
    return data;
}



const $03a3b72c603cd207$export$a51d6b395ff4c65a = 5;
var $03a3b72c603cd207$export$84d4095e16c6fc19;
(function(PacketType) {
    PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
    PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
    PacketType[PacketType["EVENT"] = 2] = "EVENT";
    PacketType[PacketType["ACK"] = 3] = "ACK";
    PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
    PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
    PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
})($03a3b72c603cd207$export$84d4095e16c6fc19 || ($03a3b72c603cd207$export$84d4095e16c6fc19 = {}));
class $03a3b72c603cd207$export$a50aceb0e02a00aa {
    /**
     * Encoder constructor
     *
     * @param {function} replacer - custom replacer to pass down to JSON.parse
     */ constructor(replacer){
        this.replacer = replacer;
    }
    /**
     * Encode a packet as a single string if non-binary, or as a
     * buffer sequence, depending on packet type.
     *
     * @param {Object} obj - packet object
     */ encode(obj) {
        if (obj.type === $03a3b72c603cd207$export$84d4095e16c6fc19.EVENT || obj.type === $03a3b72c603cd207$export$84d4095e16c6fc19.ACK) {
            if ((0, $956ffe83d58cb181$export$5234c529abdb5610)(obj)) return this.encodeAsBinary({
                type: obj.type === $03a3b72c603cd207$export$84d4095e16c6fc19.EVENT ? $03a3b72c603cd207$export$84d4095e16c6fc19.BINARY_EVENT : $03a3b72c603cd207$export$84d4095e16c6fc19.BINARY_ACK,
                nsp: obj.nsp,
                data: obj.data,
                id: obj.id
            });
        }
        return [
            this.encodeAsString(obj)
        ];
    }
    /**
     * Encode packet as string.
     */ encodeAsString(obj) {
        // first is type
        let str = "" + obj.type;
        // attachments if we have them
        if (obj.type === $03a3b72c603cd207$export$84d4095e16c6fc19.BINARY_EVENT || obj.type === $03a3b72c603cd207$export$84d4095e16c6fc19.BINARY_ACK) str += obj.attachments + "-";
        // if we have a namespace other than `/`
        // we append it followed by a comma `,`
        if (obj.nsp && "/" !== obj.nsp) str += obj.nsp + ",";
        // immediately followed by the id
        if (null != obj.id) str += obj.id;
        // json data
        if (null != obj.data) str += JSON.stringify(obj.data, this.replacer);
        return str;
    }
    /**
     * Encode packet as 'buffer sequence' by removing blobs, and
     * deconstructing packet into object with placeholders and
     * a list of buffers.
     */ encodeAsBinary(obj) {
        const deconstruction = (0, $006e1f32ba7ca057$export$ac2edb9eb7af56f6)(obj);
        const pack = this.encodeAsString(deconstruction.packet);
        const buffers = deconstruction.buffers;
        buffers.unshift(pack); // add packet info to beginning of data list
        return buffers; // write all the buffers
    }
}
class $03a3b72c603cd207$export$f9de6ca0bc043724 extends (0, $db2c3bd39de38ed9$export$4293555f241ae35a) {
    /**
     * Decoder constructor
     *
     * @param {function} reviver - custom reviver to pass down to JSON.stringify
     */ constructor(reviver){
        super();
        this.reviver = reviver;
    }
    /**
     * Decodes an encoded packet string into packet JSON.
     *
     * @param {String} obj - encoded packet
     */ add(obj) {
        let packet;
        if (typeof obj === "string") {
            if (this.reconstructor) throw new Error("got plaintext data when reconstructing a packet");
            packet = this.decodeString(obj);
            const isBinaryEvent = packet.type === $03a3b72c603cd207$export$84d4095e16c6fc19.BINARY_EVENT;
            if (isBinaryEvent || packet.type === $03a3b72c603cd207$export$84d4095e16c6fc19.BINARY_ACK) {
                packet.type = isBinaryEvent ? $03a3b72c603cd207$export$84d4095e16c6fc19.EVENT : $03a3b72c603cd207$export$84d4095e16c6fc19.ACK;
                // binary packet's json
                this.reconstructor = new $03a3b72c603cd207$var$BinaryReconstructor(packet);
                // no attachments, labeled binary but no binary data to follow
                if (packet.attachments === 0) super.emitReserved("decoded", packet);
            } else // non-binary full packet
            super.emitReserved("decoded", packet);
        } else if ((0, $956ffe83d58cb181$export$37488ff1135b1696)(obj) || obj.base64) {
            // raw binary data
            if (!this.reconstructor) throw new Error("got binary data when not reconstructing a packet");
            else {
                packet = this.reconstructor.takeBinaryData(obj);
                if (packet) {
                    // received final buffer
                    this.reconstructor = null;
                    super.emitReserved("decoded", packet);
                }
            }
        } else throw new Error("Unknown type: " + obj);
    }
    /**
     * Decode a packet String (JSON data)
     *
     * @param {String} str
     * @return {Object} packet
     */ decodeString(str) {
        let i = 0;
        // look up type
        const p = {
            type: Number(str.charAt(0))
        };
        if ($03a3b72c603cd207$export$84d4095e16c6fc19[p.type] === undefined) throw new Error("unknown packet type " + p.type);
        // look up attachments if type binary
        if (p.type === $03a3b72c603cd207$export$84d4095e16c6fc19.BINARY_EVENT || p.type === $03a3b72c603cd207$export$84d4095e16c6fc19.BINARY_ACK) {
            const start = i + 1;
            while(str.charAt(++i) !== "-" && i != str.length);
            const buf = str.substring(start, i);
            if (buf != Number(buf) || str.charAt(i) !== "-") throw new Error("Illegal attachments");
            p.attachments = Number(buf);
        }
        // look up namespace (if any)
        if ("/" === str.charAt(i + 1)) {
            const start1 = i + 1;
            while(++i){
                const c = str.charAt(i);
                if ("," === c) break;
                if (i === str.length) break;
            }
            p.nsp = str.substring(start1, i);
        } else p.nsp = "/";
        // look up id
        const next = str.charAt(i + 1);
        if ("" !== next && Number(next) == next) {
            const start2 = i + 1;
            while(++i){
                const c1 = str.charAt(i);
                if (null == c1 || Number(c1) != c1) {
                    --i;
                    break;
                }
                if (i === str.length) break;
            }
            p.id = Number(str.substring(start2, i + 1));
        }
        // look up json data
        if (str.charAt(++i)) {
            const payload = this.tryParse(str.substr(i));
            if ($03a3b72c603cd207$export$f9de6ca0bc043724.isPayloadValid(p.type, payload)) p.data = payload;
            else throw new Error("invalid payload");
        }
        return p;
    }
    tryParse(str) {
        try {
            return JSON.parse(str, this.reviver);
        } catch (e) {
            return false;
        }
    }
    static isPayloadValid(type, payload) {
        switch(type){
            case $03a3b72c603cd207$export$84d4095e16c6fc19.CONNECT:
                return typeof payload === "object";
            case $03a3b72c603cd207$export$84d4095e16c6fc19.DISCONNECT:
                return payload === undefined;
            case $03a3b72c603cd207$export$84d4095e16c6fc19.CONNECT_ERROR:
                return typeof payload === "string" || typeof payload === "object";
            case $03a3b72c603cd207$export$84d4095e16c6fc19.EVENT:
            case $03a3b72c603cd207$export$84d4095e16c6fc19.BINARY_EVENT:
                return Array.isArray(payload) && payload.length > 0;
            case $03a3b72c603cd207$export$84d4095e16c6fc19.ACK:
            case $03a3b72c603cd207$export$84d4095e16c6fc19.BINARY_ACK:
                return Array.isArray(payload);
        }
    }
    /**
     * Deallocates a parser's resources
     */ destroy() {
        if (this.reconstructor) {
            this.reconstructor.finishedReconstruction();
            this.reconstructor = null;
        }
    }
}
/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 */ class $03a3b72c603cd207$var$BinaryReconstructor {
    constructor(packet){
        this.packet = packet;
        this.buffers = [];
        this.reconPack = packet;
    }
    /**
     * Method to be called when binary data received from connection
     * after a BINARY_EVENT packet.
     *
     * @param {Buffer | ArrayBuffer} binData - the raw binary data received
     * @return {null | Object} returns null if more binary data is expected or
     *   a reconstructed packet object if all buffers have been received.
     */ takeBinaryData(binData) {
        this.buffers.push(binData);
        if (this.buffers.length === this.reconPack.attachments) {
            // done with buffer list
            const packet = (0, $006e1f32ba7ca057$export$a00da3b1ec037a04)(this.reconPack, this.buffers);
            this.finishedReconstruction();
            return packet;
        }
        return null;
    }
    /**
     * Cleans up binary packet reconstruction variables.
     */ finishedReconstruction() {
        this.reconPack = null;
        this.buffers = [];
    }
}


function $7ef07b3128a521d4$export$af631764ddc44097(obj, ev, fn) {
    obj.on(ev, fn);
    return function subDestroy() {
        obj.off(ev, fn);
    };
}



/**
 * Internal events.
 * These events can't be emitted by the user.
 */ const $b00e28d3dc22066c$var$RESERVED_EVENTS = Object.freeze({
    connect: 1,
    connect_error: 1,
    disconnect: 1,
    disconnecting: 1,
    // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
    newListener: 1,
    removeListener: 1
});
class $b00e28d3dc22066c$export$4798917dbf149b79 extends (0, $db2c3bd39de38ed9$export$4293555f241ae35a) {
    /**
     * `Socket` constructor.
     */ constructor(io, nsp, opts){
        super();
        /**
         * Whether the socket is currently connected to the server.
         *
         * @example
         * const socket = io();
         *
         * socket.on("connect", () => {
         *   console.log(socket.connected); // true
         * });
         *
         * socket.on("disconnect", () => {
         *   console.log(socket.connected); // false
         * });
         */ this.connected = false;
        /**
         * Whether the connection state was recovered after a temporary disconnection. In that case, any missed packets will
         * be transmitted by the server.
         */ this.recovered = false;
        /**
         * Buffer for packets received before the CONNECT packet
         */ this.receiveBuffer = [];
        /**
         * Buffer for packets that will be sent once the socket is connected
         */ this.sendBuffer = [];
        /**
         * The queue of packets to be sent with retry in case of failure.
         *
         * Packets are sent one by one, each waiting for the server acknowledgement, in order to guarantee the delivery order.
         * @private
         */ this._queue = [];
        /**
         * A sequence to generate the ID of the {@link QueuedPacket}.
         * @private
         */ this._queueSeq = 0;
        this.ids = 0;
        this.acks = {};
        this.flags = {};
        this.io = io;
        this.nsp = nsp;
        if (opts && opts.auth) this.auth = opts.auth;
        this._opts = Object.assign({}, opts);
        if (this.io._autoConnect) this.open();
    }
    /**
     * Whether the socket is currently disconnected
     *
     * @example
     * const socket = io();
     *
     * socket.on("connect", () => {
     *   console.log(socket.disconnected); // false
     * });
     *
     * socket.on("disconnect", () => {
     *   console.log(socket.disconnected); // true
     * });
     */ get disconnected() {
        return !this.connected;
    }
    /**
     * Subscribe to open, close and packet events
     *
     * @private
     */ subEvents() {
        if (this.subs) return;
        const io = this.io;
        this.subs = [
            (0, $7ef07b3128a521d4$export$af631764ddc44097)(io, "open", this.onopen.bind(this)),
            (0, $7ef07b3128a521d4$export$af631764ddc44097)(io, "packet", this.onpacket.bind(this)),
            (0, $7ef07b3128a521d4$export$af631764ddc44097)(io, "error", this.onerror.bind(this)),
            (0, $7ef07b3128a521d4$export$af631764ddc44097)(io, "close", this.onclose.bind(this)), 
        ];
    }
    /**
     * Whether the Socket will try to reconnect when its Manager connects or reconnects.
     *
     * @example
     * const socket = io();
     *
     * console.log(socket.active); // true
     *
     * socket.on("disconnect", (reason) => {
     *   if (reason === "io server disconnect") {
     *     // the disconnection was initiated by the server, you need to manually reconnect
     *     console.log(socket.active); // false
     *   }
     *   // else the socket will automatically try to reconnect
     *   console.log(socket.active); // true
     * });
     */ get active() {
        return !!this.subs;
    }
    /**
     * "Opens" the socket.
     *
     * @example
     * const socket = io({
     *   autoConnect: false
     * });
     *
     * socket.connect();
     */ connect() {
        if (this.connected) return this;
        this.subEvents();
        if (!this.io["_reconnecting"]) this.io.open(); // ensure open
        if ("open" === this.io._readyState) this.onopen();
        return this;
    }
    /**
     * Alias for {@link connect()}.
     */ open() {
        return this.connect();
    }
    /**
     * Sends a `message` event.
     *
     * This method mimics the WebSocket.send() method.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
     *
     * @example
     * socket.send("hello");
     *
     * // this is equivalent to
     * socket.emit("message", "hello");
     *
     * @return self
     */ send(...args) {
        args.unshift("message");
        this.emit.apply(this, args);
        return this;
    }
    /**
     * Override `emit`.
     * If the event is in `events`, it's emitted normally.
     *
     * @example
     * socket.emit("hello", "world");
     *
     * // all serializable datastructures are supported (no need to call JSON.stringify)
     * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
     *
     * // with an acknowledgement from the server
     * socket.emit("hello", "world", (val) => {
     *   // ...
     * });
     *
     * @return self
     */ emit(ev, ...args) {
        if ($b00e28d3dc22066c$var$RESERVED_EVENTS.hasOwnProperty(ev)) throw new Error('"' + ev.toString() + '" is a reserved event name');
        args.unshift(ev);
        if (this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) {
            this._addToQueue(args);
            return this;
        }
        const packet = {
            type: (0, $03a3b72c603cd207$export$84d4095e16c6fc19).EVENT,
            data: args
        };
        packet.options = {};
        packet.options.compress = this.flags.compress !== false;
        // event ack callback
        if ("function" === typeof args[args.length - 1]) {
            const id = this.ids++;
            const ack = args.pop();
            this._registerAckCallback(id, ack);
            packet.id = id;
        }
        const isTransportWritable = this.io.engine && this.io.engine.transport && this.io.engine.transport.writable;
        const discardPacket = this.flags.volatile && (!isTransportWritable || !this.connected);
        if (discardPacket) ;
        else if (this.connected) {
            this.notifyOutgoingListeners(packet);
            this.packet(packet);
        } else this.sendBuffer.push(packet);
        this.flags = {};
        return this;
    }
    /**
     * @private
     */ _registerAckCallback(id, ack) {
        var _a;
        const timeout = (_a = this.flags.timeout) !== null && _a !== void 0 ? _a : this._opts.ackTimeout;
        if (timeout === undefined) {
            this.acks[id] = ack;
            return;
        }
        // @ts-ignore
        const timer = this.io.setTimeoutFn(()=>{
            delete this.acks[id];
            for(let i = 0; i < this.sendBuffer.length; i++)if (this.sendBuffer[i].id === id) this.sendBuffer.splice(i, 1);
            ack.call(this, new Error("operation has timed out"));
        }, timeout);
        this.acks[id] = (...args)=>{
            // @ts-ignore
            this.io.clearTimeoutFn(timer);
            ack.apply(this, [
                null,
                ...args
            ]);
        };
    }
    /**
     * Emits an event and waits for an acknowledgement
     *
     * @example
     * // without timeout
     * const response = await socket.emitWithAck("hello", "world");
     *
     * // with a specific timeout
     * try {
     *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
     * } catch (err) {
     *   // the server did not acknowledge the event in the given delay
     * }
     *
     * @return a Promise that will be fulfilled when the server acknowledges the event
     */ emitWithAck(ev, ...args) {
        // the timeout flag is optional
        const withErr = this.flags.timeout !== undefined || this._opts.ackTimeout !== undefined;
        return new Promise((resolve, reject)=>{
            args.push((arg1, arg2)=>{
                if (withErr) return arg1 ? reject(arg1) : resolve(arg2);
                else return resolve(arg1);
            });
            this.emit(ev, ...args);
        });
    }
    /**
     * Add the packet to the queue.
     * @param args
     * @private
     */ _addToQueue(args) {
        let ack;
        if (typeof args[args.length - 1] === "function") ack = args.pop();
        const packet = {
            id: this._queueSeq++,
            tryCount: 0,
            pending: false,
            args: args,
            flags: Object.assign({
                fromQueue: true
            }, this.flags)
        };
        args.push((err, ...responseArgs)=>{
            if (packet !== this._queue[0]) // the packet has already been acknowledged
            return;
            const hasError = err !== null;
            if (hasError) {
                if (packet.tryCount > this._opts.retries) {
                    this._queue.shift();
                    if (ack) ack(err);
                }
            } else {
                this._queue.shift();
                if (ack) ack(null, ...responseArgs);
            }
            packet.pending = false;
            return this._drainQueue();
        });
        this._queue.push(packet);
        this._drainQueue();
    }
    /**
     * Send the first packet of the queue, and wait for an acknowledgement from the server.
     * @param force - whether to resend a packet that has not been acknowledged yet
     *
     * @private
     */ _drainQueue(force = false) {
        if (!this.connected || this._queue.length === 0) return;
        const packet = this._queue[0];
        if (packet.pending && !force) return;
        packet.pending = true;
        packet.tryCount++;
        this.flags = packet.flags;
        this.emit.apply(this, packet.args);
    }
    /**
     * Sends a packet.
     *
     * @param packet
     * @private
     */ packet(packet) {
        packet.nsp = this.nsp;
        this.io._packet(packet);
    }
    /**
     * Called upon engine `open`.
     *
     * @private
     */ onopen() {
        if (typeof this.auth == "function") this.auth((data)=>{
            this._sendConnectPacket(data);
        });
        else this._sendConnectPacket(this.auth);
    }
    /**
     * Sends a CONNECT packet to initiate the Socket.IO session.
     *
     * @param data
     * @private
     */ _sendConnectPacket(data) {
        this.packet({
            type: (0, $03a3b72c603cd207$export$84d4095e16c6fc19).CONNECT,
            data: this._pid ? Object.assign({
                pid: this._pid,
                offset: this._lastOffset
            }, data) : data
        });
    }
    /**
     * Called upon engine or manager `error`.
     *
     * @param err
     * @private
     */ onerror(err) {
        if (!this.connected) this.emitReserved("connect_error", err);
    }
    /**
     * Called upon engine `close`.
     *
     * @param reason
     * @param description
     * @private
     */ onclose(reason, description) {
        this.connected = false;
        delete this.id;
        this.emitReserved("disconnect", reason, description);
    }
    /**
     * Called with socket packet.
     *
     * @param packet
     * @private
     */ onpacket(packet) {
        const sameNamespace = packet.nsp === this.nsp;
        if (!sameNamespace) return;
        switch(packet.type){
            case (0, $03a3b72c603cd207$export$84d4095e16c6fc19).CONNECT:
                if (packet.data && packet.data.sid) this.onconnect(packet.data.sid, packet.data.pid);
                else this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
                break;
            case (0, $03a3b72c603cd207$export$84d4095e16c6fc19).EVENT:
            case (0, $03a3b72c603cd207$export$84d4095e16c6fc19).BINARY_EVENT:
                this.onevent(packet);
                break;
            case (0, $03a3b72c603cd207$export$84d4095e16c6fc19).ACK:
            case (0, $03a3b72c603cd207$export$84d4095e16c6fc19).BINARY_ACK:
                this.onack(packet);
                break;
            case (0, $03a3b72c603cd207$export$84d4095e16c6fc19).DISCONNECT:
                this.ondisconnect();
                break;
            case (0, $03a3b72c603cd207$export$84d4095e16c6fc19).CONNECT_ERROR:
                this.destroy();
                const err = new Error(packet.data.message);
                // @ts-ignore
                err.data = packet.data.data;
                this.emitReserved("connect_error", err);
                break;
        }
    }
    /**
     * Called upon a server event.
     *
     * @param packet
     * @private
     */ onevent(packet) {
        const args = packet.data || [];
        if (null != packet.id) args.push(this.ack(packet.id));
        if (this.connected) this.emitEvent(args);
        else this.receiveBuffer.push(Object.freeze(args));
    }
    emitEvent(args) {
        if (this._anyListeners && this._anyListeners.length) {
            const listeners = this._anyListeners.slice();
            for (const listener of listeners)listener.apply(this, args);
        }
        super.emit.apply(this, args);
        if (this._pid && args.length && typeof args[args.length - 1] === "string") this._lastOffset = args[args.length - 1];
    }
    /**
     * Produces an ack callback to emit with an event.
     *
     * @private
     */ ack(id) {
        const self = this;
        let sent = false;
        return function(...args) {
            // prevent double callbacks
            if (sent) return;
            sent = true;
            self.packet({
                type: (0, $03a3b72c603cd207$export$84d4095e16c6fc19).ACK,
                id: id,
                data: args
            });
        };
    }
    /**
     * Called upon a server acknowlegement.
     *
     * @param packet
     * @private
     */ onack(packet) {
        const ack = this.acks[packet.id];
        if ("function" === typeof ack) {
            ack.apply(this, packet.data);
            delete this.acks[packet.id];
        }
    }
    /**
     * Called upon server connect.
     *
     * @private
     */ onconnect(id, pid) {
        this.id = id;
        this.recovered = pid && this._pid === pid;
        this._pid = pid; // defined only if connection state recovery is enabled
        this.connected = true;
        this.emitBuffered();
        this.emitReserved("connect");
        this._drainQueue(true);
    }
    /**
     * Emit buffered events (received and emitted).
     *
     * @private
     */ emitBuffered() {
        this.receiveBuffer.forEach((args)=>this.emitEvent(args));
        this.receiveBuffer = [];
        this.sendBuffer.forEach((packet)=>{
            this.notifyOutgoingListeners(packet);
            this.packet(packet);
        });
        this.sendBuffer = [];
    }
    /**
     * Called upon server disconnect.
     *
     * @private
     */ ondisconnect() {
        this.destroy();
        this.onclose("io server disconnect");
    }
    /**
     * Called upon forced client/server side disconnections,
     * this method ensures the manager stops tracking us and
     * that reconnections don't get triggered for this.
     *
     * @private
     */ destroy() {
        if (this.subs) {
            // clean subscriptions to avoid reconnections
            this.subs.forEach((subDestroy)=>subDestroy());
            this.subs = undefined;
        }
        this.io["_destroy"](this);
    }
    /**
     * Disconnects the socket manually. In that case, the socket will not try to reconnect.
     *
     * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
     *
     * @example
     * const socket = io();
     *
     * socket.on("disconnect", (reason) => {
     *   // console.log(reason); prints "io client disconnect"
     * });
     *
     * socket.disconnect();
     *
     * @return self
     */ disconnect() {
        if (this.connected) this.packet({
            type: (0, $03a3b72c603cd207$export$84d4095e16c6fc19).DISCONNECT
        });
        // remove socket from pool
        this.destroy();
        if (this.connected) // fire events
        this.onclose("io client disconnect");
        return this;
    }
    /**
     * Alias for {@link disconnect()}.
     *
     * @return self
     */ close() {
        return this.disconnect();
    }
    /**
     * Sets the compress flag.
     *
     * @example
     * socket.compress(false).emit("hello");
     *
     * @param compress - if `true`, compresses the sending data
     * @return self
     */ compress(compress) {
        this.flags.compress = compress;
        return this;
    }
    /**
     * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
     * ready to send messages.
     *
     * @example
     * socket.volatile.emit("hello"); // the server may or may not receive it
     *
     * @returns self
     */ get volatile() {
        this.flags.volatile = true;
        return this;
    }
    /**
     * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
     * given number of milliseconds have elapsed without an acknowledgement from the server:
     *
     * @example
     * socket.timeout(5000).emit("my-event", (err) => {
     *   if (err) {
     *     // the server did not acknowledge the event in the given delay
     *   }
     * });
     *
     * @returns self
     */ timeout(timeout) {
        this.flags.timeout = timeout;
        return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * @example
     * socket.onAny((event, ...args) => {
     *   console.log(`got ${event}`);
     * });
     *
     * @param listener
     */ onAny(listener) {
        this._anyListeners = this._anyListeners || [];
        this._anyListeners.push(listener);
        return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * @example
     * socket.prependAny((event, ...args) => {
     *   console.log(`got event ${event}`);
     * });
     *
     * @param listener
     */ prependAny(listener) {
        this._anyListeners = this._anyListeners || [];
        this._anyListeners.unshift(listener);
        return this;
    }
    /**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @example
     * const catchAllListener = (event, ...args) => {
     *   console.log(`got event ${event}`);
     * }
     *
     * socket.onAny(catchAllListener);
     *
     * // remove a specific listener
     * socket.offAny(catchAllListener);
     *
     * // or remove all listeners
     * socket.offAny();
     *
     * @param listener
     */ offAny(listener) {
        if (!this._anyListeners) return this;
        if (listener) {
            const listeners = this._anyListeners;
            for(let i = 0; i < listeners.length; i++)if (listener === listeners[i]) {
                listeners.splice(i, 1);
                return this;
            }
        } else this._anyListeners = [];
        return this;
    }
    /**
     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
     * e.g. to remove listeners.
     */ listenersAny() {
        return this._anyListeners || [];
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * Note: acknowledgements sent to the server are not included.
     *
     * @example
     * socket.onAnyOutgoing((event, ...args) => {
     *   console.log(`sent event ${event}`);
     * });
     *
     * @param listener
     */ onAnyOutgoing(listener) {
        this._anyOutgoingListeners = this._anyOutgoingListeners || [];
        this._anyOutgoingListeners.push(listener);
        return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * Note: acknowledgements sent to the server are not included.
     *
     * @example
     * socket.prependAnyOutgoing((event, ...args) => {
     *   console.log(`sent event ${event}`);
     * });
     *
     * @param listener
     */ prependAnyOutgoing(listener) {
        this._anyOutgoingListeners = this._anyOutgoingListeners || [];
        this._anyOutgoingListeners.unshift(listener);
        return this;
    }
    /**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @example
     * const catchAllListener = (event, ...args) => {
     *   console.log(`sent event ${event}`);
     * }
     *
     * socket.onAnyOutgoing(catchAllListener);
     *
     * // remove a specific listener
     * socket.offAnyOutgoing(catchAllListener);
     *
     * // or remove all listeners
     * socket.offAnyOutgoing();
     *
     * @param [listener] - the catch-all listener (optional)
     */ offAnyOutgoing(listener) {
        if (!this._anyOutgoingListeners) return this;
        if (listener) {
            const listeners = this._anyOutgoingListeners;
            for(let i = 0; i < listeners.length; i++)if (listener === listeners[i]) {
                listeners.splice(i, 1);
                return this;
            }
        } else this._anyOutgoingListeners = [];
        return this;
    }
    /**
     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
     * e.g. to remove listeners.
     */ listenersAnyOutgoing() {
        return this._anyOutgoingListeners || [];
    }
    /**
     * Notify the listeners for each packet sent
     *
     * @param packet
     *
     * @private
     */ notifyOutgoingListeners(packet) {
        if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
            const listeners = this._anyOutgoingListeners.slice();
            for (const listener of listeners)listener.apply(this, packet.data);
        }
    }
}




function $adb1407dfcb4b689$export$2d38012449449c89(opts) {
    opts = opts || {};
    this.ms = opts.min || 100;
    this.max = opts.max || 10000;
    this.factor = opts.factor || 2;
    this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
    this.attempts = 0;
}
/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */ $adb1407dfcb4b689$export$2d38012449449c89.prototype.duration = function() {
    var ms = this.ms * Math.pow(this.factor, this.attempts++);
    if (this.jitter) {
        var rand = Math.random();
        var deviation = Math.floor(rand * this.jitter * ms);
        ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
    }
    return Math.min(ms, this.max) | 0;
};
/**
 * Reset the number of attempts.
 *
 * @api public
 */ $adb1407dfcb4b689$export$2d38012449449c89.prototype.reset = function() {
    this.attempts = 0;
};
/**
 * Set the minimum duration
 *
 * @api public
 */ $adb1407dfcb4b689$export$2d38012449449c89.prototype.setMin = function(min) {
    this.ms = min;
};
/**
 * Set the maximum duration
 *
 * @api public
 */ $adb1407dfcb4b689$export$2d38012449449c89.prototype.setMax = function(max) {
    this.max = max;
};
/**
 * Set the jitter
 *
 * @api public
 */ $adb1407dfcb4b689$export$2d38012449449c89.prototype.setJitter = function(jitter) {
    this.jitter = jitter;
};



class $9c62c76def01917f$export$d0d38e7dec7a1a61 extends (0, $db2c3bd39de38ed9$export$4293555f241ae35a) {
    constructor(uri, opts){
        var _a;
        super();
        this.nsps = {};
        this.subs = [];
        if (uri && "object" === typeof uri) {
            opts = uri;
            uri = undefined;
        }
        opts = opts || {};
        opts.path = opts.path || "/socket.io";
        this.opts = opts;
        (0, $8ba281d8602934c4$export$2f67576668b97183)(this, opts);
        this.reconnection(opts.reconnection !== false);
        this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
        this.reconnectionDelay(opts.reconnectionDelay || 1000);
        this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
        this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
        this.backoff = new (0, $adb1407dfcb4b689$export$2d38012449449c89)({
            min: this.reconnectionDelay(),
            max: this.reconnectionDelayMax(),
            jitter: this.randomizationFactor()
        });
        this.timeout(null == opts.timeout ? 20000 : opts.timeout);
        this._readyState = "closed";
        this.uri = uri;
        const _parser = opts.parser || $03a3b72c603cd207$exports;
        this.encoder = new _parser.Encoder();
        this.decoder = new _parser.Decoder();
        this._autoConnect = opts.autoConnect !== false;
        if (this._autoConnect) this.open();
    }
    reconnection(v) {
        if (!arguments.length) return this._reconnection;
        this._reconnection = !!v;
        return this;
    }
    reconnectionAttempts(v) {
        if (v === undefined) return this._reconnectionAttempts;
        this._reconnectionAttempts = v;
        return this;
    }
    reconnectionDelay(v) {
        var _a;
        if (v === undefined) return this._reconnectionDelay;
        this._reconnectionDelay = v;
        (_a = this.backoff) === null || _a === void 0 || _a.setMin(v);
        return this;
    }
    randomizationFactor(v) {
        var _a;
        if (v === undefined) return this._randomizationFactor;
        this._randomizationFactor = v;
        (_a = this.backoff) === null || _a === void 0 || _a.setJitter(v);
        return this;
    }
    reconnectionDelayMax(v) {
        var _a;
        if (v === undefined) return this._reconnectionDelayMax;
        this._reconnectionDelayMax = v;
        (_a = this.backoff) === null || _a === void 0 || _a.setMax(v);
        return this;
    }
    timeout(v) {
        if (!arguments.length) return this._timeout;
        this._timeout = v;
        return this;
    }
    /**
     * Starts trying to reconnect if reconnection is enabled and we have not
     * started reconnecting yet
     *
     * @private
     */ maybeReconnectOnOpen() {
        // Only try to reconnect if it's the first time we're connecting
        if (!this._reconnecting && this._reconnection && this.backoff.attempts === 0) // keeps reconnection from firing twice for the same reconnection loop
        this.reconnect();
    }
    /**
     * Sets the current transport `socket`.
     *
     * @param {Function} fn - optional, callback
     * @return self
     * @public
     */ open(fn) {
        if (~this._readyState.indexOf("open")) return this;
        this.engine = new (0, $abe47ab8241b7aa5$export$4798917dbf149b79)(this.uri, this.opts);
        const socket = this.engine;
        const self = this;
        this._readyState = "opening";
        this.skipReconnect = false;
        // emit `open`
        const openSubDestroy = (0, $7ef07b3128a521d4$export$af631764ddc44097)(socket, "open", function() {
            self.onopen();
            fn && fn();
        });
        // emit `error`
        const errorSub = (0, $7ef07b3128a521d4$export$af631764ddc44097)(socket, "error", (err)=>{
            self.cleanup();
            self._readyState = "closed";
            this.emitReserved("error", err);
            if (fn) fn(err);
            else // Only do this if there is no fn to handle the error
            self.maybeReconnectOnOpen();
        });
        if (false !== this._timeout) {
            const timeout = this._timeout;
            if (timeout === 0) openSubDestroy(); // prevents a race condition with the 'open' event
            // set timer
            const timer = this.setTimeoutFn(()=>{
                openSubDestroy();
                socket.close();
                // @ts-ignore
                socket.emit("error", new Error("timeout"));
            }, timeout);
            if (this.opts.autoUnref) timer.unref();
            this.subs.push(function subDestroy() {
                clearTimeout(timer);
            });
        }
        this.subs.push(openSubDestroy);
        this.subs.push(errorSub);
        return this;
    }
    /**
     * Alias for open()
     *
     * @return self
     * @public
     */ connect(fn) {
        return this.open(fn);
    }
    /**
     * Called upon transport open.
     *
     * @private
     */ onopen() {
        // clear old subs
        this.cleanup();
        // mark as open
        this._readyState = "open";
        this.emitReserved("open");
        // add new subs
        const socket = this.engine;
        this.subs.push((0, $7ef07b3128a521d4$export$af631764ddc44097)(socket, "ping", this.onping.bind(this)), (0, $7ef07b3128a521d4$export$af631764ddc44097)(socket, "data", this.ondata.bind(this)), (0, $7ef07b3128a521d4$export$af631764ddc44097)(socket, "error", this.onerror.bind(this)), (0, $7ef07b3128a521d4$export$af631764ddc44097)(socket, "close", this.onclose.bind(this)), (0, $7ef07b3128a521d4$export$af631764ddc44097)(this.decoder, "decoded", this.ondecoded.bind(this)));
    }
    /**
     * Called upon a ping.
     *
     * @private
     */ onping() {
        this.emitReserved("ping");
    }
    /**
     * Called with data.
     *
     * @private
     */ ondata(data) {
        try {
            this.decoder.add(data);
        } catch (e) {
            this.onclose("parse error", e);
        }
    }
    /**
     * Called when parser fully decodes a packet.
     *
     * @private
     */ ondecoded(packet) {
        // the nextTick call prevents an exception in a user-provided event listener from triggering a disconnection due to a "parse error"
        (0, $0d0867257e52d371$export$bdd553fddd433dcb)(()=>{
            this.emitReserved("packet", packet);
        }, this.setTimeoutFn);
    }
    /**
     * Called upon socket error.
     *
     * @private
     */ onerror(err) {
        this.emitReserved("error", err);
    }
    /**
     * Creates a new socket for the given `nsp`.
     *
     * @return {Socket}
     * @public
     */ socket(nsp, opts) {
        let socket = this.nsps[nsp];
        if (!socket) {
            socket = new (0, $b00e28d3dc22066c$export$4798917dbf149b79)(this, nsp, opts);
            this.nsps[nsp] = socket;
        } else if (this._autoConnect && !socket.active) socket.connect();
        return socket;
    }
    /**
     * Called upon a socket close.
     *
     * @param socket
     * @private
     */ _destroy(socket) {
        const nsps = Object.keys(this.nsps);
        for (const nsp of nsps){
            const socket1 = this.nsps[nsp];
            if (socket1.active) return;
        }
        this._close();
    }
    /**
     * Writes a packet.
     *
     * @param packet
     * @private
     */ _packet(packet) {
        const encodedPackets = this.encoder.encode(packet);
        for(let i = 0; i < encodedPackets.length; i++)this.engine.write(encodedPackets[i], packet.options);
    }
    /**
     * Clean up transport subscriptions and packet buffer.
     *
     * @private
     */ cleanup() {
        this.subs.forEach((subDestroy)=>subDestroy());
        this.subs.length = 0;
        this.decoder.destroy();
    }
    /**
     * Close the current socket.
     *
     * @private
     */ _close() {
        this.skipReconnect = true;
        this._reconnecting = false;
        this.onclose("forced close");
        if (this.engine) this.engine.close();
    }
    /**
     * Alias for close()
     *
     * @private
     */ disconnect() {
        return this._close();
    }
    /**
     * Called upon engine close.
     *
     * @private
     */ onclose(reason, description) {
        this.cleanup();
        this.backoff.reset();
        this._readyState = "closed";
        this.emitReserved("close", reason, description);
        if (this._reconnection && !this.skipReconnect) this.reconnect();
    }
    /**
     * Attempt a reconnection.
     *
     * @private
     */ reconnect() {
        if (this._reconnecting || this.skipReconnect) return this;
        const self = this;
        if (this.backoff.attempts >= this._reconnectionAttempts) {
            this.backoff.reset();
            this.emitReserved("reconnect_failed");
            this._reconnecting = false;
        } else {
            const delay = this.backoff.duration();
            this._reconnecting = true;
            const timer = this.setTimeoutFn(()=>{
                if (self.skipReconnect) return;
                this.emitReserved("reconnect_attempt", self.backoff.attempts);
                // check again for the case socket closed in above events
                if (self.skipReconnect) return;
                self.open((err)=>{
                    if (err) {
                        self._reconnecting = false;
                        self.reconnect();
                        this.emitReserved("reconnect_error", err);
                    } else self.onreconnect();
                });
            }, delay);
            if (this.opts.autoUnref) timer.unref();
            this.subs.push(function subDestroy() {
                clearTimeout(timer);
            });
        }
    }
    /**
     * Called upon successful reconnect.
     *
     * @private
     */ onreconnect() {
        const attempt = this.backoff.attempts;
        this._reconnecting = false;
        this.backoff.reset();
        this.emitReserved("reconnect", attempt);
    }
}




/**
 * Managers cache.
 */ const $7f4f903e67a88c10$var$cache = {};
function $7f4f903e67a88c10$export$841407ceb083bd74(uri, opts) {
    if (typeof uri === "object") {
        opts = uri;
        uri = undefined;
    }
    opts = opts || {};
    const parsed = (0, $5c08770552c9b753$export$128fa18b7194ef)(uri, opts.path || "/socket.io");
    const source = parsed.source;
    const id = parsed.id;
    const path = parsed.path;
    const sameNamespace = $7f4f903e67a88c10$var$cache[id] && path in $7f4f903e67a88c10$var$cache[id]["nsps"];
    const newConnection = opts.forceNew || opts["force new connection"] || false === opts.multiplex || sameNamespace;
    let io;
    if (newConnection) io = new (0, $9c62c76def01917f$export$d0d38e7dec7a1a61)(source, opts);
    else {
        if (!$7f4f903e67a88c10$var$cache[id]) $7f4f903e67a88c10$var$cache[id] = new (0, $9c62c76def01917f$export$d0d38e7dec7a1a61)(source, opts);
        io = $7f4f903e67a88c10$var$cache[id];
    }
    if (parsed.query && !opts.query) opts.query = parsed.queryKey;
    return io.socket(parsed.path, opts);
}
// so that "lookup" can be used both as a function (e.g. `io(...)`) and as a
// namespace (e.g. `io.connect(...)`), for backward compatibility
Object.assign($7f4f903e67a88c10$export$841407ceb083bd74, {
    Manager: $9c62c76def01917f$export$d0d38e7dec7a1a61,
    Socket: $b00e28d3dc22066c$export$4798917dbf149b79,
    io: $7f4f903e67a88c10$export$841407ceb083bd74,
    connect: $7f4f903e67a88c10$export$841407ceb083bd74
});


var $e307541a347955a1$require$io = $7f4f903e67a88c10$export$841407ceb083bd74;
var $f7c9fda677014379$exports = {};
/**
 * This module contains classes and functions intended for use by both the
 * client and the server, in order to provide a common interface.
 *
 * <br>
 * <img
 * src =
 * "https://raw.githubusercontent.com/mvanderkamp/wams.wiki/master/graphs/shared.png"
 * style = "max-height: 250px;"
 * >
 *
 * @module shared
 */ "use strict";
var $790ae0c709639dfd$exports = {};
"use strict";
var $ecff7108faed7dc7$exports = {};
"use strict";
/**
 * @namespace utilities
 * @memberof module:shared
 */ /**
 * Defines the given property on the given object with the given value, and sets
 * the property to unconfigurable, unwritable, but enumerable.
 *
 * @param {object} obj - The object on which the property will be defined.
 * @param {string} prop - The property to define on obj.
 * @param {any} val - The value to assign to the property.
 *
 * @memberof module:shared.utilities
 */ function $ecff7108faed7dc7$var$defineOwnImmutableEnumerableProperty(obj, prop, val) {
    Object.defineProperty(obj, prop, {
        value: val,
        configurable: false,
        enumerable: true,
        writable: false
    });
}
/**
 * Plain, simple NOP definition. If there's a faster NOP, redefine it here.
 *
 * @memberof module:shared.utilities
 */ const $ecff7108faed7dc7$var$NOP = ()=>{};
/**
 * Removes the given item from the given array, according to its Id.
 *
 * @memberof module:shared.utilities
 *
 * @param {Object[]} array - The array to modify.
 * @param {Object} item  - The item to remove from array according to its Id.
 *
 * @return {boolean} True if the item was found and removed, false otherwise.
 */ function $ecff7108faed7dc7$var$removeById(array, item) {
    const idx = array.findIndex((o)=>o.id === item.id);
    if (idx >= 0) {
        array.splice(idx, 1);
        return true;
    }
    return false;
}
$ecff7108faed7dc7$exports = Object.freeze({
    defineOwnImmutableEnumerableProperty: $ecff7108faed7dc7$var$defineOwnImmutableEnumerableProperty,
    NOP: $ecff7108faed7dc7$var$NOP,
    removeById: $ecff7108faed7dc7$var$removeById
});


var $790ae0c709639dfd$require$defineOwnImmutableEnumerableProperty = $ecff7108faed7dc7$exports.defineOwnImmutableEnumerableProperty;
/**
 * Given a previous ID, returns the next unique ID in the sequence.
 *
 * @inner
 * @memberof module:shared.IdStamper
 * @throws Error
 *
 * @param {number} previous - The previously assigned unique ID.
 *
 * @returns {number} The next unique ID
 */ function $790ae0c709639dfd$var$getUniqueId(previous) {
    const next = previous + 1;
    if (Number.isSafeInteger(next)) return next;
    throw new Error("Ran out of unique IDs!");
}
// Mark these fields as intended for internal use.
const $790ae0c709639dfd$var$symbols = Object.freeze({
    prevId: Symbol("prevId")
});
/**
 * Class for stamping and cloning integer IDs. Stamped IDs are unique on a
 * per-IdStamper basis.
 *
 * @example
 * const stamper = new IdStamper();
 * const obj = {};
 * stamper.stampNewId(obj);
 * console.log(obj.id);  // an integer unique to Ids stamped by stamper
 * obj.id = 2;           // has no effect.
 * delete obj.id;        // false
 *
 * const danger = {};
 * IdStamper.cloneId(danger, obj.id); // Will work. 'danger' & 'obj' are
 *                                    // now both using the same Id.
 *
 * @memberof module:shared
 */ class $790ae0c709639dfd$var$IdStamper {
    constructor(){
        /**
     * The value of the previously assigned ID.
     *
     * @type {number}
     * @alias [@@prevId]
     * @memberof module:shared.IdStamper
     */ this[$790ae0c709639dfd$var$symbols.prevId] = 0;
    }
    /**
   * Stamps an integer ID, unique to this IdStamper, onto the given object.
   *
   * All Ids produced by this method are guaranteed to be unique, on a
   * per-stamper basis. (Two uniquely constructed stampers can and will generate
   * identical Ids).
   *
   * @param {Object} obj - An object onto which an ID will be stamped.
   */ stampNewId(obj) {
        this[$790ae0c709639dfd$var$symbols.prevId] = $790ae0c709639dfd$var$getUniqueId(this[$790ae0c709639dfd$var$symbols.prevId]);
        $790ae0c709639dfd$require$defineOwnImmutableEnumerableProperty(obj, "id", this[$790ae0c709639dfd$var$symbols.prevId]);
    }
    /**
   * Stamps a clone of the given ID onto the given object.
   *
   * @param {Object} obj - An object onto which an ID will be stamped.
   * @param {number} id - The ID to clone onto obj.
   */ static cloneId(obj, id) {
        if (Number.isSafeInteger(id)) $790ae0c709639dfd$require$defineOwnImmutableEnumerableProperty(obj, "id", id);
    }
}
$790ae0c709639dfd$exports = $790ae0c709639dfd$var$IdStamper;


var $c824f763a1f6c4dc$exports = {};
/*
 * Shared Message class for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 *
 * The purpose of this class is to provide a funnel through which all messages
 * between client and server must pass. In concert with the Reporter interface,
 * it allows for a sanity check such that the correct sort of data is getting
 * passed back and forth.
 *
 * Unfortunately this does not provide a strict guarantee that informal and ad
 * hoc messages aren't getting emitted somewhere, so it is up to the programmer
 * to be disciplined and adhere to the Message / Reporter principle.
 */ "use strict";

var $c824f763a1f6c4dc$require$defineOwnImmutableEnumerableProperty = $ecff7108faed7dc7$exports.defineOwnImmutableEnumerableProperty;
/**
 * TYPES is an explicit list of the types of messages that will be passed back
 * and forth. Messages not on this list should be ignored!
 *
 * @enum {string}
 * @readonly
 * @lends module:shared.Message
 */ const $c824f763a1f6c4dc$var$TYPES = {
    // For the server to inform about changes to the model
    /** @const */ ADD_ELEMENT: "add-element",
    /** @const */ ADD_IMAGE: "add-image",
    /** @const */ ADD_ITEM: "add-item",
    /** @const */ ADD_SHADOW: "add-shadow",
    /** @const */ ADD_GROUP: "add-group",
    /** @const */ RM_ITEM: "remove-item",
    /** @const */ RM_SHADOW: "remove-shadow",
    /** @const */ UD_ITEM: "update-item",
    /** @const */ UD_SHADOW: "update-shadow",
    /** @const */ UD_VIEW: "update-view",
    // For hopefully occasional extra adjustments to objects in the model.
    /** @const */ RM_ATTRS: "remove-attributes",
    /** @const */ SET_ITEMS: "set-items",
    /** @const */ SET_ATTRS: "set-attributes",
    /** @const */ SET_IMAGE: "set-image",
    /** @const */ SET_RENDER: "set-render",
    /** @const */ SET_PARENT: "set-parent",
    // Connection establishment related (disconnect, initial setup)
    /** @const */ INITIALIZE: "initialize",
    /** @const */ LAYOUT: "layout",
    /** @const */ FULL: "full",
    // User event related
    /** @const */ CLICK: "click",
    /** @const */ RESIZE: "resize",
    /** @const */ SWIPE: "swipe",
    /** @const */ TRACK: "track",
    /** @const */ TRANSFORM: "transform",
    // Multi-device gesture related
    /** @const */ POINTER: "pointer",
    /** @const */ BLUR: "blur",
    // Page event related
    /** @const */ IMG_LOAD: "image-loaded",
    // User defined actions
    /** @const */ DISPATCH: "dispatch"
};
Object.freeze($c824f763a1f6c4dc$var$TYPES);
const $c824f763a1f6c4dc$var$TYPE_VALUES = Object.freeze(Object.values($c824f763a1f6c4dc$var$TYPES));
/**
 * The Message class provides a funnel through which data passed between the
 * client and server must flow.
 *
 * If an invalid type is received, the constructor throws an exception. If an
 * invalid reporter is received, an exception will not be thrown until
 * 'emitWith()' is called.
 *
 * @memberof module:shared
 *
 * @throws TypeError
 *
 * @param {string} type - The message type. Must be one of the explicitly listed
 * message types available on the Message object.
 * @param {module:shared.Reporter} reporter - A Reporter instance, containing
 * the data to be emitted.
 */ class $c824f763a1f6c4dc$var$Message {
    constructor(type, reporter){
        if (!$c824f763a1f6c4dc$var$TYPE_VALUES.includes(type)) throw new TypeError("Invalid message type!");
        /**
     * The type of Message. Must be one of the predefined types available as
     * static fields on the Message class.
     *
     * @type {string}
     */ this.type = type;
        /**
     * The Reporter which holds the data to send in the Message.
     *
     * @type {module:shared.Reporter}
     */ this.reporter = reporter;
    }
    /**
   * Emits the data contained in the reporter along the channel defined by
   * emitter.
   *
   * @param {Emitter} emitter - An object capable of emitting data packets. Must
   * have an 'emit()' function.
   */ emitWith(emitter) {
        emitter.emit(this.type, this.reporter.report());
    }
}
/*
 * Only define the messages once, above, and now attach them to the Message
 * Class object for external reference.
 */ Object.entries($c824f763a1f6c4dc$var$TYPES).forEach(([p, v])=>{
    $c824f763a1f6c4dc$require$defineOwnImmutableEnumerableProperty($c824f763a1f6c4dc$var$Message, p, v);
});
$c824f763a1f6c4dc$exports = $c824f763a1f6c4dc$var$Message;


var $a40a9c66ba14e077$exports = {};
"use strict";
var $208dfeea6b2ad908$exports = {};
"use strict";

/**
 * This factory can generate the basic classes that need to communicate
 *  property values between the client and server.
 *
 * @memberof module:shared
 * @param {object} coreProperties - It is the properties defined on this object,
 * and only these properties, which will be reported by the reporter. The values
 * provided will be used as the defaults.
 */ function $208dfeea6b2ad908$var$ReporterFactory(coreProperties) {
    const INITIALIZER = Object.freeze({
        ...coreProperties
    });
    const KEYS = Object.freeze(Object.keys(INITIALIZER));
    /**
   * A Reporter regulates communication between client and server by enforcing a
   * strict set of rules over what data can be shared for the given class.
   *
   * @memberof module:shared
   *
   * @param {Object} data - Data to store in the reporter. All own properties of
   * 'data' will be transferred. Additionally, the prototype chain of 'data'
   * will be searched for the core properties of this Reporter.
   */ class Reporter {
        constructor(data){
            // Merge the defaults with all the own enumerable properties of 'data'
            // onto the new instance.
            Object.assign(this, INITIALIZER, data);
            // Special access for coreProperties existing anywhere up the prototype
            // chain of 'data'.
            this.assign(data);
        }
        /**
     * Save onto this Reporter instance the values in data which correspond to
     * its core properties. Searches the prototype chain of 'data'.
     *
     * @param {Object} data - Data values to attempt to save.
     */ assign(data = {}) {
            KEYS.forEach((p)=>{
                if (p in data) this[p] = data[p];
            });
        }
        /**
     * Provide a report of the data saved in this Reporter instance. Only those
     * instance properties which correspond to core properties will be reported.
     *
     * @return {Object} Contains the core properties of this Reporter instance.
     */ report() {
            const data = {};
            KEYS.forEach((p)=>{
                data[p] = this[p];
            });
            $790ae0c709639dfd$exports.cloneId(data, this.id);
            return data;
        }
    }
    // Expose the default settings onto the return class object.
    Reporter.DEFAULTS = Object.freeze({
        ...coreProperties
    });
    return Reporter;
}
$208dfeea6b2ad908$exports = $208dfeea6b2ad908$var$ReporterFactory;


/**
 * This Item class provides a common interface between the client and the server
 * by which the Items can interact safely.
 *
 * @class Item
 * @memberof module:shared
 * @extends module:shared.Reporter
 */ const $a40a9c66ba14e077$var$Item = $208dfeea6b2ad908$exports({
    /**
   * X coordinate of the Item.
   *
   * @name x
   * @type {number}
   * @default 0
   * @memberof module:shared.Item
   * @instance
   */ x: 0,
    /**
   * Y coordinate of the Item.
   *
   * @name y
   * @type {number}
   * @default 0
   * @memberof module:shared.Item
   * @instance
   */ y: 0,
    /**
   * Rotation of the Item.
   *
   * @name rotation
   * @type {number}
   * @default 0
   * @memberof module:shared.Item
   * @instance
   */ rotation: 0,
    /**
   * Scale of the Item.
   *
   * @name scale
   * @type {number}
   * @default 1
   * @memberof module:shared.Item
   * @instance
   */ scale: 1,
    /**
   * Type description of the Item.
   *
   * @name type
   * @type {string}
   * @default 'item/polygonal'
   * @memberof module:shared.Item
   * @instance
   */ type: "item/polygonal",
    /**
   * Whether to raise item upon interaction or
   * lock Z position instead.
   *
   * @name lockZ
   * @type {boolean}
   * @default false
   * @memberof module:shared.Item
   * @instance
   */ lockZ: false
});
/**
 * This WamsElement class provides a common interface between the client and the
 * server by which the elements interact safely.
 *
 * @class WamsElement
 * @memberof module:shared
 * @extends module:shared.Reporter
 */ const $a40a9c66ba14e077$var$WamsElement = $208dfeea6b2ad908$exports({
    /**
   * X coordinate of the WamsElement.
   *
   * @name x
   * @type {number}
   * @default 0
   * @memberof module:shared.WamsElement
   * @instance
   */ x: 0,
    /**
   * Y coordinate of the WamsElement.
   *
   * @name y
   * @type {number}
   * @default 0
   * @memberof module:shared.WamsElement
   * @instance
   */ y: 0,
    /**
   * Width of the WamsElement.
   *
   * @name width
   * @type {number}
   * @default 400
   * @memberof module:shared.WamsElement
   * @instance
   */ width: 400,
    /**
   * Height of the WamsElement.
   *
   * @name height
   * @type {number}
   * @default 300
   * @memberof module:shared.WamsElement
   * @instance
   */ height: 300,
    /**
   * Rotation of the WamsElement.
   *
   * @name rotation
   * @type {number}
   * @default 0
   * @memberof module:shared.WamsElement
   * @instance
   */ rotation: 0,
    /**
   * Scale of the WamsElement.
   *
   * @name scale
   * @type {number}
   * @default 1
   * @memberof module:shared.WamsElement
   * @instance
   */ scale: 1,
    /**
   * Type description of the WamsElement.
   *
   * @name type
   * @type {string}
   * @default 'item/element'
   * @memberof module:shared.WamsElement
   * @instance
   */ type: "item/element",
    /**
   * Tag name of the WamsElement.
   *
   * @name tagname
   * @type {string}
   * @default 'div'
   * @memberof module:shared.WamsElement
   * @instance
   */ tagname: "div",
    /**
   * Whether to raise item upon interaction or
   * lock Z position instead.
   *
   * @name lockZ
   * @type {boolean}
   * @default false
   * @memberof module:shared.Item
   * @instance
   */ lockZ: false
});
/**
 * This WamsImage class provides a common interface between the client and the
 * server by which the images can interact safely.
 *
 * @class WamsImage
 * @memberof module:shared
 * @extends module:shared.Reporter
 */ const $a40a9c66ba14e077$var$WamsImage = $208dfeea6b2ad908$exports({
    /**
   * X coordinate of the WamsImage.
   *
   * @name x
   * @type {number}
   * @default 0
   * @memberof module:shared.WamsImage
   * @instance
   */ x: 0,
    /**
   * Y coordinate of the WamsImage.
   *
   * @name y
   * @type {number}
   * @default 0
   * @memberof module:shared.WamsImage
   * @instance
   */ y: 0,
    /**
   * Width of the WamsImage.
   *
   * @name width
   * @type {number}
   * @default 400
   * @memberof module:shared.WamsImage
   * @instance
   */ width: 400,
    /**
   * Height of the WamsImage.
   *
   * @name height
   * @type {number}
   * @default 300
   * @memberof module:shared.WamsImage
   * @instance
   */ height: 300,
    /**
   * Rotation of the WamsImage.
   *
   * @name rotation
   * @type {number}
   * @default 0
   * @memberof module:shared.WamsImage
   * @instance
   */ rotation: 0,
    /**
   * Scale of the WamsImage.
   *
   * @name scale
   * @type {number}
   * @default 1
   * @memberof module:shared.WamsImage
   * @instance
   */ scale: 1,
    /**
   * Type description of the WamsImage.
   *
   * @name type
   * @type {string}
   * @default 'item/image'
   * @memberof module:shared.WamsImage
   * @instance
   */ type: "item/image",
    /**
   * Whether to raise image upon interaction or
   * lock Z position instead.
   *
   * @name lockZ
   * @type {boolean}
   * @default false
   * @memberof module:shared.WamsImage
   * @instance
   */ lockZ: false
});
/**
 * This View class provides a common interface between the client and
 * the server by which the Views can interact safely.
 *
 * @class View
 * @memberof module:shared
 * @extends module:shared.Reporter
 */ const $a40a9c66ba14e077$var$View = $208dfeea6b2ad908$exports({
    /**
   * X coordinate of the View.
   *
   * @name x
   * @type {number}
   * @default 0
   * @memberof module:shared.View
   * @instance
   */ x: 0,
    /**
   * Y coordinate of the View.
   *
   * @name y
   * @type {number}
   * @default 0
   * @memberof module:shared.View
   * @instance
   */ y: 0,
    /**
   * Width of the View.
   *
   * @name width
   * @type {number}
   * @default 1600
   * @memberof module:shared.View
   * @instance
   */ width: 1600,
    /**
   * Height of the View.
   *
   * @name height
   * @type {number}
   * @default 900
   * @memberof module:shared.View
   * @instance
   */ height: 900,
    /**
   * Type of object.
   *
   * @name type
   * @type {string}
   * @default 'view/background'
   * @memberof module:shared.View
   * @instance
   */ type: "view/background",
    /**
   * Scale of the View.
   *
   * @name scale
   * @type {number}
   * @default 1
   * @memberof module:shared.View
   * @instance
   */ scale: 1,
    /**
   * Rotation of the View.
   *
   * @name rotation
   * @type {number}
   * @default 0
   * @memberof module:shared.View
   * @instance
   */ rotation: 0,
    /**
   * The index is an integer identifying the View, coming from ServerController.
   *
   * @name index
   * @type {number}
   * @default undefined
   * @memberof module:shared.View
   * @instance
   */ index: undefined
});
/**
 * This class allows generic Input data reporting between client and server.
 * Honestly it's a bit of a cheaty hack around the Message / Reporter protocol,
 * but it simplifies the code and makes things easier to maintain. And honestly
 * the Message / Reporter protocol is mostly focused on protecting Views and
 * Items anyway.
 *
 * @class DataReporter
 * @memberof module:shared
 * @extends module:shared.Reporter
 */ const $a40a9c66ba14e077$var$DataReporter = $208dfeea6b2ad908$exports({
    /**
   * Generic data pass-through.
   *
   * @name data
   * @type {Object}
   * @default null
   * @memberof module:shared.DataReporter
   * @instance
   */ data: null
});
/**
 * This class allows reporting of the full state of the model, for bringing
 * new clients up to speed (or potentially also for recovering a client, if
 * need be).
 *
 * @class FullStateReporter
 * @memberof module:shared
 * @extends module:shared.Reporter
 */ const $a40a9c66ba14e077$var$FullStateReporter = $208dfeea6b2ad908$exports({
    /**
   * All currently active views.
   *
   * @name views
   * @type {View[]}
   * @default []
   * @memberof module:shared.FullStateReporter
   * @instance
   */ views: [],
    /**
   * All current items.
   *
   * @name items
   * @type {Item[]}
   * @default []
   * @memberof module:shared.FullStateReporter
   * @instance
   */ items: [],
    /**
   * Paths to client scripts to include by browsers.
   *
   * @name clientScripts
   * @type {string[]}
   * @default []
   * @memberof module:shared.FullStateReporter
   * @instance
   */ clientScripts: [],
    /**
   * Paths to stylesheets to include by browsers.
   *
   * @name stylesheets
   * @type {string[]}
   * @default []
   * @memberof module:shared.FullStateReporter
   * @instance
   */ stylesheets: [],
    /**
   * Toggle to show/hide client shadows.
   *
   * @name shadows
   * @type {boolean}
   * @default false
   * @memberof module:shared.FullStateReporter
   * @instance
   */ shadows: false,
    /**
   * Toggle to show/hide current view status.
   *
   * @name status
   * @type {boolean}
   * @default false
   * @memberof module:shared.FullStateReporter
   * @instance
   */ status: false,
    /**
   * The background colour of the workspace.
   *
   * @name color
   * @type {string}
   * @default '#dad1e3'
   * @memberof module:shared.FullStateReporter
   * @instance
   */ color: "#dad1e3",
    /**
   * The background colour of the workspace.
   *
   * @name backgroundImage
   * @type {string}
   * @default null
   * @memberof module:shared.FullStateReporter
   * @instance
   */ backgroundImage: null,
    /**
   * The title of the page.
   *
   * @name title
   * @type {string}
   * @default 'WAMS: Workspaces Across Multiple Surfaces'
   * @memberof module:shared.FullStateReporter
   * @instance
   */ title: "WAMS: Workspaces Across Multiple Surfaces",
    /**
   * The id assigned to this view.
   *
   * @name id
   * @type {number}
   * @default null
   * @memberof module:shared.FullStateReporter
   * @instance
   */ id: null,
    /**
   * Whether to enable multi-screen gestures
   * by processing gestures on the server side.
   *
   * @name useMultiScreenGestures
   * @type {boolean}
   * @default false
   * @memberof module:shared.FullStateReporter
   * @instance
   */ useMultiScreenGestures: false
});
/**
 * Enables forwarding of TouchEvents from the client to the server.
 *
 * @class PointerReporter
 * @memberof module:shared
 * @extends module:shared.Reporter
 */ const $a40a9c66ba14e077$var$PointerReporter = $208dfeea6b2ad908$exports({
    /**
   * The type of event. (e.g. 'pointerdown', 'pointermove', etc.)
   *
   * @name type
   * @type {string}
   * @default null
   * @memberof module:shared.PointerReporter
   * @instance
   */ type: null,
    /**
   * The pointer ID.
   *
   * @name pointerId
   * @type {number}
   * @default null
   * @memberof module:shared.PointerReporter
   * @instance
   */ pointerId: null,
    /**
   * The X coordinate of the pointer relative to the viewport.
   *
   * @name clientX
   * @type {number}
   * @default null
   * @memberof module:shared.PointerReporter
   * @instance
   */ clientX: null,
    /**
   * The Y coordinate of the pointer relative to the viewport.
   *
   * @name clientY
   * @type {number}
   * @default null
   * @memberof module:shared.PointerReporter
   * @instance
   */ clientY: null,
    /**
   * Whether the CTRL key was pressed at the time of the event.
   *
   * @name ctrlKey
   * @type {boolean}
   * @default false
   * @memberof module:shared.PointerReporter
   * @instance
   */ ctrlKey: false,
    /**
   * Whether the ALT key was pressed at the time of the event.
   *
   * @name altKey
   * @type {boolean}
   * @default false
   * @memberof module:shared.PointerReporter
   * @instance
   */ altKey: false,
    /**
   * Whether the SHIFT key was pressed at the time of the event.
   *
   * @name shiftKey
   * @type {boolean}
   * @default false
   * @memberof module:shared.PointerReporter
   * @instance
   */ shiftKey: false,
    /**
   * Whether the META key was pressed at the time of the event.
   *
   * @name metaKey
   * @type {boolean}
   * @default false
   * @memberof module:shared.PointerReporter
   * @instance
   */ metaKey: false
});
$a40a9c66ba14e077$exports = {
    Item: $a40a9c66ba14e077$var$Item,
    View: $a40a9c66ba14e077$var$View,
    DataReporter: $a40a9c66ba14e077$var$DataReporter,
    FullStateReporter: $a40a9c66ba14e077$var$FullStateReporter,
    PointerReporter: $a40a9c66ba14e077$var$PointerReporter,
    WamsElement: $a40a9c66ba14e077$var$WamsElement,
    WamsImage: $a40a9c66ba14e077$var$WamsImage
};



var $ec846c706b0069ec$exports = {};
"use strict";
var $9f5d312980c8548e$exports = {};
"use strict";
/**
 * Defines a set of basic operations on a point in a two dimensional space.
 *
 * @memberof module:shared
 *
 * @param {number} [x=0] - x coordinate of the point.
 * @param {number} [y=0] - y coordinate of the point.
 */ class $9f5d312980c8548e$var$Point2D {
    constructor(x = 0, y = 0){
        /**
     * X coordinate of the point.
     *
     * @type {number}
     */ this.x = x;
        /**
     * Y coordinate of the point.
     *
     * @type {number}
     */ this.y = y;
    }
    /**
   * Add the given point to this point.
   *
   * @param {module:shared.Point2D} point - The point to add.
   *
   * @return {module:shared.Point2D} this
   */ add({ x: x = 0 , y: y = 0  }) {
        this.x += x;
        this.y += y;
        return this;
    }
    /**
   * Calculates the angle between this point and the given point.
   *
   * @param {!module:shared.Point2D} point - Projected point for calculating
   * the angle.
   *
   * @return {number} Radians along the unit circle where the projected point
   * lies.
   */ angleTo(point) {
        return Math.atan2(point.y - this.y, point.x - this.x);
    }
    /**
   * Determine the average distance from this point to the provided array of
   * points.
   *
   * @param {!module:shared.Point2D[]} points - the Point2D objects to
   * calculate the average distance to.
   *
   * @return {number} The average distance from this point to the provided
   * points.
   */ averageDistanceTo(points) {
        return this.totalDistanceTo(points) / points.length;
    }
    /**
   * Clones this point.
   *
   * @returns {module:shared.Point2D} An exact clone of this point.
   */ clone() {
        return new $9f5d312980c8548e$var$Point2D(this.x, this.y);
    }
    /**
   * Calculates the distance between two points.
   *
   * @param {!module:shared.Point2D} point - Point to which the distance is
   * calculated.
   *
   * @return {number} The distance between the two points, a.k.a. the
   * hypoteneuse.
   */ distanceTo(point) {
        return Math.hypot(point.x - this.x, point.y - this.y);
    }
    /**
   * Divide the point's values by the given amount.
   *
   * @param {number} coefficient - divide x,y by this amount.
   *
   * @return {module:shared.Point2D} this
   */ divideBy(coefficient = 1) {
        this.x /= coefficient;
        this.y /= coefficient;
        return this;
    }
    /**
   * Tests if a point is Left|On|Right of an infinite line. Assumes that the
   * given points are such that one is above and one is below this point. Note
   * that the semantics of left/right is based on the normal coordinate space,
   * not the y-axis-inverted coordinate space of images and the canvas.
   *
   * @see {@link http://geomalgorithms.com/a03-_inclusion.html}
   *
   * @param {module:shared.Point2D} p0 - first point of the line.
   * @param {module:shared.Point2D} p1 - second point of the line.
   *
   * @return {number} >0 if this point is left of the line through p0 and p1
   * @return {number} =0 if this point is on the line
   * @return {number} <0 if this point is right of the line
   */ isLeftOf(p0, p1) {
        const dl = p1.minus(p0);
        const dp = this.minus(p0);
        return dl.x * dp.y - dl.y * dp.x;
    }
    /**
   * Subtracts the given point from this point to form a new point.
   *
   * @param {module:shared.Point2D} p - Point to subtract from this point.
   *
   * @return {module:shared.Point2D} A new point which is the simple subraction
   * of the given point from this point.
   */ minus({ x: x = 0 , y: y = 0  }) {
        return new $9f5d312980c8548e$var$Point2D(this.x - x, this.y - y);
    }
    /**
   * Multiply this point by the given point, in-place.
   *
   * @param {number} coefficient - Amount by which to multiply the values in
   * this point.
   *
   * @return {module:shared.Point2D} this
   */ multiplyBy(coefficient = 1) {
        this.x *= coefficient;
        this.y *= coefficient;
        return this;
    }
    /**
   * Rotate the point by theta radians.
   *
   * @param {number} theta - Amount of rotation to apply, in radians.
   *
   * @return {module:shared.Point2D} this
   */ rotate(theta = 0) {
        const { x: x , y: y  } = this;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        this.x = x * cosTheta - y * sinTheta;
        this.y = x * sinTheta + y * cosTheta;
        return this;
    }
    /**
   * Calculates the total distance from this point to an array of points.
   *
   * @param {!module:shared.Point2D[]} points - The array of Point2D objects to
   * calculate the total distance to.
   *
   * @return {number} The total distance from this point to the provided points.
   */ totalDistanceTo(points) {
        return points.reduce((d, p)=>d + this.distanceTo(p), 0);
    }
    /**
   * Calculates the midpoint of a list of points.
   *
   * @param {module:shared.Point2D[]} points - The array of Point2D objects for
   * which to calculate the midpoint
   *
   * @return {?module:shared.Point2D} The midpoint of the provided points. Null
   * if the provided array is empty.
   */ static midpoint(points = []) {
        if (points.length === 0) return null;
        const total = $9f5d312980c8548e$var$Point2D.sum(points);
        return new $9f5d312980c8548e$var$Point2D(total.x / points.length, total.y / points.length);
    }
    /**
   * Calculates the sum of the given points.
   *
   * @param {module:shared.Point2D[]} points - The Point2D objects to sum up.
   *
   * @return {module:shared.Point2D} A new Point2D representing the sum of the
   * given points.
   */ static sum(points = []) {
        return points.reduce((total, pt)=>total.add(pt), new $9f5d312980c8548e$var$Point2D(0, 0));
    }
}
$9f5d312980c8548e$exports = $9f5d312980c8548e$var$Point2D;


/**
 * A polygon in two dimensions. Can be complex.
 *
 * @memberof module:shared
 * @implements {module:shared.Hitbox}
 *
 * @param {module:shared.Point2D[]} points - The points that make up the
 * polygon, given in order (clockwise and counter-clockwise are both fine).
 */ class $ec846c706b0069ec$var$Polygon2D {
    constructor(points){
        if (points.length < 1) throw new TypeError("A polygon requires at least one vertex.");
        /**
     * A closed list of the points making up this polygon. "Closed" here means
     * that the first and last entries of the list are the same. Closing the
     * polygon in this manner is handled by the constructor.
     *
     * @type {module:shared.Point2D[]}
     */ this.points = points.map(({ x: x , y: y  })=>new $9f5d312980c8548e$exports(x, y));
        /**
     * Store the centroid of the polygon for quick hit tests.
     *
     * @type {module:shared.Point2D[]}
     */ this.centroid = $9f5d312980c8548e$exports.midpoint(this.points);
        /**
     * Save the maximum radius of the polygon for quick hit tests.
     *
     * @type {number}
     */ this.radius = this.points.reduce((max, point)=>{
            const curr = this.centroid.distanceTo(point);
            return max > curr ? max : curr;
        });
        // Close the polygon.
        this.points.push(this.points[0].clone());
    }
    /**
   * Determines if a point is inside the polygon.
   *
   * Rules for deciding whether a point is inside the polygon:
   *  1. If it is clearly outside, return false.
   *  2. If it is clearly inside, return true.
   *  3. If it is on a left or bottom edge, return true.
   *  4. If it is on a right or top edge, return false.
   *  5. If it is on a lower-left vertex, return true.
   *  6. If it is on a lower-right, upper-left, or upper-right vertex, return
   *      false.
   *
   * Uses the winding number method for robust and efficient point-in-polygon
   * detection.
   * @see {@link http://geomalgorithms.com/a03-_inclusion.html}
   *
   * @param {module:shared.Point2D[]} p - Point to test.
   *
   * @return {boolean} true if the point is inside the polygon, false otherwise.
   */ contains(p) {
        if (this.centroid.distanceTo(p) > this.radius) return false;
        return this.winding_number(p) !== 0;
    }
    /**
   * Winding number test for a point in a polygon
   *
   * @see {@link http://geomalgorithms.com/a03-_inclusion.html}
   *
   * @param {module:shared.Point2D[]} point - The point to test.
   *
   * @return {number} The winding number (=0 only when P is outside)
   */ winding_number(p) {
        let wn = 0;
        const point = new $9f5d312980c8548e$exports(p.x, p.y);
        for(let i = 0; i < this.points.length - 1; ++i)if (this.points[i].y <= point.y) {
            if (this.points[i + 1].y > point.y) // Upward crossing
            {
                if (point.isLeftOf(this.points[i], this.points[i + 1]) > 0) ++wn;
            }
        } else {
            if (this.points[i + 1].y <= point.y) // Downward crossing
            {
                if (point.isLeftOf(this.points[i], this.points[i + 1]) < 0) --wn;
            }
        }
        return wn;
    }
}
$ec846c706b0069ec$exports = $ec846c706b0069ec$var$Polygon2D;



var $f7a0e19f0797a511$exports = {};
"use strict";
/**
 * A rectangular hitbox. Remember that this rectangle describes the item as if
 * its settings were x=0, y=0, scale=1, rotation=0.
 *
 * @memberof module:shared
 * @implements {module:shared.Hitbox}
 *
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 * @param {number} [x=0] - The x offset of the rectangle.
 * @param {number} [y=0] - The y offset of the rectangle.
 */ class $f7a0e19f0797a511$var$Rectangle {
    constructor(width, height, x = 0, y = 0){
        /**
     * The width of the rectangle.
     *
     * @type {number}
     */ this.width = width;
        /**
     * The height of the rectangle.
     *
     * @type {number}
     */ this.height = height;
        /**
     * The x coordinate of the rectangle.
     *
     * @type {number}
     */ this.x = x;
        /**
     * The y coordinate of the rectangle.
     *
     * @type {number}
     */ this.y = y;
    }
    /**
   * Determines if a point is inside the rectangle.
   *
   * @param {module:shared.Point2D} point - The point to test.
   *
   * @return {boolean} true if the point is inside the rectangle, false
   * otherwise.
   */ contains(point) {
        return point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height;
    }
}
$f7a0e19f0797a511$exports = $f7a0e19f0797a511$var$Rectangle;


var $d8db4388a2194527$exports = {};
"use strict";
/**
 * A simple circular hitbox. Remember that this circle describes the item as if
 * its settings were x=0, y=0, scale=1, rotation=0.
 *
 * @memberof module:shared
 * @implements {module:shared.Hitbox}
 *
 * @param {number} radius - The radius of the circle.
 * @param {number} [x=0] - The x offset of the circle.
 * @param {number} [y=0] - The y offset of the circle.
 */ class $d8db4388a2194527$var$Circle {
    constructor(radius, x = 0, y = 0){
        /**
     * The radius of the circle.
     *
     * @type {number}
     */ this.radius = radius;
        /**
     * The x coordinate of the circle.
     *
     * @type {number}
     */ this.x = x;
        /**
     * The y coordinate of the circle.
     *
     * @type {number}
     */ this.y = y;
    }
    /**
   * Determines if a point is inside the circle.
   *
   * @param {module:shared.Point2D} point - The point to test.
   *
   * @return {boolean} true if the point is inside the circle, false
   * otherwise.
   */ contains(point) {
        const distance = Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));
        return distance <= this.radius;
    }
}
$d8db4388a2194527$exports = $d8db4388a2194527$var$Circle;


/**
 * This object stores a set of core constants for use by both the client and
 *  the server.
 *
 * @memberof module:shared
 * @enum {number}
 */ const $f7c9fda677014379$var$constants = {
    // General constants
    ROTATE_0: 0,
    ROTATE_90: Math.PI / 2,
    ROTATE_180: Math.PI,
    ROTATE_270: Math.PI * 1.5,
    ROTATE_360: Math.PI * 2,
    // Namespaces
    /** @type {string} */ NS_WAMS: "/wams",
    NS_WAMS_TRACKING: "/"
};
/**
 * A list of colours, for use by the API for shadows, and by end-point apps too
 * if desired.
 *
 * @memberof module:shared
 * @type {string[]}
 */ const $f7c9fda677014379$var$colours = [
    "saddlebrown",
    "red",
    "blue",
    "lime",
    "darkorange",
    "purple",
    "yellow",
    "aqua",
    "darkgreen",
    "fuchsia", 
];
/*
 * Package up the module and freeze it for delivery.
 */ $f7c9fda677014379$exports = Object.freeze({
    colours: $f7c9fda677014379$var$colours,
    constants: $f7c9fda677014379$var$constants,
    Circle: $d8db4388a2194527$exports,
    IdStamper: $790ae0c709639dfd$exports,
    Message: $c824f763a1f6c4dc$exports,
    Point2D: $9f5d312980c8548e$exports,
    Polygon2D: $ec846c706b0069ec$exports,
    Rectangle: $f7a0e19f0797a511$exports,
    ...$a40a9c66ba14e077$exports,
    ...$ecff7108faed7dc7$exports
});


var $e307541a347955a1$require$constants = $f7c9fda677014379$exports.constants;
var $e307541a347955a1$require$DataReporter = $f7c9fda677014379$exports.DataReporter;
var $e307541a347955a1$require$PointerReporter = $f7c9fda677014379$exports.PointerReporter;
var $e307541a347955a1$require$IdStamper = $f7c9fda677014379$exports.IdStamper;
var $e307541a347955a1$require$Message = $f7c9fda677014379$exports.Message;
var $e307541a347955a1$require$NOP = $f7c9fda677014379$exports.NOP;
var $dc7157263e8aa14f$exports = {};
"use strict";
var $b10ccf2aea321661$exports = {};
/**
 * The API interface for Westures. Defines a number of gestures on top of the
 * engine provided by {@link
 * https://mvanderkamp.github.io/westures-core/index.html|westures-core}.
 *
 * @namespace westures
 */ "use strict";
/**
 * The global API interface for westures-core. Exposes all classes, constants,
 * and routines used by the package. Use responsibly.
 *
 * @namespace westures-core
 */ "use strict";
"use strict";
"use strict";
"use strict";
"use strict";
"use strict";
"use strict";
"use strict";
"use strict";
"use strict";
/*
 * Contains the Pan class.
 */ "use strict";
/*
 * Contains the abstract Pinch class.
 */ "use strict";
/*
 * Contains the Press class.
 */ "use strict";
/*
 * Contains the abstract Pull class.
 */ "use strict";
/*
 * Contains the Rotate class.
 */ "use strict";
/*
 * Contains the Rotate class.
 */ "use strict";
/*
 * Contains the Swipe class.
 */ "use strict";
/*
 * Contains the Rotate class.
 */ "use strict";
/*
 * Contains the Tap class.
 */ "use strict";
/*
 * Contains the Track class.
 */ "use strict";
var $b10ccf2aea321661$var$$17807945cdde5d67$exports = {};
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$de0d6a332419bf3c$exports = {};
let $b10ccf2aea321661$var$$17807945cdde5d67$var$$de0d6a332419bf3c$var$g_id = 0;
/**
 * The Gesture class that all gestures inherit from. A custom gesture class will
 * need to override some or all of the four phase "hooks": start, move, end, and
 * cancel.
 *
 * @memberof westures-core
 *
 * @param {string} type - The name of the gesture.
 * @param {Element} element - The element to which to associate the gesture.
 * @param {Function} handler - The function handler to execute when a gesture
 *    is recognized on the associated element.
 * @param {object} [options] - Generic gesture options
 * @param {westures-core.STATE_KEYS[]} [options.enableKeys=[]] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.STATE_KEYS[]} [options.disableKeys=[]] - List of keys
 * which will disable the gesture. The gesture will not be recognized if one of
 * these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the disable key is never down.
 * @param {number} [options.minInputs=1] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs=Number.MAX_VALUE] - The maximum number of
 * pointers that may be active for the gesture to be recognized. Uses <=.
 */ class $b10ccf2aea321661$var$$17807945cdde5d67$var$$de0d6a332419bf3c$var$Gesture {
    constructor(type, element, handler, options = {}){
        if (typeof type !== "string") throw new TypeError("Gestures require a string type / name");
        /**
     * The name of the gesture. (e.g. 'pan' or 'tap' or 'pinch').
     *
     * @type {string}
     */ this.type = type;
        /**
     * The unique identifier for each gesture. This allows for distinctions
     * across instances of Gestures that are created on the fly (e.g.
     * gesture-tap-1, gesture-tap-2).
     *
     * @type {string}
     */ this.id = `gesture-${this.type}-${$b10ccf2aea321661$var$$17807945cdde5d67$var$$de0d6a332419bf3c$var$g_id++}`;
        /**
     * The element to which to associate the gesture.
     *
     * @type {Element}
     */ this.element = element;
        /**
     * The function handler to execute when the gesture is recognized on the
     * associated element.
     *
     * @type {Function}
     */ this.handler = handler;
        /**
     * The options. Can usually be adjusted live, though be careful doing this.
     *
     * @type {object}
     */ this.options = {
            ...$b10ccf2aea321661$var$$17807945cdde5d67$var$$de0d6a332419bf3c$var$Gesture.DEFAULTS,
            ...options
        };
    }
    /**
   * Determines whether this gesture is enabled.
   *
   * @param {westures-core.State} state - The input state object of the current
   * region.
   *
   * @return {boolean} true if enabled, false otherwise.
   */ isEnabled(state) {
        const count = state.active.length;
        const event = state.event;
        const { enableKeys: enableKeys , disableKeys: disableKeys , minInputs: minInputs , maxInputs: maxInputs  } = this.options;
        return minInputs <= count && maxInputs >= count && (enableKeys.length === 0 || enableKeys.some((k)=>event[k])) && !disableKeys.some((k)=>event[k]);
    }
    /**
   * Event hook for the start phase of a gesture.
   *
   * @param {westures-core.State} state - The input state object of the current
   * region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */ start() {
        return null;
    }
    /**
   * Event hook for the move phase of a gesture.
   *
   * @param {westures-core.State} state - The input state object of the current
   * region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */ move() {
        return null;
    }
    /**
   * Event hook for the end phase of a gesture.
   *
   * @param {westures-core.State} state - The input state object of the current
   * region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */ end() {
        return null;
    }
    /**
   * Event hook for when an input is cancelled.
   *
   * @param {westures-core.State} state - The input state object of the current
   * region.
   *
   * @return {?Object} Gesture is considered recognized if an Object is
   *    returned.
   */ cancel() {
        return null;
    }
    /**
   * Evalutes the given gesture hook, and dispatches any data that is produced
   * by calling [recognize]{@link westures-core.Gesture#recognize}.
   *
   * @param {string} hook - Must be one of 'start', 'move', 'end', or 'cancel'.
   * @param {westures-core.State} state - The current State instance.
   */ evaluateHook(hook, state) {
        const data = this[hook](state);
        if (data) this.recognize(hook, state, data);
    }
    /**
   * Recognize a Gesture by calling the handler. Standardizes the way the
   * handler is called so that classes extending Gesture can circumvent the
   * evaluateHook approach but still provide results that have a common format.
   *
   * Note that the properties in the "data" object will receive priority when
   * constructing the results. This can be used to override standard results
   * such as the phase or the centroid.
   *
   * @param {string} hook - Must be one of 'start', 'move', 'end', or 'cancel'.
   * @param {westures-core.State} state - current input state.
   * @param {Object} data - Results data specific to the recognized gesture.
   */ recognize(hook, state, data) {
        this.handler({
            centroid: state.centroid,
            event: state.event,
            phase: hook,
            type: this.type,
            target: this.element,
            ...data
        });
    }
}
$b10ccf2aea321661$var$$17807945cdde5d67$var$$de0d6a332419bf3c$var$Gesture.DEFAULTS = {
    enableKeys: [],
    disableKeys: [],
    minInputs: 1,
    maxInputs: Number.MAX_VALUE
};
$b10ccf2aea321661$var$$17807945cdde5d67$var$$de0d6a332419bf3c$exports = $b10ccf2aea321661$var$$17807945cdde5d67$var$$de0d6a332419bf3c$var$Gesture;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$e2125e2e71e37a0c$exports = {};
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$0ca7bfe1c074e8ca$exports = {};
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$6c3676f10a43b740$exports = {};
/**
 * The Point2D class stores and operates on 2-dimensional points, represented as
 * x and y coordinates.
 *
 * @memberof westures-core
 *
 * @param {number} [ x=0 ] - The x coordinate of the point.
 * @param {number} [ y=0 ] - The y coordinate of the point.
 */ class $b10ccf2aea321661$var$$17807945cdde5d67$var$$6c3676f10a43b740$var$Point2D {
    constructor(x = 0, y = 0){
        /**
     * The x coordinate of the point.
     *
     * @type {number}
     */ this.x = x;
        /**
     * The y coordinate of the point.
     *
     * @type {number}
     */ this.y = y;
    }
    /**
   * Calculates the angle between this point and the given point.
   *
   * @param {!westures-core.Point2D} point - Projected point for calculating the
   * angle.
   *
   * @return {number} Radians along the unit circle where the projected
   * point lies.
   */ angleTo(point) {
        return Math.atan2(point.y - this.y, point.x - this.x);
    }
    /**
   * Determine the angle from the centroid to each of the points.
   *
   * @param {!westures-core.Point2D[]} points - the Point2D objects to calculate
   *    the angles to.
   *
   * @returns {number[]}
   */ anglesTo(points) {
        return points.map((point)=>this.angleTo(point));
    }
    /**
   * Determine the average distance from this point to the provided array of
   * points.
   *
   * @param {!westures-core.Point2D[]} points - the Point2D objects to calculate
   *    the average distance to.
   *
   * @return {number} The average distance from this point to the provided
   *    points.
   */ averageDistanceTo(points) {
        return this.totalDistanceTo(points) / points.length;
    }
    /**
   * Clone this point.
   *
   * @return {westures-core.Point2D} A new Point2D, identical to this point.
   */ clone() {
        return new $b10ccf2aea321661$var$$17807945cdde5d67$var$$6c3676f10a43b740$var$Point2D(this.x, this.y);
    }
    /**
   * Calculates the distance between two points.
   *
   * @param {!westures-core.Point2D} point - Point to which the distance is
   * calculated.
   *
   * @return {number} The distance between the two points, a.k.a. the
   *    hypoteneuse.
   */ distanceTo(point) {
        return Math.hypot(point.x - this.x, point.y - this.y);
    }
    /**
   * Subtract the given point from this point.
   *
   * @param {!westures-core.Point2D} point - Point to subtract from this point.
   *
   * @return {westures-core.Point2D} A new Point2D, which is the result of (this
   * - point).
   */ minus(point) {
        return new $b10ccf2aea321661$var$$17807945cdde5d67$var$$6c3676f10a43b740$var$Point2D(this.x - point.x, this.y - point.y);
    }
    /**
   * Return the summation of this point to the given point.
   *
   * @param {!westures-core.Point2D} point - Point to add to this point.
   *
   * @return {westures-core.Point2D} A new Point2D, which is the addition of the
   * two points.
   */ plus(point) {
        return new $b10ccf2aea321661$var$$17807945cdde5d67$var$$6c3676f10a43b740$var$Point2D(this.x + point.x, this.y + point.y);
    }
    /**
   * Calculates the total distance from this point to an array of points.
   *
   * @param {!westures-core.Point2D[]} points - The array of Point2D objects to
   *    calculate the total distance to.
   *
   * @return {number} The total distance from this point to the provided points.
   */ totalDistanceTo(points) {
        return points.reduce((d, p)=>d + this.distanceTo(p), 0);
    }
    /**
   * Calculates the centroid of a list of points.
   *
   * @param {westures-core.Point2D[]} points - The array of Point2D objects for
   * which to calculate the centroid.
   *
   * @return {westures-core.Point2D} The centroid of the provided points.
   */ static centroid(points = []) {
        if (points.length === 0) return null;
        const total = $b10ccf2aea321661$var$$17807945cdde5d67$var$$6c3676f10a43b740$var$Point2D.sum(points);
        total.x /= points.length;
        total.y /= points.length;
        return total;
    }
    /**
   * Calculates the sum of the given points.
   *
   * @param {westures-core.Point2D[]} points - The Point2D objects to sum up.
   *
   * @return {westures-core.Point2D} A new Point2D representing the sum of the
   * given points.
   */ static sum(points = []) {
        return points.reduce((total, pt)=>{
            total.x += pt.x;
            total.y += pt.y;
            return total;
        }, new $b10ccf2aea321661$var$$17807945cdde5d67$var$$6c3676f10a43b740$var$Point2D(0, 0));
    }
}
$b10ccf2aea321661$var$$17807945cdde5d67$var$$6c3676f10a43b740$exports = $b10ccf2aea321661$var$$17807945cdde5d67$var$$6c3676f10a43b740$var$Point2D;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports = {};
/**
 * List of events that trigger the cancel phase.
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$CANCEL_EVENTS = [
    "blur",
    "pointercancel",
    "touchcancel",
    "mouseleave", 
];
/**
 * List of keyboard events that trigger a restart.
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$KEYBOARD_EVENTS = [
    "keydown",
    "keyup", 
];
/**
 * List of mouse events to listen to.
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$MOUSE_EVENTS = [
    "mousedown",
    "mousemove",
    "mouseup", 
];
/**
 * List of pointer events to listen to.
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$POINTER_EVENTS = [
    "pointerdown",
    "pointermove",
    "pointerup", 
];
/**
 * List of touch events to listen to.
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$TOUCH_EVENTS = [
    "touchend",
    "touchmove",
    "touchstart", 
];
/**
 * List of potentially state-modifying keys.
 * Entries are: ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$STATE_KEYS = [
    "altKey",
    "ctrlKey",
    "metaKey",
    "shiftKey", 
];
/**
 * List of the 'key' values on KeyboardEvent objects of the potentially
 * state-modifying keys.
 *
 * @memberof westures-core
 * @type {string[]}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$STATE_KEY_STRINGS = [
    "Alt",
    "Control",
    "Meta",
    "Shift", 
];
/**
 * The cancel phase.
 *
 * @memberof westures-core
 * @type {string}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$CANCEL = "cancel";
/**
 * The end phase.
 *
 * @memberof westures-core
 * @type {string}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$END = "end";
/**
 * The move phase.
 *
 * @memberof westures-core
 * @type {string}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$MOVE = "move";
/**
 * The start phase.
 *
 * @memberof westures-core
 * @type {string}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$START = "start";
/**
 * The recognized phases.
 *
 * @memberof westures-core
 * @type {list.<string>}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$PHASES = [
    $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$START,
    $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$MOVE,
    $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$END,
    $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$CANCEL
];
/**
 * Object that normalizes the names of window events to be either of type start,
 * move, end, or cancel.
 *
 * @memberof westures-core
 * @type {object}
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$PHASE = {
    blur: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$CANCEL,
    pointercancel: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$CANCEL,
    touchcancel: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$CANCEL,
    mouseup: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$END,
    pointerup: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$END,
    touchend: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$END,
    mousemove: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$MOVE,
    pointermove: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$MOVE,
    touchmove: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$MOVE,
    mousedown: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$START,
    pointerdown: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$START,
    touchstart: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$START
};
$b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports = {
    CANCEL_EVENTS: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$CANCEL_EVENTS,
    KEYBOARD_EVENTS: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$KEYBOARD_EVENTS,
    MOUSE_EVENTS: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$MOUSE_EVENTS,
    POINTER_EVENTS: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$POINTER_EVENTS,
    TOUCH_EVENTS: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$TOUCH_EVENTS,
    STATE_KEYS: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$STATE_KEYS,
    STATE_KEY_STRINGS: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$STATE_KEY_STRINGS,
    CANCEL: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$CANCEL,
    END: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$END,
    MOVE: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$MOVE,
    START: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$START,
    PHASE: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$PHASE,
    PHASES: $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$var$PHASES
};
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$0ca7bfe1c074e8ca$require$PHASE = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.PHASE;
/**
 * @private
 * @inner
 * @memberof westures-core.PointerData
 *
 * @return {Event} The Event object which corresponds to the given identifier.
 *    Contains clientX, clientY values.
 */ function $b10ccf2aea321661$var$$17807945cdde5d67$var$$0ca7bfe1c074e8ca$var$getEventObject(event, identifier) {
    if (event.changedTouches) return Array.from(event.changedTouches).find((touch)=>{
        return touch.identifier === identifier;
    });
    return event;
}
/**
 * Low-level storage of pointer data based on incoming data from an interaction
 * event.
 *
 * @memberof westures-core
 *
 * @param {Event} event - The event object being wrapped.
 * @param {number} identifier - The index of touch if applicable
 */ class $b10ccf2aea321661$var$$17807945cdde5d67$var$$0ca7bfe1c074e8ca$var$PointerData {
    constructor(event, identifier){
        const { clientX: clientX , clientY: clientY  } = $b10ccf2aea321661$var$$17807945cdde5d67$var$$0ca7bfe1c074e8ca$var$getEventObject(event, identifier);
        /**
     * The original event object.
     *
     * @type {Event}
     */ this.event = event;
        /**
     * The type or 'phase' of this batch of pointer data. 'start' or 'move' or
     * 'end' or 'cancel'
     *
     * @type {string}
     */ this.type = $b10ccf2aea321661$var$$17807945cdde5d67$var$$0ca7bfe1c074e8ca$require$PHASE[event.type];
        /**
     * The timestamp of the event in milliseconds elapsed since January 1, 1970,
     * 00:00:00 UTC.
     *
     * @type {number}
     */ this.time = Date.now();
        /**
     * The (x,y) coordinate of the event, wrapped in a Point2D.
     *
     * @type {westures-core.Point2D}
     */ this.point = new $b10ccf2aea321661$var$$17807945cdde5d67$var$$6c3676f10a43b740$exports(clientX, clientY);
    }
}
$b10ccf2aea321661$var$$17807945cdde5d67$var$$0ca7bfe1c074e8ca$exports = $b10ccf2aea321661$var$$17807945cdde5d67$var$$0ca7bfe1c074e8ca$var$PointerData;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$exports = {};
const $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$PI_2 = 2 * Math.PI;
const $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$PI_NVE = -Math.PI;
/**
 * Helper function to regulate angular differences, so they don't jump from 0 to
 * 2 * PI or vice versa.
 *
 * @memberof westures-core
 *
 * @param {number} a - Angle in radians.
 * @param {number} b - Angle in radians.

 * @return {number} c, given by: c = a - b such that |c| < PI
 */ function $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$angularDifference(a, b) {
    let diff = a - b;
    if (diff < $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$PI_NVE) diff += $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$PI_2;
    else if (diff > Math.PI) diff -= $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$PI_2;
    return diff;
}
/**
 * In case event.composedPath() is not available.
 *
 * @memberof westures-core
 *
 * @param {Event} event
 *
 * @return {Element[]} The elements along the composed path of the event.
 */ function $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$getPropagationPath(event) {
    if (typeof event.composedPath === "function") return event.composedPath();
    const path = [];
    for(let node = event.target; node !== document; node = node.parentNode)path.push(node);
    path.push(document);
    path.push(window);
    return path;
}
/**
 * Performs a set filter operation.
 *
 * @memberof westures-core
 *
 * @param {Set} set - The set to filter.
 * @param {Function} predicate - Function to test elements of 'set'. Receives
 * one argument: the current set element.
 *
 * @return {Set} Set consisting of elements in 'set' for which 'predicate' is
 * true.
 */ function $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$setFilter(set, predicate) {
    const result = new Set();
    set.forEach((element)=>{
        if (predicate(element)) result.add(element);
    });
    return result;
}
/**
 * Performs a set difference operation.
 *
 * @memberof westures-core
 *
 * @param {Set} left - Base set.
 * @param {Set} right - Set of elements to remove from 'left'.
 *
 * @return {Set} Set consisting of elements in 'left' that are not in
 * 'right'.
 */ function $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$setDifference(left, right) {
    return $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$setFilter(left, (element)=>!right.has(element));
}
$b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$exports = {
    angularDifference: $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$angularDifference,
    getPropagationPath: $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$getPropagationPath,
    setDifference: $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$setDifference,
    setFilter: $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$var$setFilter
};
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$e2125e2e71e37a0c$require$getPropagationPath = $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$exports.getPropagationPath;
/**
 * Tracks a single input and contains information about the current, previous,
 * and initial events.
 *
 * @memberof westures-core
 *
 * @param {(PointerEvent | MouseEvent | TouchEvent)} event - The input event
 * which will initialize this Input object.
 * @param {number} identifier - The identifier for this input, so that it can
 * be located in subsequent Event objects.
 */ class $b10ccf2aea321661$var$$17807945cdde5d67$var$$e2125e2e71e37a0c$var$Input {
    constructor(event, identifier){
        const currentData = new $b10ccf2aea321661$var$$17807945cdde5d67$var$$0ca7bfe1c074e8ca$exports(event, identifier);
        /**
     * The set of elements along the original event's propagation path at the
     * time it was dispatched.
     *
     * @type {WeakSet.<Element>}
     */ this.initialElements = new WeakSet($b10ccf2aea321661$var$$17807945cdde5d67$var$$e2125e2e71e37a0c$require$getPropagationPath(event));
        /**
     * Holds the initial data from the mousedown / touchstart / pointerdown that
     * began this input.
     *
     * @type {westures-core.PointerData}
     */ this.initial = currentData;
        /**
     * Holds the most current pointer data for this Input.
     *
     * @type {westures-core.PointerData}
     */ this.current = currentData;
        /**
     * Holds the previous pointer data for this Input.
     *
     * @type {westures-core.PointerData}
     */ this.previous = currentData;
        /**
     * The identifier for the pointer / touch / mouse button associated with
     * this input.
     *
     * @type {number}
     */ this.identifier = identifier;
    }
    /**
   * The phase of the input: 'start' or 'move' or 'end' or 'cancel'
   *
   * @type {string}
   */ get phase() {
        return this.current.type;
    }
    /**
   * The timestamp of the initiating event for this input.
   *
   * @type {number}
   */ get startTime() {
        return this.initial.time;
    }
    /**
   * The amount of time elapsed between the start of this input and its latest
   * event.
   *
   * @type {number}
   */ get elapsedTime() {
        return this.current.time - this.initial.time;
    }
    /**
   * @return {number} The distance between the initiating event for this input
   *    and its current event.
   */ totalDistance() {
        return this.initial.point.distanceTo(this.current.point);
    }
    /**
   * Saves the given raw event in PointerData form as the current data for this
   * input, pushing the old current data into the previous slot, and tossing
   * out the old previous data.
   *
   * @param {Event} event - The event object to wrap with a PointerData.
   */ update(event) {
        this.previous = this.current;
        this.current = new $b10ccf2aea321661$var$$17807945cdde5d67$var$$0ca7bfe1c074e8ca$exports(event, this.identifier);
    }
}
$b10ccf2aea321661$var$$17807945cdde5d67$var$$e2125e2e71e37a0c$exports = $b10ccf2aea321661$var$$17807945cdde5d67$var$$e2125e2e71e37a0c$var$Input;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$exports = {};
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$exports = {};
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$require$CANCEL = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.CANCEL;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$require$END = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.END;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$require$MOVE = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.MOVE;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$require$PHASE = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.PHASE;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$require$START = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.START;
const $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$symbols = {
    inputs: Symbol.for("inputs")
};
/**
 * Set of helper functions for updating inputs based on type of input.
 * Must be called with a bound 'this', via bind(), or call(), or apply().
 *
 * @private
 * @inner
 * @memberof westure-core.State
 */ const $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$update_fns = {
    TouchEvent: function TouchEvent(event) {
        Array.from(event.changedTouches).forEach((touch)=>{
            this.updateInput(event, touch.identifier);
        });
    },
    PointerEvent: function PointerEvent(event) {
        this.updateInput(event, event.pointerId);
    },
    MouseEvent: function MouseEvent(event) {
        if (event.button === 0) this.updateInput(event, event.button);
    }
};
/**
 * Keeps track of currently active and ending input points on the interactive
 * surface.
 *
 * @memberof westures-core
 *
 * @param {Element} element - The element underpinning the associated Region.
 */ class $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$State {
    constructor(element){
        /**
     * Keep a reference to the element for the associated region.
     *
     * @type {Element}
     */ this.element = element;
        /**
     * Keeps track of the current Input objects.
     *
     * @alias [@@inputs]
     * @type {Map.<westures-core.Input>}
     * @memberof westure-core.State
     */ this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$symbols.inputs] = new Map();
        /**
     * All currently valid inputs, including those that have ended.
     *
     * @type {westures-core.Input[]}
     */ this.inputs = [];
        /**
     * The array of currently active inputs, sourced from the current Input
     * objects. "Active" is defined as not being in the 'end' phase.
     *
     * @type {westures-core.Input[]}
     */ this.active = [];
        /**
     * The array of latest point data for the currently active inputs, sourced
     * from this.active.
     *
     * @type {westures-core.Point2D[]}
     */ this.activePoints = [];
        /**
     * The centroid of the currently active points.
     *
     * @type {westures-core.Point2D}
     */ this.centroid = {};
        /**
     * The latest event that the state processed.
     *
     * @type {Event}
     */ this.event = null;
    }
    /**
   * Deletes all inputs that are in the 'end' phase.
   */ clearEndedInputs() {
        this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$symbols.inputs].forEach((v, k)=>{
            if (v.phase === "end") this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$symbols.inputs].delete(k);
        });
    }
    /**
   * @param {string} phase - One of 'start', 'move', 'end', or 'cancel'.
   *
   * @return {westures-core.Input[]} Inputs in the given phase.
   */ getInputsInPhase(phase) {
        return this.inputs.filter((i)=>i.phase === phase);
    }
    /**
   * @param {string} phase - One of 'start', 'move', 'end', or 'cancel'.
   *
   * @return {westures-core.Input[]} Inputs <b>not</b> in the given phase.
   */ getInputsNotInPhase(phase) {
        return this.inputs.filter((i)=>i.phase !== phase);
    }
    /**
   * @return {boolean} True if there are no active inputs. False otherwise.
   */ hasNoInputs() {
        return this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$symbols.inputs].size === 0;
    }
    /**
   * Update the input with the given identifier using the given event.
   *
   * @private
   *
   * @param {Event} event - The event being captured.
   * @param {number} identifier - The identifier of the input to update.
   */ updateInput(event, identifier) {
        switch($b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$require$PHASE[event.type]){
            case $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$require$START:
                this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$symbols.inputs].set(identifier, new $b10ccf2aea321661$var$$17807945cdde5d67$var$$e2125e2e71e37a0c$exports(event, identifier));
                try {
                    this.element.setPointerCapture(identifier);
                } catch (e) {
                // NOP: Optional operation failed.
                }
                break;
            // All of 'end', 'move', and 'cancel' perform updates, hence the
            // following fall-throughs
            case $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$require$END:
                try {
                    this.element.releasePointerCapture(identifier);
                } catch (e1) {
                // NOP: Optional operation failed.
                }
            case $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$require$CANCEL:
            case $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$require$MOVE:
                if (this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$symbols.inputs].has(identifier)) this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$symbols.inputs].get(identifier).update(event);
                break;
            default:
                console.warn(`Unrecognized event type: ${event.type}`);
        }
    }
    /**
   * Updates the inputs with new information based upon a new event being fired.
   *
   * @private
   * @param {Event} event - The event being captured.
   */ updateAllInputs(event) {
        $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$update_fns[event.constructor.name].call(this, event);
        this.updateFields(event);
    }
    /**
   * Updates the convenience fields.
   *
   * @private
   * @param {Event} event - Event with which to update the convenience fields.
   */ updateFields(event) {
        this.inputs = Array.from(this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$symbols.inputs].values());
        this.active = this.getInputsNotInPhase("end");
        this.activePoints = this.active.map((i)=>i.current.point);
        this.centroid = $b10ccf2aea321661$var$$17807945cdde5d67$var$$6c3676f10a43b740$exports.centroid(this.activePoints);
        this.event = event;
    }
}
$b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$exports = $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$var$State;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$CANCEL_EVENTS = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.CANCEL_EVENTS;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$KEYBOARD_EVENTS = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.KEYBOARD_EVENTS;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$MOUSE_EVENTS = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.MOUSE_EVENTS;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$POINTER_EVENTS = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.POINTER_EVENTS;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$TOUCH_EVENTS = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.TOUCH_EVENTS;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$STATE_KEY_STRINGS = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.STATE_KEY_STRINGS;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$PHASE = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.PHASE;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$CANCEL = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.CANCEL;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$END = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.END;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$START = $b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports.START;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$setDifference = $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$exports.setDifference;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$setFilter = $b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$exports.setFilter;
/**
 * Allows the user to specify the control region which will listen for user
 * input events.
 *
 * @memberof westures-core
 *
 * @param {Element} element=window - The element which should listen to input
 * events.
 * @param {object} [options]
 * @param {boolean} [options.capture=false] - Whether the region uses the
 * capture phase of input events. If false, uses the bubbling phase.
 * @param {boolean} [options.preferPointer=true] - If false, the region listens
 * to mouse/touch events instead of pointer events.
 * @param {boolean} [options.preventDefault=true] - Whether the default
 * browser functionality should be disabled. This option should most likely be
 * ignored. Here there by dragons if set to false.
 * @param {string} [options.touchAction='none'] - Value to set the CSS
 * 'touch-action' property to on elements added to the region.
 */ class $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$var$Region {
    constructor(element = window, options = {}){
        options = {
            ...$b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$var$Region.DEFAULTS,
            ...options
        };
        /**
     * The list of relations between elements, their gestures, and the handlers.
     *
     * @type {Set.<westures-core.Gesture>}
     */ this.gestures = new Set();
        /**
     * The list of active gestures for the current input session.
     *
     * @type {Set.<westures-core.Gesture>}
     */ this.activeGestures = new Set();
        /**
     * The base list of potentially active gestures for the current input
     * session.
     *
     * @type {Set.<westures-core.Gesture>}
     */ this.potentialGestures = new Set();
        /**
     * The element being bound to.
     *
     * @type {Element}
     */ this.element = element;
        /**
     * The user-supplied options for the Region.
     *
     * @type {object}
     */ this.options = options;
        /**
     * The internal state object for a Region.  Keeps track of inputs.
     *
     * @type {westures-core.State}
     */ this.state = new $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$exports(this.element);
        // Begin operating immediately.
        this.activate();
    }
    /**
   * Activates the region by adding event listeners for all appropriate input
   * events to the region's element.
   *
   * @private
   */ activate() {
        /*
     * Listening to both mouse and touch comes with the difficulty that
     * preventDefault() must be called to prevent both events from iterating
     * through the system. However I have left it as an option to the end user,
     * which defaults to calling preventDefault(), in case there's a use-case I
     * haven't considered or am not aware of.
     *
     * It also may be a good idea to keep regions small in large pages.
     *
     * See:
     *  https://www.html5rocks.com/en/mobile/touchandmouse/
     *  https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
     *  https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
     */ let eventNames = [];
        if (this.options.preferPointer && window.PointerEvent) eventNames = $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$POINTER_EVENTS;
        else eventNames = $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$MOUSE_EVENTS.concat($b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$TOUCH_EVENTS);
        // Bind detected browser events to the region element.
        const arbitrate = this.arbitrate.bind(this);
        eventNames.forEach((eventName)=>{
            this.element.addEventListener(eventName, arbitrate, {
                capture: this.options.capture,
                once: false,
                passive: false
            });
        });
        const cancel = this.cancel.bind(this);
        $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$CANCEL_EVENTS.forEach((eventName)=>{
            window.addEventListener(eventName, cancel);
        });
        const handleKeyboardEvent = this.handleKeyboardEvent.bind(this);
        $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$KEYBOARD_EVENTS.forEach((eventName)=>{
            window.addEventListener(eventName, handleKeyboardEvent);
        });
    }
    /**
   * Handles a cancel event. Resets the state and the active / potential gesture
   * lists.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   */ cancel(event) {
        if (this.options.preventDefault) event.preventDefault();
        this.state.inputs.forEach((input)=>{
            input.update(event);
        });
        this.activeGestures.forEach((gesture)=>{
            gesture.evaluateHook($b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$CANCEL, this.state);
        });
        this.state = new $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$exports(this.element);
        this.resetActiveGestures();
    }
    /**
   * Handles a keyboard event, triggering a restart of any gestures that need
   * it.
   *
   * @private
   * @param {KeyboardEvent} event - The keyboard event.
   */ handleKeyboardEvent(event) {
        if ($b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$STATE_KEY_STRINGS.indexOf(event.key) >= 0) {
            this.state.event = event;
            const oldActiveGestures = this.activeGestures;
            this.setActiveGestures();
            $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$setDifference(oldActiveGestures, this.activeGestures).forEach((gesture)=>{
                gesture.evaluateHook($b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$END, this.state);
            });
            $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$setDifference(this.activeGestures, oldActiveGestures).forEach((gesture)=>{
                gesture.evaluateHook($b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$START, this.state);
            });
        }
    }
    /**
   * Resets the active gestures.
   *
   * @private
   */ resetActiveGestures() {
        this.potentialGestures = new Set();
        this.activeGestures = new Set();
    }
    /**
   * Selects active gestures from the list of potentially active gestures.
   *
   * @private
   */ setActiveGestures() {
        this.activeGestures = $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$setFilter(this.potentialGestures, (gesture)=>{
            return gesture.isEnabled(this.state);
        });
    }
    /**
   * Selects the potentially active gestures.
   *
   * @private
   */ setPotentialGestures() {
        const input = this.state.inputs[0];
        this.potentialGestures = $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$setFilter(this.gestures, (gesture)=>{
            return input.initialElements.has(gesture.element);
        });
    }
    /**
   * Selects the gestures that are active for the current input sequence.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   * @param {boolean} isInitial - Whether this is an initial contact.
   */ updateActiveGestures(event, isInitial) {
        if ($b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$PHASE[event.type] === $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$START) {
            if (isInitial) this.setPotentialGestures();
            this.setActiveGestures();
        }
    }
    /**
   * Evaluates whether the current input session has completed.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   */ pruneActiveGestures(event) {
        if ($b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$PHASE[event.type] === $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$END) {
            if (this.state.hasNoInputs()) this.resetActiveGestures();
            else this.setActiveGestures();
        }
    }
    /**
   * All input events flow through this function. It makes sure that the input
   * state is maintained, determines which gestures to analyze based on the
   * initial position of the inputs, calls the relevant gesture hooks, and
   * dispatches gesture data.
   *
   * @private
   * @param {Event} event - The event emitted from the window object.
   */ arbitrate(event) {
        const isInitial = this.state.hasNoInputs();
        this.state.updateAllInputs(event);
        this.updateActiveGestures(event, isInitial);
        if (this.activeGestures.size > 0) {
            if (this.options.preventDefault) event.preventDefault();
            this.activeGestures.forEach((gesture)=>{
                gesture.evaluateHook($b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$PHASE[event.type], this.state);
            });
        }
        this.state.clearEndedInputs();
        this.pruneActiveGestures(event);
    }
    /**
   * Adds the given gesture to the region.
   *
   * @param {westures-core.Gesture} gesture - Instantiated gesture to add.
   */ addGesture(gesture) {
        gesture.element.style.touchAction = this.options.touchAction;
        this.gestures.add(gesture);
    }
    /**
   * Removes the given gesture from the region.
   *
   * @param {westures-core.Gesture} gesture - Instantiated gesture to add.
   */ removeGesture(gesture) {
        this.gestures.delete(gesture);
        this.potentialGestures.delete(gesture);
        this.activeGestures.delete(gesture);
    }
    /**
   * Retrieves Gestures by their associated element.
   *
   * @param {Element} element - The element for which to find gestures.
   *
   * @return {westures-core.Gesture[]} Gestures to which the element is bound.
   */ getGesturesByElement(element) {
        return $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$require$setFilter(this.gestures, (gesture)=>gesture.element === element);
    }
    /**
   * Remove all gestures bound to the given element.
   *
   * @param {Element} element - The element to unbind.
   */ removeGesturesByElement(element) {
        this.getGesturesByElement(element).forEach((g)=>this.removeGesture(g));
    }
}
$b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$var$Region.DEFAULTS = {
    capture: false,
    preferPointer: true,
    preventDefault: true,
    touchAction: "none"
};
$b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$exports = $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$var$Region;
var $b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$exports = {};
const $b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$cascade = Symbol("cascade");
const $b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$smooth = Symbol("smooth");
/**
 * Determines whether to apply smoothing. Smoothing is on by default but turned
 * off if either:<br>
 *  1. The user explicitly requests that it be turned off.<br>
 *  2. The active pointer is not "coarse".<br>
 *
 * @see {@link
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia}
 *
 * @inner
 * @memberof westures-core.Smoothable
 *
 * @param {boolean} isRequested - Whether smoothing was requested by the user.
 *
 * @returns {boolean} Whether to apply smoothing.
 */ function $b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$smoothingIsApplicable(isRequested) {
    if (isRequested) try {
        return window.matchMedia("(pointer: coarse)").matches;
    } catch (e) {
        return true;
    }
    return false;
}
/**
 * A Smoothable datatype is one that is capable of smoothing out a series of
 * values as they come in, one at a time, providing a more consistent series. It
 * does this by creating some inertia in the values using a cascading average.
 * (For those who are interested in such things, this effectively means that it
 * provides a practical application of Zeno's Dichotomy).
 *
 * @example
 * const x = new Smoothable({ identity: 1 });
 * const a = x.next(1);   // 1.0
 * const b = x.next(1.2); // 1.1
 * const c = x.next(0.9); // 1.0
 * const d = x.next(0.6); // 0.8
 * const e = x.next(1.2); // 1.0
 * const f = x.next(1.6); // 1.3
 * x.restart();
 * const g = x.next(0);   // 0.5
 *
 * @memberof westures-core
 *
 * @param {Object} [options]
 * @param {boolean} [options.applySmoothing=true] Whether to apply smoothing to
 * the data.
 * @param {*} [options.identity=0] The identity value of this smoothable data.
 */ class $b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$Smoothable {
    constructor(options = {}){
        const final_options = {
            ...$b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$Smoothable.DEFAULTS,
            ...options
        };
        /**
     * The function through which smoothed emits are passed.
     *
     * @method
     * @param {*} data - The data to emit.
     *
     * @return {*} The smoothed out data.
     */ this.next = null;
        if ($b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$smoothingIsApplicable(final_options.applySmoothing)) this.next = this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$smooth].bind(this);
        else this.next = (data)=>data;
        /**
     * The "identity" value of the data that will be smoothed.
     *
     * @type {*}
     * @default 0
     */ this.identity = final_options.identity;
        /**
     * The cascading average of outgoing values.
     *
     * @memberof westures-core.Smoothable
     * @alias [@@cascade]
     * @type {object}
     */ this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$cascade] = this.identity;
    }
    /**
   * Restart the Smoothable gesture.
   */ restart() {
        this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$cascade] = this.identity;
    }
    /**
   * Smooth out the outgoing data.
   *
   * @memberof westures-core.Smoothable
   * @alias [@@smooth]
   * @param {object} data - The next batch of data to emit.
   *
   * @return {?object}
   */ [$b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$smooth](data) {
        const average = this.average(this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$cascade], data);
        this[$b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$cascade] = average;
        return average;
    }
    /**
   * Average out two values, as part of the smoothing algorithm. Override this
   * method if the data being smoothed is not a Number.
   *
   * @param {number} a
   * @param {number} b
   *
   * @return {number} The average of 'a' and 'b'
   */ average(a, b) {
        return (a + b) / 2;
    }
}
$b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$Smoothable.DEFAULTS = {
    applySmoothing: true,
    identity: 0
};
$b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$exports = $b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$var$Smoothable;
$b10ccf2aea321661$var$$17807945cdde5d67$exports = {
    Gesture: $b10ccf2aea321661$var$$17807945cdde5d67$var$$de0d6a332419bf3c$exports,
    Input: $b10ccf2aea321661$var$$17807945cdde5d67$var$$e2125e2e71e37a0c$exports,
    Point2D: $b10ccf2aea321661$var$$17807945cdde5d67$var$$6c3676f10a43b740$exports,
    PointerData: $b10ccf2aea321661$var$$17807945cdde5d67$var$$0ca7bfe1c074e8ca$exports,
    Region: $b10ccf2aea321661$var$$17807945cdde5d67$var$$b66a0f22c18e3e3d$exports,
    Smoothable: $b10ccf2aea321661$var$$17807945cdde5d67$var$$01c3d7b128023e4f$exports,
    State: $b10ccf2aea321661$var$$17807945cdde5d67$var$$639be6fb478a6d5a$exports,
    ...$b10ccf2aea321661$var$$17807945cdde5d67$var$$be6f0e84320366a7$exports,
    ...$b10ccf2aea321661$var$$17807945cdde5d67$var$$4559ecf940edc78d$exports
};
var $b10ccf2aea321661$var$$edded22326d64913$exports = {};
var $b10ccf2aea321661$var$$edded22326d64913$require$Gesture = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Gesture;
var $b10ccf2aea321661$var$$edded22326d64913$require$Point2D = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Point2D;
var $b10ccf2aea321661$var$$edded22326d64913$require$Smoothable = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Smoothable;
/**
 * Data returned when a Pan is recognized.
 *
 * @typedef {Object} PanData
 * @mixes ReturnTypes.BaseData
 *
 * @property {westures-core.Point2D} translation - The change vector from the
 * last emit.
 *
 * @memberof ReturnTypes
 */ /**
 * A Pan is defined as a normal movement in any direction.
 *
 * @extends westures-core.Gesture
 * @see {ReturnTypes.PanData}
 * @see {westures-core.Smoothable}
 * @memberof westures
 *
 * @param {Element} element - The element with which to associate the gesture.
 * @param {Function} handler - The function handler to execute when a gesture
 * is recognized on the associated element.
 * @param {object} [options] - Gesture customization options.
 * @param {westures-core.STATE_KEYS[]} [options.enableKeys=[]] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.STATE_KEYS[]} [options.disableKeys=[]] - List of keys
 * which will disable the gesture. The gesture will not be recognized if one of
 * these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the disable key is never down.
 * @param {number} [options.minInputs=1] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs=Number.MAX_VALUE] - The maximum number of
 * pointers that may be active for the gesture to be recognized. Uses <=.
 * @param {boolean} [options.applySmoothing=true] - Whether to apply inertial
 * smoothing for systems with coarse pointers.
 */ class $b10ccf2aea321661$var$$edded22326d64913$var$Pan extends $b10ccf2aea321661$var$$edded22326d64913$require$Gesture {
    constructor(element, handler, options = {}){
        super("pan", element, handler, options);
        /**
     * The previous point location.
     *
     * @type {westures-core.Point2D}
     */ this.previous = null;
        /*
     * The outgoing data, with optional inertial smoothing.
     *
     * @override
     * @type {westures-core.Smoothable<westures-core.Point2D>}
     */ this.outgoing = new $b10ccf2aea321661$var$$edded22326d64913$require$Smoothable({
            ...options,
            identity: new $b10ccf2aea321661$var$$edded22326d64913$require$Point2D()
        });
        this.outgoing.average = (a, b)=>$b10ccf2aea321661$var$$edded22326d64913$require$Point2D.centroid([
                a,
                b
            ]);
    }
    /**
   * Resets the gesture's progress by saving the current centroid of the active
   * inputs. To be called whenever the number of inputs changes.
   *
   * @param {State} state
   */ restart(state) {
        this.previous = state.centroid;
        this.outgoing.restart();
    }
    start(state) {
        this.restart(state);
    }
    move(state) {
        const translation = state.centroid.minus(this.previous);
        this.previous = state.centroid;
        return {
            translation: this.outgoing.next(translation)
        };
    }
    end(state) {
        this.restart(state);
    }
    cancel(state) {
        this.restart(state);
    }
}
$b10ccf2aea321661$var$$edded22326d64913$exports = $b10ccf2aea321661$var$$edded22326d64913$var$Pan;
var $b10ccf2aea321661$var$$a29eb49c9650e38a$exports = {};
var $b10ccf2aea321661$var$$a29eb49c9650e38a$require$Gesture = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Gesture;
var $b10ccf2aea321661$var$$a29eb49c9650e38a$require$Smoothable = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Smoothable;
/**
 * Data returned when a Pinch is recognized.
 *
 * @typedef {Object} PinchData
 * @mixes ReturnTypes.BaseData
 *
 * @property {number} distance - The average distance from an active input to
 *    the centroid.
 * @property {number} scale - The proportional change in distance since last
 * emit.
 *
 * @memberof ReturnTypes
 */ /**
 * A Pinch is defined as two or more inputs moving either together or apart.
 *
 * @extends westures-core.Gesture
 * @see {ReturnTypes.PinchData}
 * @memberof westures
 *
 * @param {Element} element - The element to which to associate the gesture.
 * @param {Function} handler - The function handler to execute when a gesture
 * is recognized on the associated element.
 * @param {object} [options] - Gesture customization options.
 * @param {westures-core.STATE_KEYS[]} [options.enableKeys=[]] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.STATE_KEYS[]} [options.disableKeys=[]] - List of keys
 * which will disable the gesture. The gesture will not be recognized if one of
 * these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the disable key is never down.
 * @param {number} [options.minInputs=2] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs=Number.MAX_VALUE] - The maximum number of
 * pointers that may be active for the gesture to be recognized. Uses <=.
 * @param {boolean} [options.applySmoothing=true] - Whether to apply inertial
 * smoothing for systems with coarse pointers.
 */ class $b10ccf2aea321661$var$$a29eb49c9650e38a$var$Pinch extends $b10ccf2aea321661$var$$a29eb49c9650e38a$require$Gesture {
    constructor(element, handler, options = {}){
        options = {
            ...$b10ccf2aea321661$var$$a29eb49c9650e38a$var$Pinch.DEFAULTS,
            ...options
        };
        super("pinch", element, handler, options);
        /**
     * The previous distance.
     *
     * @type {number}
     */ this.previous = 0;
        /*
     * The outgoing data, with optional inertial smoothing.
     *
     * @override
     * @type {westures-core.Smoothable<number>}
     */ this.outgoing = new $b10ccf2aea321661$var$$a29eb49c9650e38a$require$Smoothable({
            ...options,
            identity: 1
        });
    }
    /**
   * Initializes the gesture progress.
   *
   * @param {State} state - current input state.
   */ restart(state) {
        this.previous = state.centroid.averageDistanceTo(state.activePoints);
        this.outgoing.restart();
    }
    start(state) {
        this.restart(state);
    }
    move(state) {
        const distance = state.centroid.averageDistanceTo(state.activePoints);
        const scale = distance / this.previous;
        this.previous = distance;
        return {
            distance: distance,
            scale: this.outgoing.next(scale)
        };
    }
    end(state) {
        this.restart(state);
    }
    cancel(state) {
        this.restart(state);
    }
}
$b10ccf2aea321661$var$$a29eb49c9650e38a$var$Pinch.DEFAULTS = Object.freeze({
    minInputs: 2
});
$b10ccf2aea321661$var$$a29eb49c9650e38a$exports = $b10ccf2aea321661$var$$a29eb49c9650e38a$var$Pinch;
var $b10ccf2aea321661$var$$044241a6e313bbcb$exports = {};
var $b10ccf2aea321661$var$$044241a6e313bbcb$require$Gesture = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Gesture;
var $b10ccf2aea321661$var$$044241a6e313bbcb$require$Point2D = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Point2D;
var $b10ccf2aea321661$var$$044241a6e313bbcb$require$MOVE = $b10ccf2aea321661$var$$17807945cdde5d67$exports.MOVE;
/**
 * Data returned when a Press is recognized.
 *
 * @typedef {Object} PressData
 *
 * @property {westures-core.Point2D} centroid - The current centroid of the
 * input points.
 * @property {westures-core.Point2D} initial - The initial centroid of the input
 * points.
 * @property {number} distance - The total movement since initial contact.
 *
 * @memberof ReturnTypes
 */ /**
 * A Press is defined as one or more input points being held down without
 * moving. Press gestures may be stacked by pressing with additional pointers
 * beyond the minimum, so long as none of the points move or are lifted, a Press
 * will be recognized for each additional pointer.
 *
 * @extends westures-core.Gesture
 * @see {ReturnTypes.PressData}
 * @memberof westures
 *
 * @param {Element} element - The element to which to associate the gesture.
 * @param {Function} handler - The function handler to execute when a gesture
 * is recognized on the associated element.
 * @param {object} [options] - Gesture customization options.
 * @param {westures-core.STATE_KEYS[]} [options.enableKeys=[]] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.STATE_KEYS[]} [options.disableKeys=[]] - List of keys
 * which will disable the gesture. The gesture will not be recognized if one of
 * these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the disable key is never down.
 * @param {number} [options.minInputs=1] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs=Number.MAX_VALUE] - The maximum number of
 * pointers that may be active for the gesture to be recognized. Uses <=.
 * @param {number} [options.delay=1000] - The delay before emitting, during
 * which time the number of inputs must not go below minInputs.
 * @param {number} [options.tolerance=10] - The tolerance in pixels a user can
 * move and still allow the gesture to emit.
 */ class $b10ccf2aea321661$var$$044241a6e313bbcb$var$Press extends $b10ccf2aea321661$var$$044241a6e313bbcb$require$Gesture {
    constructor(element, handler, options = {}){
        super("press", element, handler, {
            ...$b10ccf2aea321661$var$$044241a6e313bbcb$var$Press.DEFAULTS,
            ...options
        });
    }
    start(state) {
        const initial = state.centroid;
        const originalInputs = Array.from(state.active);
        setTimeout(()=>{
            const inputs = state.active.filter((i)=>originalInputs.includes(i));
            if (inputs.length === originalInputs.length) {
                const centroid = $b10ccf2aea321661$var$$044241a6e313bbcb$require$Point2D.centroid(inputs.map((i)=>i.current.point));
                const distance = initial.distanceTo(centroid);
                if (distance <= this.options.tolerance) this.recognize($b10ccf2aea321661$var$$044241a6e313bbcb$require$MOVE, state, {
                    centroid: centroid,
                    distance: distance,
                    initial: initial
                });
            }
        }, this.options.delay);
    }
}
$b10ccf2aea321661$var$$044241a6e313bbcb$var$Press.DEFAULTS = Object.freeze({
    delay: 1000,
    tolerance: 10
});
$b10ccf2aea321661$var$$044241a6e313bbcb$exports = $b10ccf2aea321661$var$$044241a6e313bbcb$var$Press;
var $b10ccf2aea321661$var$$b6747a8030ff7e4d$exports = {};
var $b10ccf2aea321661$var$$b6747a8030ff7e4d$require$Smoothable = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Smoothable;
var $b10ccf2aea321661$var$$5618dc3399c82d06$exports = {};
var $b10ccf2aea321661$var$$5618dc3399c82d06$require$Gesture = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Gesture;
var $b10ccf2aea321661$var$$5618dc3399c82d06$require$Point2D = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Point2D;
var $b10ccf2aea321661$var$$5618dc3399c82d06$require$Smoothable = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Smoothable;
/**
 * Data returned when a Pivotable is recognized.
 *
 * @typedef {Object} SwivelData
 * @mixes ReturnTypes.BaseData
 *
 * @property {number} rotation - In radians, the change in angle since last
 * emit.
 * @property {westures-core.Point2D} pivot - The pivot point.
 *
 * @memberof ReturnTypes
 */ /**
 * A Pivotable is a single input rotating around a fixed point. The fixed point
 * is determined by the input's location at its 'start' phase.
 *
 * @extends westures.Gesture
 * @see {ReturnTypes.SwivelData}
 * @memberof westures
 *
 * @param {Element} element - The element to which to associate the gesture.
 * @param {Function} handler - The function handler to execute when a gesture
 * is recognized on the associated element.
 * @param {object} [options] - Gesture customization options.
 * @param {westures-core.STATE_KEYS[]} [options.enableKeys=[]] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.STATE_KEYS[]} [options.disableKeys=[]] - List of keys
 * which will disable the gesture. The gesture will not be recognized if one of
 * these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the disable key is never down.
 * @param {number} [options.minInputs=1] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs=Number.MAX_VALUE] - The maximum number of
 * pointers that may be active for the gesture to be recognized. Uses <=.
 * @param {boolean} [options.applySmoothing=true] - Whether to apply inertial
 * smoothing for systems with coarse pointers.
 * @param {number} [options.deadzoneRadius=15] - The radius in pixels around the
 * start point in which to do nothing.
 * @param {Element} [options.dynamicPivot=false] - Normally the center point of
 * the gesture's element is used as the pivot. If this option is set, the
 * initial contact point with the element is used as the pivot instead.
 */ class $b10ccf2aea321661$var$$5618dc3399c82d06$var$Pivotable extends $b10ccf2aea321661$var$$5618dc3399c82d06$require$Gesture {
    constructor(type = "pivotable", element, handler, options = {}){
        super(type, element, handler, {
            ...$b10ccf2aea321661$var$$5618dc3399c82d06$var$Pivotable.DEFAULTS,
            ...options
        });
        /**
     * The pivot point of the pivotable.
     *
     * @type {westures-core.Point2D}
     */ this.pivot = null;
        /**
     * The previous data.
     *
     * @type {number}
     */ this.previous = 0;
        /**
     * The outgoing data.
     *
     * @type {westures-core.Smoothable}
     */ this.outgoing = new $b10ccf2aea321661$var$$5618dc3399c82d06$require$Smoothable(options);
    }
    /**
   * Determine the center point of the given element's bounding client
   * rectangle.
   *
   * @static
   *
   * @param {Element} element - The DOM element to analyze.
   * @return {westures-core.Point2D} - The center of the element's bounding
   * client rectangle.
   */ static getClientCenter(element) {
        const rect = element.getBoundingClientRect();
        return new $b10ccf2aea321661$var$$5618dc3399c82d06$require$Point2D(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    /**
   * Updates the previous data. It will be called during the 'start' and 'end'
   * phases, and should also be called during the 'move' phase implemented by
   * the subclass.
   *
   * @abstract
   * @param {State} state - the current input state.
   */ updatePrevious() {
        throw "Gestures which extend Pivotable must implement updatePrevious()";
    }
    /**
   * Restart the given progress object using the given input object.
   *
   * @param {State} state - current input state.
   */ restart(state) {
        if (this.options.dynamicPivot) {
            this.pivot = state.centroid;
            this.previous = 0;
        } else {
            this.pivot = $b10ccf2aea321661$var$$5618dc3399c82d06$var$Pivotable.getClientCenter(this.element);
            this.updatePrevious(state);
        }
        this.outgoing.restart();
    }
    start(state) {
        this.restart(state);
    }
    end(state) {
        if (state.active.length > 0) this.restart(state);
        else this.outgoing.restart();
    }
    cancel() {
        this.outgoing.restart();
    }
}
$b10ccf2aea321661$var$$5618dc3399c82d06$var$Pivotable.DEFAULTS = Object.freeze({
    deadzoneRadius: 15,
    dynamicPivot: false
});
$b10ccf2aea321661$var$$5618dc3399c82d06$exports = $b10ccf2aea321661$var$$5618dc3399c82d06$var$Pivotable;
/**
 * Data returned when a Pull is recognized.
 *
 * @typedef {Object} PullData
 * @mixes ReturnTypes.BaseData
 *
 * @property {number} distance - The average distance from an active input to
 * the centroid.
 * @property {number} scale - The proportional change in distance since last
 * emit.
 * @property {westures-core.Point2D} pivot - The pivot point.
 *
 * @memberof ReturnTypes
 */ /**
 * A Pull is defined as a single input moving away from or towards a pivot
 * point.
 *
 * @extends westures-core.Gesture
 * @see {ReturnTypes.PullData}
 * @memberof westures
 *
 * @param {Element} element - The element to which to associate the gesture.
 * @param {Function} handler - The function handler to execute when a gesture
 * is recognized on the associated element.
 * @param {object} [options] - Gesture customization options.
 * @param {westures-core.STATE_KEYS[]} [options.enableKeys=[]] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.STATE_KEYS[]} [options.disableKeys=[]] - List of keys
 * which will disable the gesture. The gesture will not be recognized if one of
 * these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the disable key is never down.
 * @param {number} [options.minInputs=1] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs=Number.MAX_VALUE] - The maximum number of
 * pointers that may be active for the gesture to be recognized. Uses <=.
 * @param {boolean} [options.applySmoothing=true] - Whether to apply inertial
 * smoothing for systems with coarse pointers.
 * @param {number} [options.deadzoneRadius=15] - The radius in pixels around the
 * start point in which to do nothing.
 * @param {Element} [options.dynamicPivot=false] - Normally the center point of
 * the gesture's element is used as the pivot. If this option is set, the
 * initial contact point with the element is used as the pivot instead.
 */ class $b10ccf2aea321661$var$$b6747a8030ff7e4d$var$Pull extends $b10ccf2aea321661$var$$5618dc3399c82d06$exports {
    constructor(element, handler, options = {}){
        super("pull", element, handler, options);
        /*
     * The outgoing data, with optional inertial smoothing.
     *
     * @override
     * @type {westures-core.Smoothable<number>}
     */ this.outgoing = new $b10ccf2aea321661$var$$b6747a8030ff7e4d$require$Smoothable({
            ...options,
            identity: 1
        });
    }
    updatePrevious(state) {
        this.previous = this.pivot.distanceTo(state.centroid);
    }
    move(state) {
        const pivot = this.pivot;
        const distance = pivot.distanceTo(state.centroid);
        const scale = distance / this.previous;
        const { deadzoneRadius: deadzoneRadius  } = this.options;
        let rv = null;
        if (distance > deadzoneRadius && this.previous > deadzoneRadius) rv = {
            distance: distance,
            scale: this.outgoing.next(scale),
            pivot: pivot
        };
        /*
     * Updating the previous distance regardless of emit prevents sudden changes
     * when the user exits the deadzone circle.
     */ this.previous = distance;
        return rv;
    }
}
$b10ccf2aea321661$var$$b6747a8030ff7e4d$exports = $b10ccf2aea321661$var$$b6747a8030ff7e4d$var$Pull;
var $b10ccf2aea321661$var$$2779699df4dafe8f$exports = {};
var $b10ccf2aea321661$var$$2779699df4dafe8f$require$angularDifference = $b10ccf2aea321661$var$$17807945cdde5d67$exports.angularDifference;
var $b10ccf2aea321661$var$$2779699df4dafe8f$require$Gesture = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Gesture;
var $b10ccf2aea321661$var$$2779699df4dafe8f$require$Smoothable = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Smoothable;
/**
 * Data returned when a Rotate is recognized.
 *
 * @typedef {Object} RotateData
 * @mixes ReturnTypes.BaseData
 *
 * @property {number} rotation - In radians, the change in angle since last
 * emit.
 *
 * @memberof ReturnTypes
 */ /**
 * A Rotate is defined as two inputs moving with a changing angle between them.
 *
 * @extends westures-core.Gesture
 * @see {ReturnTypes.RotateData}
 * @memberof westures
 *
 * @param {Element} element - The element to which to associate the gesture.
 * @param {Function} handler - The function handler to execute when a gesture
 * is recognized on the associated element.
 * @param {object} [options] - Gesture customization options.
 * @param {westures-core.STATE_KEYS[]} [options.enableKeys=[]] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.STATE_KEYS[]} [options.disableKeys=[]] - List of keys
 * which will disable the gesture. The gesture will not be recognized if one of
 * these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the disable key is never down.
 * @param {number} [options.minInputs=2] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs=Number.MAX_VALUE] - The maximum number of
 * pointers that may be active for the gesture to be recognized. Uses <=.
 * @param {boolean} [options.applySmoothing=true] - Whether to apply inertial
 * smoothing for systems with coarse pointers.
 */ class $b10ccf2aea321661$var$$2779699df4dafe8f$var$Rotate extends $b10ccf2aea321661$var$$2779699df4dafe8f$require$Gesture {
    constructor(element, handler, options = {}){
        options = {
            ...$b10ccf2aea321661$var$$2779699df4dafe8f$var$Rotate.DEFAULTS,
            ...options
        };
        super("rotate", element, handler, options);
        /**
     * Track the previous angles for each input.
     *
     * @type {number[]}
     */ this.previousAngles = [];
        /*
     * The outgoing data, with optional inertial smoothing.
     *
     * @override
     * @type {westures-core.Smoothable<number>}
     */ this.outgoing = new $b10ccf2aea321661$var$$2779699df4dafe8f$require$Smoothable(options);
    }
    /**
   * Restart the gesture for a new number of inputs.
   *
   * @param {State} state - current input state.
   */ restart(state) {
        this.previousAngles = state.centroid.anglesTo(state.activePoints);
        this.outgoing.restart();
    }
    start(state) {
        this.restart(state);
    }
    move(state) {
        const stagedAngles = state.centroid.anglesTo(state.activePoints);
        const angle = stagedAngles.reduce((total, current, index)=>{
            return total + $b10ccf2aea321661$var$$2779699df4dafe8f$require$angularDifference(current, this.previousAngles[index]);
        }, 0);
        this.previousAngles = stagedAngles;
        const rotation = angle / state.activePoints.length;
        return {
            rotation: this.outgoing.next(rotation)
        };
    }
    end(state) {
        this.restart(state);
    }
    cancel() {
        this.outgoing.restart();
    }
}
$b10ccf2aea321661$var$$2779699df4dafe8f$var$Rotate.DEFAULTS = Object.freeze({
    minInputs: 2
});
$b10ccf2aea321661$var$$2779699df4dafe8f$exports = $b10ccf2aea321661$var$$2779699df4dafe8f$var$Rotate;
var $b10ccf2aea321661$var$$29f6d3783b0fe128$exports = {};
var $b10ccf2aea321661$var$$29f6d3783b0fe128$require$Gesture = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Gesture;
const $b10ccf2aea321661$var$$29f6d3783b0fe128$var$PROGRESS_STACK_SIZE = 7;
const $b10ccf2aea321661$var$$29f6d3783b0fe128$var$MS_THRESHOLD = 300;
/**
 * Data returned when a Swipe is recognized.
 *
 * @typedef {Object} SwipeData
 * @mixes ReturnTypes.BaseData
 *
 * @property {number} velocity - The velocity of the swipe.
 * @property {number} direction - In radians, the direction of the swipe.
 * @property {westures-core.Point2D} point - The point at which the swipe ended.
 * @property {number} time - The epoch time, in ms, when the swipe ended.
 *
 * @memberof ReturnTypes
 */ /**
 * A swipe is defined as input(s) moving in the same direction in an relatively
 * increasing velocity and leaving the screen at some point before it drops
 * below it's escape velocity.
 *
 * @extends westures-core.Gesture
 * @see {ReturnTypes.SwipeData}
 * @memberof westures
 *
 * @param {Element} element - The element to which to associate the gesture.
 * @param {Function} handler - The function handler to execute when a gesture
 * is recognized on the associated element.
 * @param {object} [options] - Gesture customization options.
 * @param {westures-core.STATE_KEYS[]} [options.enableKeys=[]] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.STATE_KEYS[]} [options.disableKeys=[]] - List of keys
 * which will disable the gesture. The gesture will not be recognized if one of
 * these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the disable key is never down.
 * @param {number} [options.minInputs=1] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs=Number.MAX_VALUE] - The maximum number of
 * pointers that may be active for the gesture to be recognized. Uses <=.
 */ class $b10ccf2aea321661$var$$29f6d3783b0fe128$var$Swipe extends $b10ccf2aea321661$var$$29f6d3783b0fe128$require$Gesture {
    constructor(element, handler, options = {}){
        super("swipe", element, handler, options);
        /**
     * Moves list.
     *
     * @type {object[]}
     */ this.moves = [];
        /**
     * Data to emit when all points have ended.
     *
     * @type {ReturnTypes.SwipeData}
     */ this.saved = null;
    }
    /**
   * Restart the swipe state for a new numper of inputs.
   */ restart() {
        this.moves = [];
        this.saved = null;
    }
    start() {
        this.restart();
    }
    move(state) {
        this.moves.push({
            time: Date.now(),
            point: state.centroid
        });
        if (this.moves.length > $b10ccf2aea321661$var$$29f6d3783b0fe128$var$PROGRESS_STACK_SIZE) this.moves.splice(0, this.moves.length - $b10ccf2aea321661$var$$29f6d3783b0fe128$var$PROGRESS_STACK_SIZE);
    }
    end(state) {
        const result = this.getResult();
        this.moves = [];
        if (state.active.length > 0) {
            this.saved = result;
            return null;
        }
        this.saved = null;
        return $b10ccf2aea321661$var$$29f6d3783b0fe128$var$Swipe.validate(result);
    }
    cancel() {
        this.restart();
    }
    /**
   * Get the swipe result.
   *
   * @returns {?ReturnTypes.SwipeData}
   */ getResult() {
        if (this.moves.length < $b10ccf2aea321661$var$$29f6d3783b0fe128$var$PROGRESS_STACK_SIZE) return this.saved;
        const vlim = $b10ccf2aea321661$var$$29f6d3783b0fe128$var$PROGRESS_STACK_SIZE - 1;
        const { point: point , time: time  } = this.moves[vlim];
        const velocity = $b10ccf2aea321661$var$$29f6d3783b0fe128$var$Swipe.calc_velocity(this.moves, vlim);
        const direction = $b10ccf2aea321661$var$$29f6d3783b0fe128$var$Swipe.calc_angle(this.moves, vlim);
        const centroid = point;
        return {
            point: point,
            velocity: velocity,
            direction: direction,
            time: time,
            centroid: centroid
        };
    }
    /**
   * Validates that an emit should occur with the given data.
   *
   * @static
   * @param {?ReturnTypes.SwipeData} data
   * @returns {?ReturnTypes.SwipeData}
   */ static validate(data) {
        if (data == null) return null;
        return Date.now() - data.time > $b10ccf2aea321661$var$$29f6d3783b0fe128$var$MS_THRESHOLD ? null : data;
    }
    /**
   * Calculates the angle of movement along a series of moves.
   *
   * @static
   * @see {@link https://en.wikipedia.org/wiki/Mean_of_circular_quantities}
   *
   * @param {{time: number, point: westures-core.Point2D}} moves - The moves
   * list to process.
   * @param {number} vlim - The number of moves to process.
   *
   * @return {number} The angle of the movement.
   */ static calc_angle(moves, vlim) {
        const point = moves[vlim].point;
        let sin = 0;
        let cos = 0;
        for(let i = 0; i < vlim; ++i){
            const angle = moves[i].point.angleTo(point);
            sin += Math.sin(angle);
            cos += Math.cos(angle);
        }
        sin /= vlim;
        cos /= vlim;
        return Math.atan2(sin, cos);
    }
    /**
   * Local helper function for calculating the velocity between two timestamped
   * points.
   *
   * @static
   * @param {object} start
   * @param {westures-core.Point2D} start.point
   * @param {number} start.time
   * @param {object} end
   * @param {westures-core.Point2D} end.point
   * @param {number} end.time
   *
   * @return {number} velocity from start to end point.
   */ static velocity(start, end) {
        const distance = end.point.distanceTo(start.point);
        const time = end.time - start.time + 1;
        return distance / time;
    }
    /**
   * Calculates the veloctiy of movement through a series of moves.
   *
   * @static
   * @param {{time: number, point: westures-core.Point2D}} moves - The moves
   * list to process.
   * @param {number} vlim - The number of moves to process.
   *
   * @return {number} The velocity of the moves.
   */ static calc_velocity(moves, vlim) {
        let max = 0;
        for(let i = 0; i < vlim; ++i){
            const current = $b10ccf2aea321661$var$$29f6d3783b0fe128$var$Swipe.velocity(moves[i], moves[i + 1]);
            if (current > max) max = current;
        }
        return max;
    }
}
$b10ccf2aea321661$var$$29f6d3783b0fe128$exports = $b10ccf2aea321661$var$$29f6d3783b0fe128$var$Swipe;
var $b10ccf2aea321661$var$$5bf1e923ca9fec67$exports = {};
var $b10ccf2aea321661$var$$5bf1e923ca9fec67$require$angularDifference = $b10ccf2aea321661$var$$17807945cdde5d67$exports.angularDifference;
var $b10ccf2aea321661$var$$5bf1e923ca9fec67$require$Smoothable = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Smoothable;
/**
 * Data returned when a Swivel is recognized.
 *
 * @typedef {Object} SwivelData
 * @mixes ReturnTypes.BaseData
 *
 * @property {number} rotation - In radians, the change in angle since last
 * emit.
 * @property {westures-core.Point2D} pivot - The pivot point.
 *
 * @memberof ReturnTypes
 */ /**
 * A Swivel is a single input rotating around a fixed point. The fixed point is
 * determined by the input's location at its 'start' phase.
 *
 * @extends westures-core.Gesture
 * @see {ReturnTypes.SwivelData}
 * @memberof westures
 *
 * @param {Element} element - The element to which to associate the gesture.
 * @param {Function} handler - The function handler to execute when a gesture
 * is recognized on the associated element.
 * @param {object} [options] - Gesture customization options.
 * @param {westures-core.STATE_KEYS[]} [options.enableKeys=[]] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.STATE_KEYS[]} [options.disableKeys=[]] - List of keys
 * which will disable the gesture. The gesture will not be recognized if one of
 * these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the disable key is never down.
 * @param {number} [options.minInputs=1] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs=Number.MAX_VALUE] - The maximum number of
 * pointers that may be active for the gesture to be recognized. Uses <=.
 * @param {boolean} [options.applySmoothing=true] - Whether to apply inertial
 * smoothing for systems with coarse pointers.
 * @param {number} [options.deadzoneRadius=15] - The radius in pixels around the
 * start point in which to do nothing.
 * @param {Element} [options.dynamicPivot=false] - Normally the center point of
 * the gesture's element is used as the pivot. If this option is set, the
 * initial contact point with the element is used as the pivot instead.
 */ class $b10ccf2aea321661$var$$5bf1e923ca9fec67$var$Swivel extends $b10ccf2aea321661$var$$5618dc3399c82d06$exports {
    constructor(element, handler, options = {}){
        super("swivel", element, handler, options);
        /*
     * The outgoing data, with optional inertial smoothing.
     *
     * @override
     * @type {westures-core.Smoothable<number>}
     */ this.outgoing = new $b10ccf2aea321661$var$$5bf1e923ca9fec67$require$Smoothable(options);
    }
    updatePrevious(state) {
        this.previous = this.pivot.angleTo(state.centroid);
    }
    move(state) {
        const pivot = this.pivot;
        const angle = pivot.angleTo(state.centroid);
        const rotation = $b10ccf2aea321661$var$$5bf1e923ca9fec67$require$angularDifference(angle, this.previous);
        let rv = null;
        if (pivot.distanceTo(state.centroid) > this.options.deadzoneRadius) rv = {
            rotation: this.outgoing.next(rotation),
            pivot: pivot
        };
        /*
     * Updating the previous angle regardless of emit prevents sudden flips when
     * the user exits the deadzone circle.
     */ this.previous = angle;
        return rv;
    }
}
$b10ccf2aea321661$var$$5bf1e923ca9fec67$exports = $b10ccf2aea321661$var$$5bf1e923ca9fec67$var$Swivel;
var $b10ccf2aea321661$var$$2f0219f585763ab0$exports = {};
var $b10ccf2aea321661$var$$2f0219f585763ab0$require$Gesture = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Gesture;
var $b10ccf2aea321661$var$$2f0219f585763ab0$require$Point2D = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Point2D;
/**
 * Data returned when a Tap is recognized.
 *
 * @typedef {Object} TapData
 * @mixes ReturnTypes.BaseData
 *
 * @property {number} x - x coordinate of tap point.
 * @property {number} y - y coordinate of tap point.
 *
 * @memberof ReturnTypes
 */ /**
 * A Tap is defined as a touchstart to touchend event in quick succession.
 *
 * @extends westures-core.Gesture
 * @see {ReturnTypes.TapData}
 * @memberof westures
 *
 * @param {Element} element - The element to which to associate the gesture.
 * @param {Function} handler - The function handler to execute when a gesture
 * is recognized on the associated element.
 * @param {object} [options] - Gesture customization options.
 * @param {westures-core.STATE_KEYS[]} [options.enableKeys=[]] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.STATE_KEYS[]} [options.disableKeys=[]] - List of keys
 * which will disable the gesture. The gesture will not be recognized if one of
 * these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the disable key is never down.
 * @param {number} [options.minInputs=1] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs=Number.MAX_VALUE] - The maximum number of
 * pointers that may be active for the gesture to be recognized. Uses <=.
 * @param {number} [options.minDelay=0] - The minimum delay between a touchstart
 * and touchend can be configured in milliseconds.
 * @param {number} [options.maxDelay=300] - The maximum delay between a
 * touchstart and touchend can be configured in milliseconds.
 * @param {number} [options.maxRetain=300] - The maximum time after a tap ends
 * before it is discarded can be configured in milliseconds. Useful for
 * multi-tap gestures, to allow things like slow "double clicks".
 * @param {number} [options.numTaps=1] - Number of taps to require.
 * @param {number} [options.tolerance=10] - The tolerance in pixels an input can
 * move before it will no longer be considered part of a tap.
 */ class $b10ccf2aea321661$var$$2f0219f585763ab0$var$Tap extends $b10ccf2aea321661$var$$2f0219f585763ab0$require$Gesture {
    constructor(element, handler, options = {}){
        super("tap", element, handler, {
            ...$b10ccf2aea321661$var$$2f0219f585763ab0$var$Tap.DEFAULTS,
            ...options
        });
        /**
     * An array of inputs that have ended recently.
     *
     * @type {Input[]}
     */ this.taps = [];
    }
    end(state) {
        const now = Date.now();
        const { minDelay: minDelay , maxDelay: maxDelay , maxRetain: maxRetain , numTaps: numTaps , tolerance: tolerance  } = this.options;
        // Save the recently ended inputs as taps.
        this.taps = this.taps.concat(state.getInputsInPhase("end")).filter((input)=>{
            const elapsed = input.elapsedTime;
            const tdiff = now - input.current.time;
            return elapsed <= maxDelay && elapsed >= minDelay && tdiff <= maxRetain;
        });
        // Validate the list of taps.
        if (this.taps.length !== numTaps || this.taps.some((i)=>i.totalDistance() > tolerance)) return null;
        const centroid = $b10ccf2aea321661$var$$2f0219f585763ab0$require$Point2D.centroid(this.taps.map((i)=>i.current.point));
        this.taps = []; // Critical! Used taps need to be cleared!
        return {
            centroid: centroid,
            ...centroid
        };
    }
}
$b10ccf2aea321661$var$$2f0219f585763ab0$var$Tap.DEFAULTS = Object.freeze({
    minDelay: 0,
    maxDelay: 300,
    maxRetain: 300,
    numTaps: 1,
    tolerance: 10
});
$b10ccf2aea321661$var$$2f0219f585763ab0$exports = $b10ccf2aea321661$var$$2f0219f585763ab0$var$Tap;
var $b10ccf2aea321661$var$$13a50dd07826f9eb$exports = {};
var $b10ccf2aea321661$var$$13a50dd07826f9eb$require$Gesture = $b10ccf2aea321661$var$$17807945cdde5d67$exports.Gesture;
/**
 * Data returned when a Track is recognized.
 *
 * @typedef {Object} TrackData
 * @mixes ReturnTypes.BaseData
 *
 * @property {westures-core.Point2D[]} active - Points currently in 'start' or
 *    'move' phase.
 *
 * @memberof ReturnTypes
 */ /**
 * A Track gesture forwards a list of active points and their centroid on each
 * of the selected phases.
 *
 * @extends westures-core.Gesture
 * @see {ReturnTypes.TrackData}
 * @memberof westures
 *
 * @param {Element} element - The element to which to associate the gesture.
 * @param {Function} handler - The function handler to execute when a gesture
 * is recognized on the associated element.
 * @param {object} [options] - Gesture customization options.
 * @param {westures-core.STATE_KEYS[]} [options.enableKeys=[]] - List of keys
 * which will enable the gesture. The gesture will not be recognized unless one
 * of these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the enable key is always down.
 * @param {westures-core.STATE_KEYS[]} [options.disableKeys=[]] - List of keys
 * which will disable the gesture. The gesture will not be recognized if one of
 * these keys is pressed while the interaction occurs. If not specified or an
 * empty list, the gesture is treated as though the disable key is never down.
 * @param {number} [options.minInputs=1] - The minimum number of pointers that
 * must be active for the gesture to be recognized. Uses >=.
 * @param {number} [options.maxInputs=Number.MAX_VALUE] - The maximum number of
 * pointers that may be active for the gesture to be recognized. Uses <=.
 * @param {string[]} [options.phases=[]] Phases to recognize. Entries can be any
 * or all of 'start', 'move', 'end', and 'cancel'.
 */ class $b10ccf2aea321661$var$$13a50dd07826f9eb$var$Track extends $b10ccf2aea321661$var$$13a50dd07826f9eb$require$Gesture {
    constructor(element, handler, options = {}){
        super("track", element, handler, {
            ...$b10ccf2aea321661$var$$13a50dd07826f9eb$var$Track.DEFAULTS,
            ...options
        });
    }
    /**
   * Filters out the state's data, down to what should be emitted.

   * @param {State} state - current input state.
   * @return {ReturnTypes.TrackData}
   */ data({ activePoints: activePoints  }) {
        return {
            active: activePoints
        };
    }
    tracks(phase) {
        return this.options.phases.includes(phase);
    }
    start(state) {
        return this.tracks("start") ? this.data(state) : null;
    }
    move(state) {
        return this.tracks("move") ? this.data(state) : null;
    }
    end(state) {
        return this.tracks("end") ? this.data(state) : null;
    }
    cancel(state) {
        return this.tracks("cancel") ? this.data(state) : null;
    }
}
$b10ccf2aea321661$var$$13a50dd07826f9eb$var$Track.DEFAULTS = Object.freeze({
    phases: Object.freeze([])
});
$b10ccf2aea321661$var$$13a50dd07826f9eb$exports = $b10ccf2aea321661$var$$13a50dd07826f9eb$var$Track;
$b10ccf2aea321661$exports = {
    Pan: $b10ccf2aea321661$var$$edded22326d64913$exports,
    Pinch: $b10ccf2aea321661$var$$a29eb49c9650e38a$exports,
    Press: $b10ccf2aea321661$var$$044241a6e313bbcb$exports,
    Pull: $b10ccf2aea321661$var$$b6747a8030ff7e4d$exports,
    Rotate: $b10ccf2aea321661$var$$2779699df4dafe8f$exports,
    Swipe: $b10ccf2aea321661$var$$29f6d3783b0fe128$exports,
    Swivel: $b10ccf2aea321661$var$$5bf1e923ca9fec67$exports,
    Tap: $b10ccf2aea321661$var$$2f0219f585763ab0$exports,
    Track: $b10ccf2aea321661$var$$13a50dd07826f9eb$exports,
    ...$b10ccf2aea321661$var$$17807945cdde5d67$exports
}; /**
 * Here are the return "types" of the gestures that are included in this
 * package.
 *
 * @namespace ReturnTypes
 */  /**
 * The base data that is included for all emitted gestures.
 *
 * @typedef {Object} BaseData
 *
 * @property {westures-core.Point2D} centroid - The centroid of the input
 * points.
 * @property {Event} event - The input event which caused the gesture to be
 * recognized.
 * @property {string} phase - 'start', 'move', 'end', or 'cancel'.
 * @property {number} radius - The distance of the furthest input to the
 * centroid.
 * @property {string} type - The name of the gesture as specified by its
 * designer.
 * @property {Element} target - The bound target of the gesture.
 *
 * @memberof ReturnTypes
 */ 



var $dc7157263e8aa14f$require$NOP = $f7c9fda677014379$exports.NOP;
/**
 * The Interactor class provides a layer of abstraction between the
 * ClientController and the code that processes user inputs.  Data from
 * recognized gestures is reported directly through to the handlers. The
 * handlers are initialized to NOPs so that the functions which call the
 * handlers don't need to check whether the handler exists.
 *
 * Currently, the Interactor makes use of the Westures library.
 *
 * @memberof module:client
 *
 * @see {@link https://mvanderkamp.github.io/westures/}
 *
 * @param {Object} handlers - Object with keys as the names gestures and values
 *    as the corresponding function for handling that gesture when it is
 *    recognized.
 * @param {Function} [handlers.swipe=NOP]
 * @param {Function} [handlers.tap=NOP]
 * @param {Function} [handlers.track=NOP]
 * @param {Function} [handlers.transform=NOP]
 */ class $dc7157263e8aa14f$var$Interactor {
    constructor(root, handlers = {}){
        /**
     * Object holding the handlers, so they can be dynamically referenced by
     * name.
     *
     * @type {Object}
     * @property {Function} [swipe=NOP]
     * @property {Function} [tap=NOP]
     * @property {Function} [track=NOP]
     * @property {Function} [transform=NOP]
     */ this.handlers = {
            ...$dc7157263e8aa14f$var$Interactor.DEFAULT_HANDLERS,
            ...handlers
        };
        /**
     * Object to coalesce state from multiple gestures during one event cycle.
     *
     * @type {Object}
     */ this._changes = this._resetChanges();
        this._scheduled = false;
        // Begin listening activities immediately.
        this.addGestures(root);
        window.addEventListener("wheel", this.wheel.bind(this), false);
    }
    /**
   * Sets up gesture listeners via westures.
   */ addGestures(root) {
        const region = new $b10ccf2aea321661$exports.Region(root, {
            preventDefault: false
        });
        region.addGesture(new $b10ccf2aea321661$exports.Pan(root, this.coalesce.bind(this), {
            disableKeys: [
                "ctrlKey"
            ]
        }));
        region.addGesture(new $b10ccf2aea321661$exports.Pinch(root, this.coalesce.bind(this)));
        region.addGesture(new $b10ccf2aea321661$exports.Rotate(root, this.coalesce.bind(this)));
        region.addGesture(new $b10ccf2aea321661$exports.Swipe(root, this.handlers.swipe));
        region.addGesture(new $b10ccf2aea321661$exports.Swivel(root, this.swivel.bind(this), {
            enableKeys: [
                "ctrlKey"
            ],
            dynamicPivot: true,
            maxInputs: 1
        }));
        region.addGesture(new $b10ccf2aea321661$exports.Tap(root, this.handlers.tap));
        region.addGesture(new $b10ccf2aea321661$exports.Track(root, this.handlers.track, {
            phases: [
                "start",
                "end"
            ]
        }));
    }
    _resetChanges() {
        return {
            centroid: {
                x: 0,
                y: 0
            },
            delta: {
                scale: 1,
                rotation: 0,
                translation: {
                    x: 0,
                    y: 0
                }
            }
        };
    }
    /**
   * Coalesce state changes for this event cycle.
   */ coalesce(data) {
        this._changes.centroid = data.centroid;
        if (data.scale) this._changes.delta.scale *= data.scale;
        if (data.rotation) this._changes.delta.rotation += data.rotation;
        if (data.translation) {
            this._changes.delta.translation.x += data.translation.x;
            this._changes.delta.translation.y += data.translation.y;
        }
        if (!this._scheduled) {
            window.setTimeout(this._emit.bind(this), 0);
            this._scheduled = true;
        }
    }
    /**
   * Emit a transform event with the coalesced state changes.
   */ _emit() {
        this.handlers.transform(this._changes);
        this._changes = this._resetChanges();
        this._scheduled = false;
    }
    /**
   * Send a swivel event through as a transformation.
   */ swivel({ rotation: rotation , pivot: pivot  }) {
        this.coalesce({
            rotation: rotation,
            centroid: pivot
        });
    }
    /**
   * Treat scrollwheel events as zoom events.
   *
   * @param {WheelEvent} event - The wheel event from the window.
   */ wheel(event) {
        event.preventDefault();
        const factor = event.ctrlKey ? 0.02 : 0.1;
        const scale = -(Math.sign(event.deltaY) * factor) + 1;
        const centroid = {
            x: event.clientX,
            y: event.clientY
        };
        this.handlers.transform({
            centroid: centroid,
            delta: {
                scale: scale
            }
        });
    }
}
/**
 * The default handlers used by the Interactor.
 *
 * @type {object}
 */ $dc7157263e8aa14f$var$Interactor.DEFAULT_HANDLERS = Object.freeze({
    swipe: $dc7157263e8aa14f$require$NOP,
    tap: $dc7157263e8aa14f$require$NOP,
    track: $dc7157263e8aa14f$require$NOP,
    transform: $dc7157263e8aa14f$require$NOP
});
$dc7157263e8aa14f$exports = $dc7157263e8aa14f$var$Interactor;


// Symbols to identify these methods as intended only for internal use
const $e307541a347955a1$var$symbols = Object.freeze({
    attachSocketIoListeners: Symbol("attachSocketIoListeners"),
    render: Symbol("render")
});
/**
 * The ClientController coordinates communication with the wams server. It sends
 * messages based on user interaction with the canvas and receives messages from
 * the server detailing changes to post to the view.
 *
 * @memberof module:client
 *
 * @param {HTMLCanvasElement} canvas - The underlying CanvasElement object, (not
 * the context), which will fill the page.
 * @param {module:client.ClientView} view - The view that will handle rendering
 * duties.
 * @param {module:client.ClientModel} model - The client-side copy of the
 * server's model.
 */ class $e307541a347955a1$var$ClientController {
    constructor(root, canvas, view, model){
        /**
     * Root element where WAMS canvas and HTML elements are located.
     *
     * @type {Element}
     */ this.rootElement = root;
        /**
     * The HTMLCanvasElement object is stored by the ClientController so that it
     * is able to respond to user events triggered on the canvas. The view only
     * needs to know about the canvas drawing context.
     *
     * @type {HTMLCanvasElement}
     */ this.canvas = canvas;
        /**
     * From socket.io, the socket provides a channel of communication with the
     * server.
     *
     * @type {Socket}
     * @see {@link https://socket.io/docs/client-api/}
     */ this.socket = null;
        /**
     * The ClientModel is a client-side copy of the workspace model, kept up to
     * date by the controller.
     *
     * @type {module:client.ClientModel}
     */ this.model = model;
        /**
     * The ClientView handles the final rendering of the model, as informed by
     * the controller.
     *
     * @type {module:client.ClientView}
     */ this.view = view;
        /**
     * List of custom event names that will be listened to.
     *
     * @type {array}
     */ this.eventListeners = [];
        /**
     * Queue of events to be called once Client-side listeners are set up.
     *
     * @type {array}
     */ this.eventQueue = [];
        /**
     * Tracks whether a render has been scheduled for the next render frame.
     *
     * @type {boolean}
     */ this.renderScheduled = false;
        /**
     * Bound reference to the render method, for use as a callback.
     *
     * @type {function}
     */ this.render_fn = this[$e307541a347955a1$var$symbols.render].bind(this);
    }
    /**
   * Attaches listeners to messages received over the socket connection. All
   * received messages at this layer should be those conforming to the Message /
   * Reporter protocol.
   *
   * This internal routine should be called as part of socket establishment.
   *
   * @alias [@@attachSocketIoListeners]
   * @memberof module:client.ClientController
   */ [$e307541a347955a1$var$symbols.attachSocketIoListeners]() {
        const listeners = {
            // For the server to inform about changes to the model
            [$e307541a347955a1$require$Message.ADD_ELEMENT]: (data)=>this.handle("addElement", data),
            [$e307541a347955a1$require$Message.ADD_IMAGE]: (data)=>this.handle("addImage", data),
            [$e307541a347955a1$require$Message.ADD_ITEM]: (data)=>this.handle("addItem", data),
            [$e307541a347955a1$require$Message.ADD_SHADOW]: (data)=>this.handle("addShadow", data),
            [$e307541a347955a1$require$Message.RM_ITEM]: (data)=>this.handle("removeItem", data),
            [$e307541a347955a1$require$Message.RM_SHADOW]: (data)=>this.handle("removeShadow", data),
            [$e307541a347955a1$require$Message.UD_ITEM]: (data)=>this.handle("updateItem", data),
            [$e307541a347955a1$require$Message.UD_SHADOW]: (data)=>this.handle("updateShadow", data),
            [$e307541a347955a1$require$Message.UD_VIEW]: (data)=>this.handle("updateView", data),
            // For hopefully occasional extra adjustments to objects in the model.
            [$e307541a347955a1$require$Message.RM_ATTRS]: ({ data: data  })=>this.handle("removeAttributes", data),
            [$e307541a347955a1$require$Message.SET_ATTRS]: ({ data: data  })=>this.handle("setAttributes", data),
            [$e307541a347955a1$require$Message.SET_IMAGE]: ({ data: data  })=>this.handle("setImage", data),
            [$e307541a347955a1$require$Message.SET_RENDER]: ({ data: data  })=>this.handle("setRender", data),
            [$e307541a347955a1$require$Message.SET_PARENT]: ({ data: data  })=>this.handle("setParent", data),
            // Connection establishment related (disconnect, initial setup)
            [$e307541a347955a1$require$Message.INITIALIZE]: this.setup.bind(this),
            [$e307541a347955a1$require$Message.LAYOUT]: $e307541a347955a1$require$NOP,
            [$e307541a347955a1$require$Message.CLICK]: $e307541a347955a1$require$NOP,
            [$e307541a347955a1$require$Message.RESIZE]: $e307541a347955a1$require$NOP,
            [$e307541a347955a1$require$Message.SWIPE]: $e307541a347955a1$require$NOP,
            [$e307541a347955a1$require$Message.TRACK]: $e307541a347955a1$require$NOP,
            [$e307541a347955a1$require$Message.TRANSFORM]: $e307541a347955a1$require$NOP,
            [$e307541a347955a1$require$Message.POINTER]: $e307541a347955a1$require$NOP,
            [$e307541a347955a1$require$Message.BLUR]: $e307541a347955a1$require$NOP,
            // TODO: This could be more... elegant...
            [$e307541a347955a1$require$Message.FULL]: ()=>{
                document.body.innerHTML = "WAMS is full! :(";
            },
            // For user-defined behavior
            [$e307541a347955a1$require$Message.DISPATCH]: ({ data: data  })=>this.handleCustomEvent(data)
        };
        Object.entries(listeners).forEach(([p, v])=>this.socket.on(p, v));
        // Keep the view size up to date.
        this.canvas.addEventListener("resize", this.handleResize.bind(this), false);
        /*
     * As no automatic draw loop is used, (there are no animations), need to
     * know when to re-render in response to an image loading.
     */ const scheduleFn = this.scheduleRender.bind(this);
        document.addEventListener($e307541a347955a1$require$Message.IMG_LOAD, scheduleFn);
    }
    /**
   * Establishes a socket.io connection with the server, using the global WAMS
   * namespace. Connections should be non-persistent over disconnects, (i.e., no
   * reconnections), as this was the cause of many bugs.
   *
   * This internal routine should be called automatically upon ClientController
   * instantiation.
   */ connect() {
        this.socket = $e307541a347955a1$require$io.connect($e307541a347955a1$require$constants.NS_WAMS, {
            autoConnect: false,
            reconnection: false,
            transports: [
                "websocket",
                "polling"
            ]
        });
        this[$e307541a347955a1$var$symbols.attachSocketIoListeners]();
        window.requestAnimationFrame(this.render_fn);
        this.socket.connect();
    }
    /**
   * Renders a frame.
   *
   * @alias [@@render]
   * @memberof module:client.ClientController
   */ [$e307541a347955a1$var$symbols.render]() {
        if (this.renderScheduled) {
            this.view.draw();
            this.renderScheduled = false;
        }
        window.requestAnimationFrame(this.render_fn);
    }
    /**
   * Generates a function for forwarding the given message to the server.
   *
   * @see {@link module:shared.Message}
   *
   * @param {string} message - The type of message to forward. One of the static
   * members of the Message class.
   *
   * @return {Function} A function bound to this instance for forwarding data to
   * the server with the given message type label.
   */ forward(message, data) {
        const dreport = new $e307541a347955a1$require$DataReporter({
            data: data
        });
        new $e307541a347955a1$require$Message(message, dreport).emitWith(this.socket);
    }
    /**
   * Passes messages to the View, and schedules a render.
   *
   * @see {@link module:shared.Message}
   *
   * @param {string} message - The name of a ClientView method to run.
   * @param {...*} data - The argument to pass to the ClientView method.
   */ handle(message, data) {
        this.model[message](data, this);
        this.scheduleRender();
    }
    /**
   * Helper function to ensure that only those events that
   * have attached listeners will be dispatched by the ClientModel.
   *
   * @param {string} message - the name of the ClientModel method to run.
   * @param {object} data - the argument to pass to `this.handle`.
   */ handleCustomEvent(data) {
        if (this.eventListeners.indexOf(data.action) < 0) this.eventQueue.push(data);
        this.handle("dispatch", data);
    }
    /**
   * For responding to window resizing by the user. Resizes the canvas to fit
   * the new window size, and reports the change to the server so it can be
   * reflected in the model.
   */ handleResize() {
        this.view.resize(this.canvas.width, this.canvas.height);
        new $e307541a347955a1$require$Message($e307541a347955a1$require$Message.RESIZE, this.view).emitWith(this.socket);
        this.view.draw();
    }
    /**
   * Schedules a render for the next frame interval.
   */ scheduleRender() {
        this.renderScheduled = true;
    }
    /**
   * As this object will be instantiated on page load, and will generate a view
   * before communication lines with the server have been opened, the view will
   * not reflect the model automatically. This function responds to a message
   * from the server which contains the current state of the model, and forwards
   * this data to the view so that it can correctly render the model.
   *
   * @param {module:shared.FullStateReporter} data - All the information
   * necessary to initially synchronize this client's model with the server's
   * model.
   */ setup(data) {
        if (data.clientScripts) this.loadClientScripts(data.clientScripts);
        if (data.stylesheets) this.loadStylesheets(data.stylesheets);
        document.title = data.title;
        $e307541a347955a1$require$IdStamper.cloneId(this.view, data.id);
        this.model.setup(data);
        this.setupInteractor(data.useMultiScreenGestures);
        // Need to tell the model what the view looks like once setup is complete.
        new $e307541a347955a1$require$Message($e307541a347955a1$require$Message.LAYOUT, this.view).emitWith(this.socket);
    }
    loadClientScripts(scripts) {
        scripts.forEach((src)=>{
            const script = document.createElement("script");
            script.src = src;
            document.body.appendChild(script);
        });
    }
    loadStylesheets(stylesheets) {
        stylesheets.forEach((src)=>{
            const link = document.createElement("link");
            link.href = src;
            link.type = "text/css";
            link.rel = "stylesheet";
            document.head.appendChild(link);
        });
    }
    /**
   * The Interactor is a level of abstraction between the ClientController and
   * the gesture recognition library such that libraries can be swapped out
   * more easily, if need be. At least in theory. All the ClientController
   * needs to provide is handler functions for responding to the recognized
   * gestures.
   *
   * @param {boolean} [useMultiScreenGestures=false] Whether to use server-side
   * gestures. Default is to use client-side gestures.
   */ setupInteractor(useMultiScreenGestures = false) {
        // if (useMultiScreenGestures) {
        //   this.setupInputForwarding();
        // } else {
        // eslint-disable-next-line
        this.setupInputForwarding();
        return new $dc7157263e8aa14f$exports(this.rootElement, {
            swipe: this.forward.bind(this, $e307541a347955a1$require$Message.SWIPE),
            tap: this.forward.bind(this, $e307541a347955a1$require$Message.CLICK),
            track: this.forward.bind(this, $e307541a347955a1$require$Message.TRACK),
            transform: this.forward.bind(this, $e307541a347955a1$require$Message.TRANSFORM)
        });
    }
    /**
   * Set up input event forwarding.
   */ setupInputForwarding() {
        this.forwardPointerEvents();
        this.forwardBlurEvents();
    }
    /**
   * Forward the given events, by using the given callback.
   *
   * @param {string[]} eventnames
   * @param {function} callback
   */ forwardEvents(eventnames, callback) {
        eventnames.forEach((eventname)=>{
            window.addEventListener(eventname, callback, {
                capture: true,
                once: false,
                passive: false
            });
        });
    }
    /**
   * Forward blur and cancel events.
   */ forwardBlurEvents() {
        this.forwardEvents([
            "pointercancel",
            "blur"
        ], (event)=>{
            const breport = new $e307541a347955a1$require$DataReporter();
            new $e307541a347955a1$require$Message($e307541a347955a1$require$Message.BLUR, breport).emitWith(this.socket);
        });
    }
    /**
   * Forward pointer events.
   */ forwardPointerEvents() {
        this.forwardEvents([
            "pointerdown",
            "pointermove",
            "pointerup"
        ], (event)=>{
            const treport = new $e307541a347955a1$require$PointerReporter(event);
            new $e307541a347955a1$require$Message($e307541a347955a1$require$Message.POINTER, treport).emitWith(this.socket);
        });
    }
    /**
   * Dispatch a custom ServerEvent.
   *
   * @param {string} action
   * @param {object} payload
   */ dispatch(action, payload) {
        const dreport = new $e307541a347955a1$require$DataReporter({
            data: {
                action: action,
                payload: payload
            }
        });
        new $e307541a347955a1$require$Message($e307541a347955a1$require$Message.DISPATCH, dreport).emitWith(this.socket);
    }
}
$e307541a347955a1$exports = $e307541a347955a1$var$ClientController;


var $3da2dd796d6955de$exports = {};
"use strict";
var $c7ebcb254e83329f$exports = {};
"use strict";

var $c7ebcb254e83329f$require$Point2D = $f7c9fda677014379$exports.Point2D;
var $c7ebcb254e83329f$require$IdStamper = $f7c9fda677014379$exports.IdStamper;
var $c7ebcb254e83329f$require$WamsElement = $f7c9fda677014379$exports.WamsElement;
/**
 * The ClientElement class exposes the draw() funcitonality of wams elements.
 *
 * @extends module:shared.WamsElement
 * @memberof module:client
 *
 * @param {module:shared.WamsElement} data - The data from the server describing
 * this item. Only properties explicity listed in the array passed to the
 * ReporterFactory when the WamsElement class was defined will be accepted.
 */ class $c7ebcb254e83329f$var$ClientElement extends $c7ebcb254e83329f$require$WamsElement {
    constructor(data){
        super(data);
        /**
     * Root element where WAMS canvas and HTML elements are located.
     *
     * @type {Element}
     */ const root = document.querySelector("#root");
        /**
     * The DOM element.
     *
     * @type {Element}
     */ this.element = document.createElement(data.tagname);
        this.element.classList.add("wams-element");
        this.element.width = this.width;
        this.element.height = this.height;
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        root.appendChild(this.element);
        if (Object.prototype.hasOwnProperty.call(data, "attributes")) this.setAttributes(data.attributes);
        /**
     * Id to make the items uniquely identifiable.
     *
     * @name id
     * @type {number}
     * @constant
     * @instance
     * @memberof module:client.ClientElement
     */ $c7ebcb254e83329f$require$IdStamper.cloneId(this, data.id);
    }
    /**
   * Render the element. Really just updates the rotation and transformation
   * matrix.
   *
   * @param {CanvasRenderingContext2D} context
   * @param {module:client.ClientView} view
   */ draw(context, view) {
        const tl = new $c7ebcb254e83329f$require$Point2D(this.x - view.x, this.y - view.y).divideBy(this.scale).rotate(this.rotation);
        const rotate = `rotate(${view.rotation - this.rotation}rad) `;
        const scale = `scale(${this.scale * view.scale}) `;
        const translate = `translate(${tl.x}px, ${tl.y}px) `;
        this.element.style.transform = scale + rotate + translate;
    }
    /**
   * Sets attributes for the element.
   *
   * @param {object} attributes
   */ setAttributes(attributes) {
        this.attributes = attributes;
        Object.entries(attributes).forEach(([k, v])=>{
            this.element[k] = v;
        });
    }
    /**
   * Set parent ServerGroup for the element.
   *
   * @param {module:server:ServerGroup} parent server group for this element
   */ setParent(parent) {
        this.parent = parent;
    }
    /**
   * Removes attributes from the element.
   *
   * @param {string[]} attributes
   */ removeAttributes(attributes) {
        attributes.forEach((attr)=>{
            delete this.attributes[attr];
            this.element[attr] = null;
        });
    }
}
$c7ebcb254e83329f$exports = $c7ebcb254e83329f$var$ClientElement;


var $e838ba0c7b016947$exports = {};
"use strict";

var $e838ba0c7b016947$require$IdStamper = $f7c9fda677014379$exports.IdStamper;
var $e838ba0c7b016947$require$WamsImage = $f7c9fda677014379$exports.WamsImage;
var $e838ba0c7b016947$require$Message = $f7c9fda677014379$exports.Message;
/**
 * Abstraction of the requisite logic for generating an image object which will
 * load the appropriate image and report when it has finished loading the image
 * so that it can be displayed.
 *
 * @inner
 * @memberof module:client.ClientImage
 *
 * @param {string} src - Image source path.
 *
 * @returns {?Image}
 */ function $e838ba0c7b016947$var$createImage(src) {
    if (src) {
        const img = new Image();
        img.src = src;
        img.loaded = false;
        img.addEventListener("load", ()=>{
            img.loaded = true;
            document.dispatchEvent(new CustomEvent($e838ba0c7b016947$require$Message.IMG_LOAD));
        }, {
            once: true
        });
        return img;
    }
    return {};
}
/**
 * The ClientImage class exposes the draw() funcitonality of wams items.
 *
 * @extends module:shared.WamsImage
 * @memberof module:client
 *
 * @param {module:shared.Item} data - The data from the server describing this
 * item. Only properties explicity listed in the array passed to the
 * ReporterFactory when the Item class was defined will be accepted.
 */ class $e838ba0c7b016947$var$ClientImage extends $e838ba0c7b016947$require$WamsImage {
    constructor(data){
        super(data);
        /**
     * The image to render.
     *
     * @type {Image}
     */ this.image = {};
        if (data.src) this.setImage(data.src);
        /**
     * Id to make the items uniquely identifiable.
     *
     * @name id
     * @type {number}
     * @constant
     * @instance
     * @memberof module:client.ClientImage
     */ $e838ba0c7b016947$require$IdStamper.cloneId(this, data.id);
    }
    /**
   * Render the image onto the given context.
   *
   * @param {CanvasRenderingContext2D} context
   */ draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(-this.rotation);
        context.scale(this.scale, this.scale);
        if (this.image.loaded) context.drawImage(this.image, 0, 0, this.width, this.height);
        else {
            context.fillStyle = "darkgrey";
            context.fillRect(0, 0, this.width, this.height);
        }
        context.restore();
    }
    /**
   * Set parent ServerGroup for the image.
   *
   * @param {module:server:ServerGroup} parent server group for this image
   */ setParent(parent) {
        this.parent = parent;
    }
    /**
   * Sets the image path and loads the image.
   *
   * @param {string} path - The image's source path
   */ setImage(path) {
        this.src = path;
        this.image = $e838ba0c7b016947$var$createImage(path);
    }
}
$e838ba0c7b016947$exports = $e838ba0c7b016947$var$ClientImage;


var $db020a089873f50a$exports = {};
"use strict";

var $db020a089873f50a$require$IdStamper = $f7c9fda677014379$exports.IdStamper;
var $db020a089873f50a$require$Item = $f7c9fda677014379$exports.Item;
var $ddebf7b2627b0ede$exports = {};
/*
 * Access point for npm.
 */ "use strict";
/*
 * Author: Michael van der Kamp
 * Date: July/August, 2018
 *
 * This file provides the definition of the CanvasSequence class.
 */ "use strict";
/*
 * Author: Michael van der Kamp
 * Date: July/August, 2018
 *
 * This file defines the low level 'CanvasAtom' for use by a CanvasSequence.
 *
 * A CanvasAtom is a unit of execution in a CanvasSequence. It comes in two
 * flavours: one for describing a method call, one for describing a property
 * assignment.
 */ "use strict";
/*
 * Author: Michael van der Kamp
 * Date: July/August, 2018
 *
 * Thie file provides the definition of the CanvasBlueprint class.
 *
 * A CanvasBlueprint is similar to a plain CanvasSequence, except that it
 * accepts tag strings as arguments, and before it can be executed it  needs to
 * be 'built' with an object defining which values should replace the tags.
 */ "use strict";
var $ddebf7b2627b0ede$var$$663f930907ca9f24$exports = {};
var $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$exports = {};
/**
 * The types of CanvasAtoms that are available.
 *
 * @enum {string}
 * @readonly
 * @lends CanvasAtom
 */ const $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$TYPES = {
    /** @const */ METHOD: "method",
    /** @const */ PROPERTY: "property"
};
/**
 * Internal common constructor definition for Canvas Atoms.
 *
 * @param {string} inst - The canvas context instruction.
 * @param {*[]} args - The arguments to the instruction.
 */ class $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$Atom {
    constructor(inst, args){
        /**
     * The canvas context instruction.
     *
     * @private
     * @type {string}
     */ this.inst = inst;
        /**
     * The arguments to the instruction.
     *
     * @private
     * @type {*[]}
     */ this.args = args;
    }
}
/**
 * A MethodCanvasAtom is used for canvas context methods. The arguments will be
 * treated as an actual array, all of which will be passed to the method when
 * the atom is executed.
 *
 * @extends Atom
 */ class $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$MethodCanvasAtom extends $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$Atom {
    constructor(inst, args){
        super(inst, args);
        /**
     * The type of atom.
     *
     * @private
     * @type {string}
     */ this.type = $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$TYPES.METHOD;
    }
    /**
   * Execute the atom on the given context.
   *
   * @param {CanvasRenderingContext2D} context
   */ execute(context) {
        context[this.inst](...this.args);
    }
}
/**
 * A PropertyCanvasAtom is used for canvas context properties (a.k.a. fields).
 * Only the first argument will be used, and will be the value assigned to the
 * field.
 *
 * @extends Atom
 */ class $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$PropertyCanvasAtom extends $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$Atom {
    constructor(inst, args){
        super(inst, args);
        this.type = $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$TYPES.PROPERTY;
    }
    /**
   * Execute the atom on the given context.
   *
   * @param {CanvasRenderingContext2D} context
   */ execute(context) {
        context[this.inst] = this.args[0];
    }
}
/*
 * This object is for demultiplexing types in the CanvasAtom constructor.
 * Defined outside the constructor so it doesn't need to be redefined every
 * time a new atom is constructed. Defined outside the class so that it is not
 * externally exposed.
 */ const $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$atomOf = {
    [$ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$TYPES.METHOD]: $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$MethodCanvasAtom,
    [$ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$TYPES.PROPERTY]: $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$PropertyCanvasAtom
};
/**
 * The exposed CanvasAtom class. Results in the instantiation of either a
 * MethodCanvasAtom or a PropertyCanvasAtom, depending on the given type.
 *
 * @param {string} type - Either CanvasAtom.METHOD or CanvasAtom.PROPERTY.
 * @param {string} inst - The canvas context instruction.
 * @param {*[]} args - The arguments to the instruction.
 */ class $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$CanvasAtom {
    constructor(type, inst, args){
        return new $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$atomOf[type](inst, args);
    }
}
/*
 * Define the types once locally, but make them available externally as
 * immutable properties on the class.
 */ Object.entries($ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$TYPES).forEach(([p, v])=>{
    Object.defineProperty($ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$CanvasAtom, p, {
        value: v,
        configurable: false,
        enumerable: true,
        writable: false
    });
});
$ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$exports = $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$var$CanvasAtom;
const $ddebf7b2627b0ede$var$$663f930907ca9f24$var$locals = Object.freeze({
    METHODS: [
        "addHitRegion",
        "arc",
        "arcTo",
        "beginPath",
        "bezierCurveTo",
        "clearHitRegions",
        "clearRect",
        "clip",
        "closePath",
        "drawFocusIfNeeded",
        "drawImage",
        "ellipse",
        "fill",
        "fillRect",
        "fillText",
        "lineTo",
        "moveTo",
        "putImageData",
        "quadraticCurveTo",
        "rect",
        "removeHitRegion",
        "resetTransform",
        "restore",
        "rotate",
        "save",
        "scale",
        "scrollPathIntoView",
        "setLineDash",
        "setTransform",
        "stroke",
        "strokeRect",
        "strokeText",
        "transform",
        "translate", 
    ],
    PROPERTIES: [
        "direction",
        "fillStyle",
        "filter",
        "font",
        "globalAlpha",
        "globalCompositeOperation",
        "imageSmoothingEnabled",
        "imageSmoothingQuality",
        "lineCap",
        "lineDashOffset",
        "lineJoin",
        "lineWidth",
        "miterLimit",
        "shadowBlur",
        "shadowColor",
        "shadowOffsetX",
        "shadowOffsetY",
        "strokeStyle",
        "textAlign",
        "textBaseline", 
    ]
});
// Mark properties as intended for internal use.
const $ddebf7b2627b0ede$var$$663f930907ca9f24$var$symbols = Object.freeze({
    sequence: Symbol.for("sequence"),
    push: Symbol.for("push"),
    fromJSON: Symbol.for("fromJSON")
});
/**
 * A CanvasSequence is a linear collection of CanvasAtoms, capable of being
 * executed on a CanvasRenderingContext2D.
 *
 * @param {CanvasSequence} [data=null] - An unrevived (i.e. freshly transmitted)
 * CanvasSequence. If present, the constructor revives the sequence. Note that
 * an already revived CanvasSequence cannot be used as the argument here.
 */ class $ddebf7b2627b0ede$var$$663f930907ca9f24$var$CanvasSequence {
    constructor(data = null){
        /**
     * The CanvasAtoms that form the sequence.
     *
     * @private
     * @type {CanvasAtom[]}
     */ this[$ddebf7b2627b0ede$var$$663f930907ca9f24$var$symbols.sequence] = [];
        // If data is present, assume it is a CanvasSequence that needs reviving.
        if (data) this[$ddebf7b2627b0ede$var$$663f930907ca9f24$var$symbols.fromJSON](data);
    }
    /**
   * Revive the sequence from transmitted JSON data.
   *
   * @private
   * @param {CanvasSequence} [data={}]
   */ [$ddebf7b2627b0ede$var$$663f930907ca9f24$var$symbols.fromJSON](data = {
        sequence: []
    }) {
        data.sequence.forEach(({ type: type , inst: inst , args: args  })=>{
            this[$ddebf7b2627b0ede$var$$663f930907ca9f24$var$symbols.push](type, inst, args);
        });
    }
    /**
   * Push a new CanvasAtom onto the end of the sequence.
   *
   * @private
   * @param {string} type - The type of CanvasAtom to push.
   * @param {string} inst - The canvas context instruction.
   * @param {*[]} args - The arguments to the canvas context instruction.
   */ [$ddebf7b2627b0ede$var$$663f930907ca9f24$var$symbols.push](type, inst, args) {
        this[$ddebf7b2627b0ede$var$$663f930907ca9f24$var$symbols.sequence].push(new $ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$exports(type, inst, args));
    }
    /**
   * Execute the sequence on the given context.
   *
   * @param {CanvasRenderingContext2D} context
   */ execute(context) {
        context.save();
        this[$ddebf7b2627b0ede$var$$663f930907ca9f24$var$symbols.sequence].forEach((a)=>a.execute(context));
        context.restore();
    }
    /**
   * Export a JSON serialized version of the sequence, ready for transmission.
   *
   * @return {CanvasSequence} In JSON serialized form.
   */ toJSON() {
        return {
            sequence: this[$ddebf7b2627b0ede$var$$663f930907ca9f24$var$symbols.sequence]
        };
    }
}
$ddebf7b2627b0ede$var$$663f930907ca9f24$var$locals.METHODS.forEach((m)=>{
    Object.defineProperty($ddebf7b2627b0ede$var$$663f930907ca9f24$var$CanvasSequence.prototype, m, {
        value: function pushMethodCall(...args) {
            this[$ddebf7b2627b0ede$var$$663f930907ca9f24$var$symbols.push]($ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$exports.METHOD, m, args);
        },
        writable: false,
        enumerable: true,
        configurable: false
    });
});
$ddebf7b2627b0ede$var$$663f930907ca9f24$var$locals.PROPERTIES.forEach((p)=>{
    Object.defineProperty($ddebf7b2627b0ede$var$$663f930907ca9f24$var$CanvasSequence.prototype, p, {
        get () {
            throw `Invalid canvas sequencer interaction, cannot get ${p}.`;
        },
        set (v) {
            this[$ddebf7b2627b0ede$var$$663f930907ca9f24$var$symbols.push]($ddebf7b2627b0ede$var$$9a8fdc9f7382f5d6$exports.PROPERTY, p, [
                v
            ]);
        },
        enumerable: true,
        configurable: false
    });
});
$ddebf7b2627b0ede$var$$663f930907ca9f24$exports = $ddebf7b2627b0ede$var$$663f930907ca9f24$var$CanvasSequence;
var $ddebf7b2627b0ede$var$$4fabbdeef1f2d4ae$exports = {};
// Mark properties as intended for internal use.
const $ddebf7b2627b0ede$var$$4fabbdeef1f2d4ae$var$symbols = Object.freeze({
    sequence: Symbol.for("sequence"),
    push: Symbol.for("push")
});
/**
 * Replace tags in the given string with correlated value in values.
 *
 * Rules:
 * - Strings not surrounded by curly braces {} will be returned.
 * - Strings surrounded by curly braces but not corresponding to a property on
 *   'values' will result in a string without the curly braces being returned.
 * - Strings surrounded by curly braces, with the inner string corresponding to
 *   a property on 'values' will result in the corresponding value being
 *   returned.
 *
 * @inner
 * @private
 *
 * @param {string} str
 * @param {object} values
 *
 * @return {string|mixed} Either the original string if no replacement was
 * performed, or the appropriate value.
 */ function $ddebf7b2627b0ede$var$$4fabbdeef1f2d4ae$var$replaceTags(str, values) {
    const tag = str.replace(/^\{|\}$/gu, "");
    if (tag !== str) return values.hasOwnProperty(tag) ? values[tag] : tag;
    return str;
}
/**
 * A CanvasBlueprint is a rebuildable CanvasSequence. It accepts tagged
 * arguments. When built, tags will be replaced using properties from a provided
 * object.
 *
 * @extends CanvasSequence
 */ class $ddebf7b2627b0ede$var$$4fabbdeef1f2d4ae$var$CanvasBlueprint extends $ddebf7b2627b0ede$var$$663f930907ca9f24$exports {
    /**
   * Build the blueprint using the provided values.
   *
   * Rules:
   * - Strings not surrounded by curly braces {} will be returned.
   * - Strings surrounded by curly braces but not corresponding to a property on
   *   'values' will result in a string without the curly braces being returned.
   * - Strings surrounded by curly braces, with the inner string corresponding
   *   to a property on 'values' will result in the corresponding value being
   *   returned.
   *
   * @param {object} values - The values with which to construct the sequence.
   *
   * @return {CanvasSequence} The constructed sequence.
   */ build(values = {}) {
        const seq = new $ddebf7b2627b0ede$var$$663f930907ca9f24$exports();
        this[$ddebf7b2627b0ede$var$$4fabbdeef1f2d4ae$var$symbols.sequence].forEach(({ type: type , inst: inst , args: args  })=>{
            const realArgs = args.map((v)=>{
                return typeof v === "string" ? $ddebf7b2627b0ede$var$$4fabbdeef1f2d4ae$var$replaceTags(v, values) : v;
            });
            seq[$ddebf7b2627b0ede$var$$4fabbdeef1f2d4ae$var$symbols.push](type, inst, realArgs);
        });
        return seq;
    }
    /**
   * CanvasBlueprints cannot be directly executed!
   *
   * @throws TypeError
   */ execute() {
        throw new TypeError("Cannot execute a blueprint.");
    }
}
$ddebf7b2627b0ede$var$$4fabbdeef1f2d4ae$exports = $ddebf7b2627b0ede$var$$4fabbdeef1f2d4ae$var$CanvasBlueprint;
$ddebf7b2627b0ede$exports = {
    CanvasSequence: $ddebf7b2627b0ede$var$$663f930907ca9f24$exports,
    CanvasBlueprint: $ddebf7b2627b0ede$var$$4fabbdeef1f2d4ae$exports
};


var $db020a089873f50a$require$CanvasSequence = $ddebf7b2627b0ede$exports.CanvasSequence;
/**
 * The ClientItem class exposes the draw() funcitonality of wams items.
 *
 * @extends module:shared.Item
 * @memberof module:client
 *
 * @param {module:shared.Item} data - The data from the server describing this
 * item. Only properties explicity listed in the array passed to the
 * ReporterFactory when the Item class was defined will be accepted.
 */ class $db020a089873f50a$var$ClientItem extends $db020a089873f50a$require$Item {
    constructor(data){
        super(data);
        /**
     * The actual render.
     *
     * @type {CanvasSequence}
     */ this.render = null;
        if (data.sequence) this.setRender(data.sequence);
        /**
     * Id to make the items uniquely identifiable.
     *
     * @name id
     * @type {number}
     * @constant
     * @instance
     * @memberof module:client.ClientItem
     */ $db020a089873f50a$require$IdStamper.cloneId(this, data.id);
    }
    /**
   * Render the item onto the given context.
   *
   * @param {CanvasRenderingContext2D} context
   */ draw(context) {
        if (this.render) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(-this.rotation);
            context.scale(this.scale, this.scale);
            this.render.execute(context);
            context.restore();
        }
    }
    /**
   * Set parent ServerGroup for the item.
   *
   * @param {module:server:ServerGroup} parent server group for this item
   */ setParent(parent) {
        this.parent = parent;
    }
    /**
   * Set the item's canvas rendering sequence.
   *
   * @param {CanvasSequence} sequence - Raw, unrevived CanvasSequence.
   */ setRender(sequence) {
        this.render = new $db020a089873f50a$require$CanvasSequence(sequence);
    }
}
$db020a089873f50a$exports = $db020a089873f50a$var$ClientItem;


var $f4c284cef82cb94a$exports = {};
/*
 * SOME NOTES ABOUT CANVAS RENDERING:
 *  - Avoid using shadows. They appear to kill the framerate.
 */ "use strict";

var $f4c284cef82cb94a$require$colours = $f7c9fda677014379$exports.colours;
var $f4c284cef82cb94a$require$IdStamper = $f7c9fda677014379$exports.IdStamper;
var $f4c284cef82cb94a$require$View = $f7c9fda677014379$exports.View;
// Symbols to mark these methods as intended for internal use only.
const $f4c284cef82cb94a$var$symbols = Object.freeze({
    align: Symbol("align"),
    style: Symbol("style"),
    outline: Symbol("outline"),
    marker: Symbol("marker")
});
/**
 * The ShadowView class exposes a simple draw() function which renders a shadowy
 * outline of the view onto the canvas.
 *
 * @extends module:shared.View
 * @memberof module:client
 *
 * @param {module:shared.View} values - server-provided data describing this
 * view.
 */ class $f4c284cef82cb94a$var$ShadowView extends $f4c284cef82cb94a$require$View {
    constructor(values){
        super(values);
        $f4c284cef82cb94a$require$IdStamper.cloneId(this, values.id);
    }
    /**
   * Render an outline of this view.
   *
   * @param {CanvasRenderingContext2D} context - context on which to draw.
   */ draw(context) {
        /*
     * WARNING: It is *crucial* that this series of instructions be wrapped in
     * save() and restore().
     */ context.save();
        this[$f4c284cef82cb94a$var$symbols.align](context);
        this[$f4c284cef82cb94a$var$symbols.style](context);
        this[$f4c284cef82cb94a$var$symbols.outline](context);
        this[$f4c284cef82cb94a$var$symbols.marker](context);
        context.restore();
    }
    /**
   * Aligns the drawing context so the outline will be rendered in the correct
   * location with the correct orientation.
   *
   * @alias [@@align]
   * @memberof module:client.ShadowView
   *
   * @param {CanvasRenderingContext2D} context - context on which to draw.
   */ [$f4c284cef82cb94a$var$symbols.align](context) {
        context.translate(this.x, this.y);
        context.rotate(-this.rotation);
        context.scale(1 / this.scale, 1 / this.scale);
    }
    /**
   * Applies styling to the drawing context.
   *
   * @alias [@@style]
   * @memberof module:client.ShadowView
   *
   * @param {CanvasRenderingContext2D} context - context on which to draw.
   */ [$f4c284cef82cb94a$var$symbols.style](context) {
        context.globalAlpha = 0.5;
        context.strokeStyle = $f4c284cef82cb94a$require$colours[this.id % $f4c284cef82cb94a$require$colours.length];
        context.fillStyle = context.strokeStyle;
        context.lineWidth = 5;
    }
    /**
   * Draws an outline of the view.
   *
   * @alias [@@outline]
   * @memberof module:client.ShadowView
   */ [$f4c284cef82cb94a$var$symbols.outline](context) {
        context.strokeRect(0, 0, this.width, this.height);
    }
    /**
   * Draws a small triangle in the upper-left corner of the outline, so that
   * other views can quickly tell which way this view is oriented.
   *
   * @alias [@@marker]
   * @memberof module:client.ShadowView
   *
   * @param {CanvasRenderingContext2D} context - context on which to draw.
   */ [$f4c284cef82cb94a$var$symbols.marker](context) {
        const base = context.lineWidth / 2;
        const height = 25;
        context.beginPath();
        context.moveTo(base, base);
        context.lineTo(base, height);
        context.lineTo(height, base);
        context.lineTo(base, base);
        context.fill();
    }
}
$f4c284cef82cb94a$exports = $f4c284cef82cb94a$var$ShadowView;



var $3da2dd796d6955de$require$removeById = $f7c9fda677014379$exports.removeById;
const $3da2dd796d6955de$var$REQUIRED_DATA = Object.freeze([
    "id",
    "items",
    "views"
]);
/**
 * The ClientModel is a client-side copy of those aspects of the model that are
 * necessary for rendering the view for the user.
 *
 * @memberof module:client
 */ class $3da2dd796d6955de$var$ClientModel {
    constructor(root){
        /**
     * Root element where WAMS canvas and HTML elements are located.
     *
     * @type {Element}
     */ // eslint-disable-next-line
        this.rootElement = root;
        /**
     * All the items in the model, which may all need rendering at some point.
     * Kept up to date via the ClientController.
     *
     * @type {Map.<module:client.ClientItem>}
     */ this.items = new Map();
        /**
     * An ordered list of the items, so that the render order can accurately
     * match the order on the server, and be adjusted likewise.
     *
     * @type {module:client.ClientItem[]}
     */ this.itemOrder = [];
        /**
     * The shadows are all the other views that are currently active. They are
     * tracked in full and an outline for each is rendered.
     *
     * @type {Map.<module:client.ShadowView>}
     */ this.shadows = new Map();
        /**
     * The view data for this user.
     *
     * @type {module:client.ClientView}
     */ this.view = null;
    }
    /**
   * Generate and store an item of the given type.
   *
   * @param {function} ClassFn
   * @param {object} values
   */ addObject(ClassFn, values) {
        const object = new ClassFn(values);
        this.itemOrder.push(object);
        this.items.set(object.id, object);
    }
    /**
   * Generate and store an Element with the given values.
   *
   * @param {module:shared.WamsElement} values - State of the new Element
   */ addElement(values) {
        this.addObject($c7ebcb254e83329f$exports, values);
    }
    /**
   * Generate and store an Image with the given values.
   *
   * @param {module:shared.WamsImage} values - State of the new image.
   */ addImage(values) {
        this.addObject($e838ba0c7b016947$exports, values);
    }
    /**
   * Generate and store an Item with the given values.
   *
   * @param {module:shared.Item} values - State of the new Item.
   */ addItem(values) {
        this.addObject($db020a089873f50a$exports, values);
    }
    /**
   * Generate and store a 'shadow view' to track another active view.
   *
   * @param {module:shared.View} values - State of the new View.
   */ addShadow(values) {
        const shadow = new $f4c284cef82cb94a$exports(values);
        this.shadows.set(shadow.id, shadow);
    }
    /**
   * Removes the given item.
   *
   * @param {module:shared.Item} item - The Item to remove.
   *
   * @return {boolean} true if removal was successful, false otherwise.
   */ removeItem(item) {
        const obj = this.items.get(item.id);
        if (Object.prototype.hasOwnProperty.call(obj, "tagname")) this.rootElement.removeChild(obj.element);
        this.items.delete(item.id);
        return $3da2dd796d6955de$require$removeById(this.itemOrder, item);
    }
    /**
   * Removes the given 'shadow' view.
   *
   * @param {module:shared.View} shadow - The 'shadow' view to remove.
   *
   * @return {boolean} true if removal was successful, false otherwise.
   */ removeShadow(shadow) {
        return this.shadows.delete(shadow.id);
    }
    /**
   * Set up the internal copy of the model according to the data provided by the
   * server.
   *
   * @param {module:shared.FullStateReporter} data - The data from the server
   *       detailing the current state of the model.  See REQUIRED_DATA. If any
   *       is missing, something has gone terribly wrong, and an exception will
   *       be thrown.
   */ setup(data) {
        $3da2dd796d6955de$var$REQUIRED_DATA.forEach((d)=>{
            if (!Object.prototype.hasOwnProperty.call(data, d)) throw Error(`setup requires: ${d}`);
        });
        data.views.forEach((v)=>v.id !== this.view.id && this.addShadow(v));
        data.items.reverse().forEach((o)=>{
            if (Object.prototype.hasOwnProperty.call(o, "src")) this.addImage(o);
            else if (Object.prototype.hasOwnProperty.call(o, "tagname")) this.addElement(o);
            else this.addItem(o);
        });
        this.view.config.shadows = data.shadows;
        this.view.config.status = data.status;
        this.view.config.backgroundImage = data.backgroundImage;
    }
    /**
   * Bring item to top, so that it's above others.
   *
   */ bringItemToTop(id) {
        const index = this.itemOrder.findIndex((el)=>el.id === id);
        this.itemOrder.push(...this.itemOrder.splice(index, 1));
    }
    /**
   * Call the given method with the given property of 'data' on the item with id
   * equal to data.id.
   *
   * @param {string} fnName
   * @param {string} property
   * @param {object} data
   */ setItemValue(fnName, property, data) {
        if (this.items.has(data.id)) this.items.get(data.id)[fnName](data[property]);
    }
    /**
   * Set the attributes for the appropriate item.
   *
   * @param {object} data
   */ setAttributes(data) {
        this.setItemValue("setAttributes", "attributes", data);
    }
    setParent(data) {
        this.setItemValue("setParent", "parent", data);
    }
    /**
   * Set the image for the appropriate item.
   *
   * @param {object} data
   */ setImage(data) {
        this.setItemValue("setImage", "src", data);
    }
    /**
   * Set the canvas rendering sequence for the appropriate item.
   *
   * @param {object} data
   */ setRender(data) {
        this.setItemValue("setRender", "sequence", data);
    }
    /**
   * Intended for use as an internal helper function, so that this functionality
   * does not need to be defined twice for both of the items and shadows arrays.
   *
   * @param {string} container - Name of the ClientView property defining the
   * array which contains the object to update.
   * @param {( module:shared.Item | module:shared.View )} data - Data with which
   * an object in the container will be updated.  Note that the object is
   * located using an 'id' field on this data object.
   */ update(container, data) {
        if (this[container].has(data.id)) {
            this[container].get(data.id).assign(data);
            if (container === "items") {
                const item = this[container].get(data.id);
                if (!item.lockZ) this.bringItemToTop(data.id);
            }
        } else console.warn(`Unable to find in ${container}: id: `, data.id);
    }
    /**
   * Update an item.
   *
   * @param {module:shared.Item} data - data from the server, has an 'id' field
   * with which the item will be located.
   */ updateItem(data) {
        this.update("items", data);
    }
    /**
   * Update a 'shadow' view.
   *
   * @param {module:shared.View} data - data from the server, has an 'id' field
   * with which the view will be located.
   */ updateShadow(data) {
        this.update("shadows", data);
    }
    /**
   * Update the view.
   *
   * @param {module:shared.View} data - data from the server, specficially
   * pertaining to this client's view.
   */ updateView(data) {
        this.view.assign(data);
    }
    /**
   * Dispatch custom DOM event to trigger user defined action
   *
   * @param {object} event - event data, contains `action` and `payload`
   */ dispatch(event) {
        document.dispatchEvent(new CustomEvent(event.action, {
            detail: event.payload
        }));
    }
}
$3da2dd796d6955de$exports = $3da2dd796d6955de$var$ClientModel;


var $3fda7b6608242a6b$exports = {};
"use strict";

var $3fda7b6608242a6b$require$View = $f7c9fda677014379$exports.View;
// Data fields to write for status indicator text.
const $3fda7b6608242a6b$var$STATUS_KEYS = Object.freeze([
    "x",
    "y",
    "width",
    "height",
    "rotation",
    "scale"
]);
// Mark these methods as intended only for internal use.
const $3fda7b6608242a6b$var$symbols = Object.freeze({
    align: Symbol("align"),
    drawBackground: Symbol("dragBackground"),
    drawItems: Symbol("drawItems"),
    drawShadows: Symbol("drawShadows"),
    drawStatus: Symbol("drawStatus"),
    wipe: Symbol("wipe")
});
// Default ClientView configuration.
const $3fda7b6608242a6b$var$DEFAULT_CONFIG = Object.freeze({
    showStatus: false,
    shadows: false
});
/**
 * The ClientView is responsible for rendering the view. To do this, it keeps
 * track of its own position, scale, and orientation, as well as those values
 * for all items and all other views (which will be represented with outlines).
 *
 * @extends module:shared.View
 * @memberof module:client
 *
 * @param {CanvasRenderingContext2D} context - The canvas context in which to
 * render the model.
 */ class $3fda7b6608242a6b$var$ClientView extends $3fda7b6608242a6b$require$View {
    constructor(context, dpr, properties = {}){
        super({
            ...$3fda7b6608242a6b$var$ClientView.DEFAULTS,
            ...properties
        });
        /**
     * The CanvasRenderingContext2D is required for drawing (rendering) to take
     * place.
     *
     * @type {CanvasRenderingContext2D}
     */ this.context = context;
        /**
     * The model holds the information about items and shadows that need
     * rendering.
     *
     * @type {module:client.ClientModel}
     */ this.model = null;
        /**
     * Id to make the views uniquely identifiable. Will be assigned when setup
     * message is received from server.
     *
     * @name id
     * @type {number}
     * @constant
     * @instance
     * @memberof module:client.ClientView
     */ this.id = null;
        /**
     * Device pixel ratio. Should be window.devicePixelRatio or 1.
     *
     * @type {number}
     */ this.dpr = dpr || 1;
        /**
     * Configuration of ClientView that can be
     * modified in user-defined `window.WAMS_CONFIG`.
     *
     * @type {object}
     */ this.config = {
            ...$3fda7b6608242a6b$var$DEFAULT_CONFIG
        };
    }
    /**
   * Positions the rendering context precisely, taking into account all
   * transformations, so that rendering can proceed correctly.
   *
   * @alias [@@align]
   * @memberof module:client.ClientView
   */ [$3fda7b6608242a6b$var$symbols.align]() {
        /*
     * WARNING: It is crucially important that the instructions below occur
     * in *precisely* this order!
     */ this.context.scale(this.scale, this.scale);
        this.context.rotate(this.rotation);
        this.context.translate(-this.x, -this.y);
    }
    /**
   * Renders all the items.
   *
   * @alias [@@drawItems]
   * @memberof module:client.ClientView
   */ [$3fda7b6608242a6b$var$symbols.drawItems]() {
        this.model.itemOrder.forEach((o)=>o.draw(this.context, this));
    }
    /**
   * Renders outlines of all the other views.
   *
   * @alias [@@drawShadows]
   * @memberof module:client.ClientView
   */ [$3fda7b6608242a6b$var$symbols.drawShadows]() {
        this.model.shadows.forEach((v)=>v.draw(this.context));
    }
    /**
   * Renders text describing the status of the view to the upper left corner of
   * the view, to assist with debugging.
   *
   * @alias [@@drawShadows]
   * @memberof module:client.ClientView
   */ [$3fda7b6608242a6b$var$symbols.drawStatus]() {
        const messages = $3fda7b6608242a6b$var$STATUS_KEYS.map((k)=>`${k}: ${this[k].toFixed(2)}`).concat([
            `# of Shadows: ${this.model.shadows.size}`, 
        ]);
        let ty = 40;
        const tx = 20;
        this.context.save();
        this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.context.font = "18px Georgia";
        messages.forEach((m)=>{
            this.context.fillText(m, tx, ty);
            ty += 20;
        });
        this.context.restore();
    }
    /**
   * Clears all previous renders, to ensure a clean slate for the upcoming
   * render.
   *
   * @alias [@@wipe]
   * @memberof module:client.ClientView
   */ [$3fda7b6608242a6b$var$symbols.wipe]() {
        this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    /**
   * Fully render the current state of the system.
   */ draw() {
        this.context.save();
        this[$3fda7b6608242a6b$var$symbols.wipe]();
        this[$3fda7b6608242a6b$var$symbols.align]();
        this[$3fda7b6608242a6b$var$symbols.drawItems]();
        if (this.config.shadows) this[$3fda7b6608242a6b$var$symbols.drawShadows]();
        if (this.config.status) this[$3fda7b6608242a6b$var$symbols.drawStatus]();
        this.context.restore();
    }
    /**
   * Specify the width and height of the view.
   */ resize(width, height) {
        this.width = width;
        this.height = height;
    }
}
$3fda7b6608242a6b$exports = $3fda7b6608242a6b$var$ClientView;


class $08a42d941226db63$var$ClientApplication {
    constructor(controller){
        this.controller = controller;
    }
    on(event, func) {
        // listen for this DOM event
        document.addEventListener(event, func);
        this.controller.eventListeners.push(event);
        // if this event was called before this code executed, dispatch it again
        this.controller.eventQueue.forEach((ev)=>{
            if (ev.action === event) document.dispatchEvent(new CustomEvent(event, {
                detail: ev.payload
            }));
        });
        // Remove events from the queue that have been dispatched.
        this.controller.eventQueue = this.controller.eventQueue.filter((ev)=>ev.action !== event);
    }
    dispatch(event, func) {
        this.controller.dispatch(event, func);
    }
}
function $08a42d941226db63$var$run() {
    document.addEventListener("contextmenu", (e)=>e.preventDefault());
    const root = document.querySelector("#root");
    if (!root) throw Error("No root element was found on the page.");
    const canvas = document.querySelector("canvas");
    if (!canvas) throw Error("No canvas element was found on the page.");
    const context = canvas.getContext("2d");
    const iOS = /iPad|iPhone|iPod|Apple/.test(window.navigator.platform);
    const dpr = iOS ? 1 : window.devicePixelRatio || 1;
    if (!iOS) context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const model = new $3da2dd796d6955de$exports(root);
    const view = new $3fda7b6608242a6b$exports(context, dpr, {
        width: canvas.width,
        height: canvas.height
    });
    const controller = new $e307541a347955a1$exports(root, canvas, view, model);
    window.WAMS = new $08a42d941226db63$var$ClientApplication(controller);
    model.view = view;
    view.model = model;
    controller.connect();
}
window.addEventListener("load", $08a42d941226db63$var$run, {
    capture: false,
    once: true,
    passive: true
});

})();
//# sourceMappingURL=client.js.map
