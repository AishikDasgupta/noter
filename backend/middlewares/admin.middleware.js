const adminOnly = (req, res, next) => {
  if (!req.user.roles || !req.user.roles.includes('admin')) {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
};

export default adminOnly;