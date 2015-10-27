function App()
{

}

module.exports = App;

App.prototype.init = function () {
    Domey.manager('flow').on('action.playMusic', onFlowActionPlayMusic);
    Domey.manager('flow').on('action.stopMusic', onFlowActionStopMusic);

};

function onFlowActionPlayMusic(args, callback) {
//	Homey.log('args', args, global.chromecasts)
    Domey.manager('drivers').getDriver('com.sonos').play(args.host, args.uri);
}

function onFlowActionStopMusic(args, callback) {
    Domey.manager('drivers').getDriver('com.sonos').stop(args.host);
}