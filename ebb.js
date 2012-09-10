'use strict';
var Ap = Array.prototype;

var e = {};
e.isFunction = function (fn) {
  return typeof fn === 'function';
};
e.isObject = function (fn) {
  return typeof fn === 'object';
}
e.isPromise = function (fn) {
  console.log('ispromise',fn,  e.isObject(fn) && e.isFunction(fn.then));
  return e.isObject(fn) && e.isFunction(fn.then);
}


var ebb = {};


ebb.Future = function () {
  this.state = 'pending'; // pending, successful, input error, internal error (based on HTTP status code ranges)
  this.resolved = false;
};

ebb.Future.prototype = {
  return: function (val) {
    if (!this.resolved) {
      this.state = 'successful';
      this.result = val;
      this.resolved = true;
      this.next();
    }
  },

  throw: function (err) {
    if (!this.resolved) {
      this.state = 'error';
      this.result = err;
      this.resolved = true;
      this.next();
    }

  },
  next: function () {
    console.log('next', this.result, this.state);
    if (this.resolved && e.isFunction(this.continuation)) {
      this.continuation.call({state: this.state, err: this.state === 'error' ? this.result : false}, this.result);
      delete this.continuation;
    }

  },
  promise: function () {
    var future = this;
    return {
      then: function (c) {
        future.continuation = c;
        if (future.resolved) {
          future.next();
        }
      },
      state: function () {
          return future.state;
      }
    }
  }
};



ebb.async = function (fn) {
  if (fn.async) {
    return fn;
  }

  var asyncFn = function () {
    var future = new ebb.Future();
    console.log('new future');
    var args = Ap.slice.call(arguments);

    // push execution to bottom of stack
    setTimeout(function () {
      var res = fn.apply(future, args);
      // if the fn returned a result synchronously, fulfill the promise
      if (res !== undefined) {
        future.return(res);
      }} , 0);

    return future.promise();

  };

  asyncFn.async = true;
  return asyncFn;
};

ebb.asyncIdentity = ebb.async(function() {
  var args = Ap.slice.call(arguments);
  this.return.apply(null, args);
});

/**
 * @param  {array.<promise|function>} fns
 * @return {promise}
 */
ebb.syncAll = function (vals) {
  var future = new ebb.Future();
  var pending = 0;
  var results = [];
  var states = [];

  var resolve = function (i) {
    return function (result) {
      results[i] = result;
      states[i] = this.state;
      pending--;
      console.log('pending ', pending)
      checkDone();
    };
  };

  var checkDone = function () {
    if(pending === 0) {
      future.return(results);
    }
  };

  vals.forEach(function (val, i) {
    if (e.isPromise(val)) {
      pending++;
      val.then(resolve(i));
    } else {
      results[i] = val;
    }

  });
  checkDone();

  return future.promise();
};

ebb.pipeline = function (/* steps */) {

  var steps = Ap.slice.call(arguments);

  var step = ebb.async(steps.shift());

  return ebb.async(function () {
    var me = this,
      args = Ap.slice.call(arguments),
      p = step.apply(null, args);

      p.then(function (res) {
        if (steps.length === 0) {
          console.log('no more steps');
          me.return(res)
        } else {
          ebb.pipeline.apply(null, steps)(res).then(function (res) { me.return(res); });
        }

      });

  });

};

///

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



      me.return(Ap.slice.call(fileName).reverse().join('') + time);
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


})

var pipeline = ebb.pipeline(toUpper, cutoff, randomDelay);

ebb.syncAll(['some text', 'moar text', 'silly dogs', 'ting tings'].map(pipeline)).then(function () {
  console.log('now we are ready for some things!');
});
