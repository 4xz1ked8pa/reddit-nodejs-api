// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root', // CHANGE THIS :)
  password : '',
  database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);




// Get all posts
redditAPI.getAllPosts({numPerPage:1,page:1}, function(err, posts) {
  if (err) {
    console.log('getAllPosts [ERROR]:',err);
  }
  else {
    console.log('getAllPosts [SUCCESS]:',posts);
  }
});

// Get all posts for user
redditAPI.getAllPostsForUser(1,{limit:1, offset:1}, function(err, posts) {
  if (err) {
    console.log('getAllPostsForUser [ERROR]:',err);
  }
  else {
    console.log('getAllPostsForUser [SUCCESS]:',posts);
  }
});

// Get single post
redditAPI.getSinglePost(9,function(err, post) {
  if (err) {
    console.log('getSinglePost [ERROR]:',err);
  }
  else {
    console.log('getSinglePost [SUCCESS]:',post);
  }
});

// Create subreddit
redditAPI.createSubreddit({name:'AboutTime', description:'Tell me what they do and who they do it with.'}, function(err, subreddit) {
  if (err) {
    console.log('createSubreddit [ERROR]:',err);
  }
  else {
    console.log('createSubreddit [SUCCESS]:',subreddit);
  }
});

// Get all subreddits
redditAPI.getAllSubreddits(function(err, subreddits) {
  if (err) {
    console.log('getAllSubreddits [ERROR]:',err);
  }
  else {
    console.log('getAllSubreddits [SUCCESS]:',subreddits);
  }
});

// Create comment
redditAPI.createComment({commentText:'Hello comment, again!', userId:1, postId:1, parentId:null}, function(err, comment) {
  if (err) {
    console.log('createComment [ERROR]:',err);
  }
  else {
    console.log('createComment [SUCCESS]:',comment)
  }
});
