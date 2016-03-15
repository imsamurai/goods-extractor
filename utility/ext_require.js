/**
 * Created by imsamurai on 19.01.2016.
 */
var fs = require("fs");
var vm = require("vm");

/**
 * Require for non-node libs
 *
 * @param path
 */
module.exports = function(path) {
    vm.runInThisContext(fs.readFileSync(path, {encoding:'utf8'}));
}