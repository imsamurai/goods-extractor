/**
 * Created by imsamurai on 15.12.2015.
 */
var Env = new Envirounment();
var Engine = new Engine(Env);
console.log('must be 0');
console.log(Env.getStorage());
Engine.invoke(new CounterCommand(1));
console.log('must be 1');
console.log(Env.getStorage());
Engine.undo();
console.log('must be 0');
console.log(Env.getStorage());
Engine.redo();
console.log('must be 1');
console.log(Env.getStorage());
Engine.undo();
console.log('must be 0');
console.log(Env.getStorage());
Engine.invoke(new CounterCommand(2));
console.log('must be 2');
console.log(Env.getStorage());
Engine.redo();
console.log('must be 3');
console.log(Env.getStorage());