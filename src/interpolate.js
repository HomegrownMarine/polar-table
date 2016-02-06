var _ = require('lodash');

/**
*
*/
function bilinearInterpolate(data) {
    //pull out 'from' dimension for quicker lookup below
    var froms = _.map(data, function(d){ return d[0]; });

    return function(from) {

        //TODO: why .001?
        var i = _.sortedIndex(froms, from+0.001) || 1;
            
        var nextFrom = data[i][0];
        var previousFrom = data[i - 1][0];
        var nextTo = data[i][1];
        var previousTo = data[i-1][1];

        var percentFirst = 1 - (from - previousFrom) / (nextFrom - previousFrom);
        var interpolatedValue = percentFirst * previousTo + (1 - percentFirst) * nextTo;
        
        return interpolatedValue;
    };
}

module.exports = bilinearInterpolate;