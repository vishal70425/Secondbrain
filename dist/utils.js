"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = random;
function random(len) {
    var options = "kncownvwoivnwiocqooen1134243211";
    var optionsLen = options.length;
    var result = "";
    for (var i = 0; i < len; i++) {
        var idx = Math.floor(Math.random() * optionsLen);
        result += options.charAt(idx);
    }
    return result;
}
