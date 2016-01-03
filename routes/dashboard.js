module.exports = function(app){
    //serve the dashboard
    app.get('/dashboard', function(request, response) {
        //response.redirect('/dashboard/scenes');
        response.render('dashboard');
    });

    app.get('/dashboard/things', function(request, response){
        response.render('dashboard_things');
    });

    app.get('/dashboard/scenes', function(request, response){
        response.render('dashboard_scenes');
    });

    app.get('/dashboard/flows', function(request, response){
        response.render('dashboard_flows');
    });
};