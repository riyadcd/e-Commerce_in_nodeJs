exports.get404 = ((req,res,next) => {
    // res.status(404).sendFile(path.join(rootDir,"views","404.html"));///used when pug templatting engine is not used
        
    res.render('404',{pageTitle:"Error",path:'/404',isAuthenticated:req.session.isLoggedIn});
});
exports.get505 = ((req,res,next) => {
    // res.status(404).sendFile(path.join(rootDir,"views","404.html"));///used when pug templatting engine is not used
        
    res.render('505',{pageTitle:"Error",path:'/500',isAuthenticated:req.session.isLoggedIn});
});
