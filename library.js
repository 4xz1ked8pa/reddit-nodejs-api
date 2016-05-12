// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var c = mysql.createConnection({
  host     : 'localhost',
  user     : 'ziad_saab', // CHANGE THIS :)
  password : '',
  database: 'reddit'
});

function getComments(postId, maxLevel, parentIds, commentsMap, finalComments, callback) {
  var query;
  if (!callback) {
    // first time function is called
    callback = parentIds;
    parentIds = [];
    commentsMap = {};
    finalComments = [];
    query = 'select * from comments where parentId is null';
  }
  else if (maxLevel === 0 || parentIds.length === 0) {
    callback(null, finalComments);
    return;
  }
  else {
    query = 'select * from comments where parentId in (' + parentIds.join(',') + ')';
  }

  c.query(query, function(err, res) {
    if (err) {
      callback(err);
      return;
    }
    res.forEach(
      function(comment) {
        commentsMap[comment.id] = comment;
        if (comment.parentId === null) {
          finalComments.push(comment);
        }
        else {
          var parent = commentsMap[comment.parentId];
          parent.replies = parent.replies || [];
          parent.replies.push(comment);
        }
      }
    );

    var newParentIds = res.map(function(item) {return item.id;});
    getComments(maxLevel - 1, newParentIds, commentsMap, finalComments, callback);
  });
}

// getComments(5, function(err, res) {
//   console.log(JSON.stringify(res, null, 4));
// })
