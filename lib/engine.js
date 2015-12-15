/**
 * Created by imsamurai on 15.12.2015.
 */
function Engine(Env) {
    var commands = [];
    var pointer = -1;

    this.invoke = function (Command) {
        var result = Command.run(Env);
        commands = commands.slice(0, pointer-1).concat([Command]).concat(commands.slice(pointer-1));
        pointer += 1;
        return result;
    };

    this.undo = function () {
        if (pointer >= 0) {
            var Command = commands[pointer];
            Command.unRun(Env);
            pointer -= 1;
            return true;
        }
        return false;
    };

    this.redo = function () {
        if (pointer < commands.length - 1) {
            var result = Command = commands[pointer + 1];
            Command.run(Env);
            pointer += 1;
            return true;
        }
        return false;
    };

}