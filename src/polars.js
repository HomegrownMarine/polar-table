//! polar-table.js
//! calculate polar targets based on tws.
//! version : 0.1
//! homegrownmarine.com



(function() {
    "use strict";

    var init = function(exports, _) {
        function PolarTable(allData, targets) {
            this.all = allData || {};
            this.targets = targets || {
                'up': {},
                'down': {}
            };

            this.init();
        }

        PolarTable.prototype.init = function() {
            this.twsspeeds = {};
            this.twsspeeds.up = _.keys(this.targets.up);
            this.twsspeeds.down = _.keys(this.targets.down);
        };

        PolarTable.prototype.getInterpolatedValue = function(tws, key, upwind) {
            var appropriateTargets = this.targets[upwind ? 'up' : 'down'];
            var twspeeds = this.twsspeeds[upwind ? 'up' : 'down'];

            var found = [0, 0];
            var i = _.sortedIndex(twspeeds, tws+.001) || 1;
            found[1] = twspeeds[i];
            found[0] = twspeeds[i - 1];

            var percentFirst = 1 - (tws - found[0]) / (found[1] - found[0]);
            var interpolatedValue = percentFirst * appropriateTargets[found[0]][key] + (1 - percentFirst) * appropriateTargets[found[1]][key];
            return interpolatedValue;
        };


        var cachedLookup = function(dimension) {
            var cache = {
                'up': {},
                'down': {}
            };

            return function(tws, upwind) {
                var twshunds = Math.round(tws * 100);
                var valueCache = cache[upwind ? 'up' : 'down'];
                if ( !(twshunds in valueCache) ) {
                    valueCache[twshunds] = this.getInterpolatedValue(tws, dimension, upwind);
                }
                return valueCache[twshunds];
            };
        }
        
        PolarTable.prototype.targetSpeed = cachedLookup('speed');
        PolarTable.prototype.targetAngle = cachedLookup('twa');
        PolarTable.prototype.targetHeel = cachedLookup('heel');

        exports.PolarTable = PolarTable;
        return PolarTable;
    };

    var localExports;
    if (typeof exports != 'undefined') {
        localExports = exports;
    } else if (typeof module !== 'undefined' && module.exports) {
        localExports = module.exports;
    } else {
        localExports = window;
    }


    var local_;
    if (typeof _ != 'undefined') {
        local_ = _;
    } else if (typeof require != 'undefined') {
        local_ = require('lodash');
    }

    var PolarTable = init(localExports, local_);

    // if require exists, assume we're running in node
    // and add filesystem based factory
    if (typeof require != 'undefined') {
        var fs = require('fs');
        var readline = require('readline');

        //creates polarTable from filename
        PolarTable.fromTSV = function(filename, callback) {

            var polars = new PolarTable();

            var rd = readline.createInterface({
                input: fs.createReadStream(filename),
                output: process.stdout,
                terminal: false
            });

            rd.on('line', function(line) {
                line = line.trim();
                if (line.length === 0 || line.indexOf('#') === 0) {
                    return;
                }

                // TWS TWA VMG Heel Lee
                var target = false;
                var upwind = true;

                // if the line ends in a *, it's a target
                // for this wind speed
                if (line.substring(line.length - 1) == '*') {
                    target = true;
                    line = line.substring(0, line.length - 1);
                }


                var cols = line.split(' '); //TODO: CSV
                var tws = +cols[0],
                    twa = +cols[1],
                    speed = +cols[2],
                    heel = +cols[3],
                    lee = +cols[4];


                upwind = twa < 90;
                if (!(tws in polars.all)) {
                    polars.all[tws] = {};
                }

                polars.all[tws][twa] = {
                    speed: speed,
                    heel: heel,
                    lee: lee
                };
                if (target) {
                    polars.targets[upwind ? 'up' : 'down'][tws] = {
                        twa: twa,
                        speed: speed,
                        heel: heel
                    };
                }
            });

            rd.on('close', function() {
                polars.init();
                callback(polars);
            });
        };
    }
})();