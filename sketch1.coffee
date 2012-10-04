
var readFile, extractUrl, loadUrl, parseResult, print;

readFile = function (fileName) {
  return ebb.Future(function (fileName)) {

    // open file
    // read file
    // return result
    this.return();
    this.throw();

  }).promise();
}


readFile = async(function(fileName){

  this.return(result);

});


var myProcess = serial(readFile, extractUrl, loadUrl, parseResult, print);

var files = ['a.txt','b.md','c.html','d.json'];

whenAll(files.map(myProcess)).then(function () {

  //console.log('all files are loaded')

  });





readFile = (fileName) ->
  # open file
  # read file
  # return result
  ''

extractUrl = (file) ->
  #parse for url
  'http://google.com'

loadUrl = (url) ->
  # download the file
  return '<html>teh googlez</html>'

parseResult = (result) ->
  #strip tags
  return 'teh googlez'

print = (text) ->
  //console.log text

readFile = (fileName) ->
  ebb.Future (fileName) ->
    # open file
    # read file
    # return result
    this.return()
    this.throw()
    this
  .promise()


ebb.Wrap = (fn) ->
  () ->
    fn2 = ->
      try{
        this.return fn.apply(this, arguments)
      } catch e {
        this.throw e
      }
    ebb.Future(fn2).promise()


ebb =
  log: 'k'

ebb.Promise = ->
  next: =>
    this
  sync: =>
    this
  finally: =>
    this

ebb.Future = (fn) ->
  promise: ebb.Promise

ebb.Wrap = (fn) ->
  () ->
    args = arguments
    fn2 = ->
      try
        this.return fn.apply(this, args)
      catch e
        this.throw e
      this
    ebb.Future(fn2).promise()

greet = (name) ->
  'hello, ' + name

greetAsync = ebb.Wrap greet

//console.log greetAsync


