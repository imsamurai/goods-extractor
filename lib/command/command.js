/**
 * Created by imsamurai on 15.12.2015.
 */
function Command() {
    var name = 'command';
    var result = null;
    var envBefore = null;
    var envAfter = null;

    this.execute = function () {

    };
}

Command.prototype.run = function (envirounment) {
    this.envBefore = envirounment.clone();
    this.execute(envirounment);
    this.envAfter = envirounment.clone();
}

Command.prototype.unRun = function (envirounment) {
    envirounment.modify(this.envBefore);
    this.envAfter = envirounment.clone();
}

Command.prototype.result = function () {
    return this.result;
}