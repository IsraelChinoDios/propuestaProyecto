const verifyAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Require Admin Role.' });
    }
    next();
};

module.exports = verifyAdmin;
