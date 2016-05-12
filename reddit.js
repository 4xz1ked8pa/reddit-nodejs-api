var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;

module.exports = function RedditAPI(conn) {
  return {
    createUser: function(user, callback) {

      // first we have to hash the password...
      bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword) {
        if (err) {
          callback(err);
        }
        else {
          conn.query(
            'INSERT INTO `users` (`username`,`password`) VALUES (?, ?)', [user.username, hashedPassword],
            function(err, result) {
              if (err) {
                /*
                There can be many reasons why a MySQL query could fail. While many of
                them are unknown, there's a particular error about unique usernames
                which we can be more explicit about!
                */
                if (err.code === 'ER_DUP_ENTRY') {
                  callback(new Error('A user with this username already exists'));
                }
                else {
                  callback(err);
                }
              }
              else {
                /*
                Here we are INSERTing data, so the only useful thing we get back
                is the ID of the newly inserted row. Let's use it to find the user
                and return it
                */
                conn.query(
                  'SELECT `id`, `username`, `createdAt`, `updatedAt` FROM `users` WHERE `id` = ?', [result.insertId],
                  function(err, result) {
                    if (err) {
                      callback(err);
                    }
                    else {
                      /*
                      Finally! Here's what we did so far:
                      1. Hash the user's password
                      2. Insert the user in the DB
                      3a. If the insert fails, report the error to the caller
                      3b. If the insert succeeds, re-fetch the user from the DB
                      4. If the re-fetch succeeds, return the object to the caller
                      */
                        callback(null, result[0]);
                    }
                  }
                );
              }
            }
          );
        }
      });
    },
    createPost: function(post, callback) {
      conn.query(
        'INSERT INTO `posts` (`userId`, `title`, `url`, `subredditId`) VALUES (?, ?, ?, ?)', [post.userId, post.title, post.url, post.subredditId],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
            conn.query(
              'SELECT `id`,`title`,`url`,`userId`, `createdAt`, `updatedAt`, `subredditId` FROM `posts` WHERE `id` = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },
    getAllPosts: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;

      conn.query(`
        SELECT posts.id, posts.title, posts.url,posts.userId, posts.createdAt, posts.updatedAt, posts.subredditId, subreddits.name
        FROM posts
        LEFT JOIN subreddits ON subreddits.id = posts.subredditId
        ORDER BY createdAt DESC
        LIMIT ? OFFSET ?
        `, [limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results);
          }
        }
      );
    },
    getAllPostsForUser: function(userId, options, callback) {
      conn.query(`
        SELECT id, title, url, userId, updatedAt, createdAt
        FROM posts
        WHERE userId = ?
        LIMIT ?
        OFFSET ?
      `, [userId, options.limit, options.offset], function(err, posts) {
        if (err) {
          callback(err);
        }
        else if (!posts[0]) {
          callback(new Error('No posts for this user.'));
        }
        else {
          callback(null,posts)
        }
      });
    },
    getSinglePost: function(postId, callback) {
      conn.query(`
        SELECT id, title, url, userId, createdAt, updatedAt
        FROM posts
        WHERE id = ?
      `, [postId], function(err, post) {
        if (err) {
          callback(err);
        }
        else if (!post[0]) {
          callback(new Error('Post not found.'))
        }
        else {
          callback(null,post);
        }
      });
    },
    createSubreddit: function(sub, callback) {
      conn.query(`
        INSERT INTO subreddits (name, description)
        VALUES (? ?)
      `, [sub.name, sub.description], function(err, subreddit) {
          if (err) {
            callback(err);
          }
          else {
            callback(null,subreddit);
          }
      });
    },
    getAllSubreddits: function(callback) {
      conn.query(`
        SELECT id, name, description, createdAt, updatedAt
        FROM subreddits
        ORDER BY createdAt DESC`, function(err, subreddits) {
          if (err) {
            callback(err);
          }
          else {
            callback(null,subreddits);
          }
        });
    },
    createComment: function(comment, callback) {
      conn.query(`
        INSERT INTO comments (commentText, userId, postId, parentId)
        VALUES (? ? ? ?)
      `,[comment.commentText, comment.userId, comment.postId, comment.parentId], function(err, comment) {
        if (err) {
          callback(err);
        }
        else {
          conn.query(`
            SELECT id AS commentId, commentText, userId, postId, parentId, createdAt, updatedAt
            WHERE commentId = ?
          `[comment.id], function(err, comment) {
              if (err) {
                callback(err);
              }
              else {
                callback(null, comment[0]);
              }
          });
        }
      });
    },
    getCommentsForPost: function(postId, callback) {
      conn.query(
        `SELECT * FROM comments c1
        LEFT JOIN comments c2 ON c1.id = c2.parentId
        LEFT JOIN comments c3 ON c2.id = c3.parentId
        JOIN users u1 ON u1.id = c1.userId
        JOIN users u2 ON u2.id = c2.userId
        JOIN users u2 ON u3.id = c3.userId
        WHERE c1.postId = ? AND c1.parentId IS NULL`,[postId], function(err, comments) {
          if (err) {
            callback(err);
          }
          else if (!comments[0]) {
            callback(new Error('No comments were found.'));
          }
          else {
            var listOfComments = [];
            comments.forEach(function(comment) {

            });
          }
        }
      );
    }
  }
}
