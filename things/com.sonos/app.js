function App()
{

}

module.exports = App;

App.prototype.init = function () {
    Domey.on('action.playMusic', playMusic);
    Domey.on('action.stopMusic', stopMusic);

}

function playMusic(args, callback) {
    var driver = Domey.manager('drivers').getDriver('com.sonos.speaker');
    console.log('driver: ' + JSON.stringify(driver));
    driver.play(args.host, args.uri);
}

function stopMusic(args, callback) {
    var driver = Domey.manager('drivers').getDriver('com.sonos.speaker');

    driver.stop(args.host);
}