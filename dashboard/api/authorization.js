var settings = require('../settings.js');

module.exports = function(app){

app.get('/authorize', function(req, res){
  if (req.cookies.authorized) {
    res.send('Authorized :). Click to <a href="/forget">forget</a>!.');
  } else {
    res.send('<form method="post" action="/authorize">'
            + '<p>enter pin '
            + '<input type="password" maxlength=4 name="pin" />'
            + '<input type="submit" value="Submit"/></p></form>');
  }
});

app.get('/forget', function(req, res){
  res.clearCookie('authorized');
  res.redirect('back');
});

app.post('/authorize', function(req, res){
  if (req.body.pin.toString() == settings.pin.toString()){
      console.log("ok");
      res.cookie('authorized', 1, { maxAge: settings.timeout });
  }
  res.redirect('back');
});
}
