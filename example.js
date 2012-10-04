// example code (in node)
ebb = require('./ebb').ebb;


var readFile = ebb.async(function(fileName) {
  var me = this;
  me['myFileName.txt'] = function () { return '!terces' };

  var time = Math.round(Math.random() * 1000);

  setTimeout(function () {

  if (fileName.indexOf('.') < 0) {
    me.throw(new Error('fileName must have a period for some reason' + time));
  }

  try {
    fileName = me[fileName]();
  } catch (o_O) {
    me.throw(new Error('I doesn\'t afraid of everything' + time));
  }



      me.return(Array.prototype.slice.call(fileName).reverse().join('') + time);
  }, time);

});

var p = readFile('myFileName.txt');
console.log(p.state());
p.then(function (res) {
  console.log(res);
  console.log(p.state());
});

var p2 = readFile('passwords.txt');
console.log(p2.state());
p2.then(function (res) {
  console.log(res);
  console.log(this);
  if (this.err) {
    console.log('ERRORRRRR');
  }
});

var p3 = readFile('lulzwut');
console.log(p3.state());
p3.then(function (res) {
  console.log(res);
  console.log(p3.state());
});

var regularFunction = function () {
  return 'hello dogg!';
}


ebb.syncAll([p, p2, p3, regularFunction()]).then(function (results) {
  console.log('all finished!');
});

var toUpper = function (txt) {
  return txt.toUpperCase();
}
var cutoff = function (txt) {
  return txt.substr(0,5);
};

var randomDelay = ebb.async(function (res) {
  var me = this;
  var time = Math.round(Math.random() * 1000);
  setTimeout(function () { me.return(res); }, time);

});

var pipeline = ebb.pipeline(toUpper, cutoff, randomDelay);

ebb.syncAll(['some text', 'moar text', 'silly dogs', 'ting tings'].map(pipeline)).then(function () {
  console.log('now we are ready for some things!');
});

var full = function (txt) {
  return !/\s/.test(txt);
};

// functional composition with ebb

// the ebb function wraps some arguments and applies values... as needed
ebb('some text', 'moar text', 'silly dogs', 'ting tings')
.map(pipeline)
.filter(full)
.any();

// cancel promises