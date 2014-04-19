
/*
 * GET external pages.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Home' });
};

exports.screenshots = function(req, res){
  res.render('screenshots', { title: 'Screenshots' });
};

exports.follow = function(req, res){
  res.render('follow', { title: 'Follow' });
};
