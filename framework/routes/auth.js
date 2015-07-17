module.exports = function(app, passport) {
    app.get('/login', function(request, response){
        response.render('login', { message: request.flash('error') });
    });
    
    /* Handle Login POST */
    app.post('/login', passport.authenticate('login', { 
        //successRedirect: '/',
        failureRedirect: '/login', 
        failureFlash: true 
    }),
    function(req, res, next) {
        // issue a remember me cookie if the option was checked
        if (!req.body.remember_me) { 
            console.log('no cookie');
            return next(); 
        }
        console.log('setting cookie');
        issueToken(req.user, function(err, token) {
          if (err) { return next(err); }
          res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 });
          return next();
        });
      },
      function(req, res) {
        res.redirect('/');
      });
    
    /* Handle Logout */
    app.get('/logout', function(req, res) {
        res.clearCookie('remember_me');
        req.logout();
        res.redirect('/');
    });
};

/* Fake, in-memory database of remember me tokens */

var tokens = {}

function consumeRememberMeToken(token, fn) {
  var uid = tokens[token];
  // invalidate the single-use token
  delete tokens[token];
  return fn(null, uid);
}

function saveRememberMeToken(token, uid, fn) {
  tokens[token] = uid;
  return fn();
}

function issueToken(user, done) {
  var token = randomString(64);
  saveRememberMeToken(token, user.id, function(err) {
    if (err) { return done(err); }
    return done(null, token);
  });
}

function randomString(len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}