
/*
 * GET main jira frame page.
 */

exports.index = function(req, res){
  res.render('contactsframe', { title: 'Jira Home' });
};
