/**
 * Created by imsamurai on 13.01.2016.
 */
var Logger = {
    enabled: true,
    log: function() {
        if (this.enabled) {
            for(var n=0;n<arguments.length;n++) {
                console.log(arguments[n]);
            }
        }
    },
    info: function() {
        if (this.enabled) {
            for(var n=0;n<arguments.length;n++) {
                console.info(arguments[n]);
            }
        }
    },
}