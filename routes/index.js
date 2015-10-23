module.exports = function(app){
    /* redirect / to dashboard */
    app.get('/', function(request, response) {
        response.redirect('/dashboard');
    });

    /* require routes for dashboard */
    require('./dashboard')(app);
};