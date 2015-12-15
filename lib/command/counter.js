/**
 * Created by imsamurai on 15.12.2015.
 */
function CounterCommand(count) {
    var name = 'counter_command';

    this.execute = function(Env) {
        if (!Env.get('counter')) {
            Env.set('counter', 0);
        }
        Env.set('counter', Env.get('counter') + count);
    }
}

CounterCommand.prototype = Object.create(Command.prototype);