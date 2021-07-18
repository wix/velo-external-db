const unless = function(path, middleware) {
    return function(req, res, next) {
        if (path.includes(req.path)) {
            return next();
        } else {
            return middleware(req, res, next);
        }
    };
};

module.exports = { unless }