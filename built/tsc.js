System.register("test", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var a;
    return {
        setters: [],
        execute: function () {
            a = 1;
            exports_1("t", a);
        }
    };
});
var b = 'ABC';
