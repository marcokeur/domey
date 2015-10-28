function App()
{

}

module.exports = App;

App.prototype.init = function () {
    Domey.on('action.playMusic', playMusic);
    Domey.on('action.stopMusic', stopMusic);

}

function playMusic(args, callback) {
    Domey.manager('drivers').getDriver('com.sonos.speaker').play(args.host, args.uri);
}

function stopMusic(args, callback) {
    Domey.manager('drivers').getDriver('com.sonos.speaker').stop(args.host);
}