/**
 * Created by imsamurai on 19.01.2016.
 */
var fs = require("fs");
var vm = require("vm");
module.exports = function(path) {
    vm.runInThisContext(fs.readFileSync(path, {encoding:'utf8'}));
}