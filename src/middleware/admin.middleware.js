const adminMiddleware = (req, res, next) => {
  // We must look inside req.user because that is where the auth middleware 
  // stored the decoded token data.
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin access denied" });
  }
};

module.exports = adminMiddleware;