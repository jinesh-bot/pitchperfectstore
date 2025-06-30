exports.getLanding = (req, res) => {
  res.render('user/landing');
};

exports.getHome = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('user/home', { user: req.session.user });
};
