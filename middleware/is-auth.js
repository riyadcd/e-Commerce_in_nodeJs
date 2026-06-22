module.exports = (req,res,next) => {
    console.log('in mid');
    console.log(req.session.isLoggedIn)
    if(!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    next();
}