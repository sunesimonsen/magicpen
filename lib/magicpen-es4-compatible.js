/*global namespace*/
(function () {
    namespace.shim = {
        getKeys: function (obj) {
            var result = [];

            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    result.push(i);
                }
            }

            return result;
        },

        forEach: function (arr, callback, that) {
            for (var i = 0, n = arr.length; i < n; i += 1)
                if (i in arr)
                    callback.call(that, arr[i], i, arr);
        },

        map: function (arr, mapper, that) {
            var other = new Array(arr.length);

            for (var i = 0, n = arr.length; i < n; i += 1)
                if (i in arr)
                    other[i] = mapper.call(that, arr[i], i, arr);

            return other;
        },

        filter: function (arr, predicate) {
            var length = +arr.length;

            var result = [];

            if (typeof predicate !== "function")
                throw new TypeError();

            for (var i = 0; i < length; i += 1) {
                var value = arr[i];
                if (predicate(value)) {
                    result.push(value);
                }
            }

            return result;
        }
    };
}());
