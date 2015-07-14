module.exports = function(app, passport) {
    app.get('/login', function(request, response){
        response.render('login', { message: request.flash('error') });
    });
    
    /* Handle Login POST */
    app.post('/login', passport.authenticate('login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash : true 
    }));
    
    /* Handle Logout */
    app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
    });
};