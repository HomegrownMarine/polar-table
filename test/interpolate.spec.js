var assert = require('chai').assert;

describe('bilinearInterpolate', function() {
    var interpl = require('../src/interpolate.js');

    var d = [[4, 45.5], [5, 44.6], [6, 43.3], [7, 42.1], [8, 40.4], [9, 38.6], [10, 37.2], [11, 36.2], [12, 35.7], [13, 34.9], [14, 34.5], [15, 33.8], [16, 34.1], [17, 33.8], [18, 33.9], [19, 33.8], [20, 34.1], [21, 34.4], [22, 34.6], [23, 34.9], [24, 35.3], [25, 35.6], [26, 36.1], [27, 36.4], [28, 36.8], [29, 37.8], [30, 38], [35, 42]];

    var up = interpl(d);

    it(' should work', function() {
        assert.equal(up(4), 45.5);
        assert.equal(up(4.5), 45.05);
        assert.equal(up(5), 44.6);
    });
});