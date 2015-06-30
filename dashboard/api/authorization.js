module.exports = function(app){

app.get('/authorize', function(req, res){
  if (req.cookies.authorized) {
    res.send('Authorized :). Click to <a href="/forget">forget</a>!.');
  } else {
    res.send('<form method="post"><p>Check to <label>'
      + '<input type="checkbox" name="remember"/> remember me</label> '
      + '<input type="submit" value="Submit"/>.</p></form>');
  }
});

app.get('/forget', function(req, res){
  res.clearCookie('remember');
  res.redirect('back');
});

app.post('/authorize', function(req, res){
  var minute = 60 * 1000;
  if (req.body.remember) res.cookie('authorized', 1, { maxAge: minute });
  res.redirect('back');
});
}
