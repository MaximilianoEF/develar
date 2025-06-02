
exports.isAuth = function(req,res,next) {
    if(req.user){
        next();
    }else{
        res.status(403).send({ message : 'No tiene acceso' })
    }
}

exports.isAdminUser = function(req, res, next) {
    if(req.user && !req.user['isUsuarioWeb']){
        next();
    }else{
        res.status(403).send({ message : 'No tiene acceso'});
    }
}
