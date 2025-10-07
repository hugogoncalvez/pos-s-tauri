const sessionHeaderMiddleware = (req, res, next) => {
    const sessionID = req.headers['x-session-id'];
    if (sessionID) {
        req.sessionID = sessionID;
    }
    next();
};

export default sessionHeaderMiddleware;
