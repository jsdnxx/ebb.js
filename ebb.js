'use strict';
var Ap = Array.prototype,
    slice = function(a) {
      return Ap.slice.call(a);
    };

var e = {};
e.isFunction = function (fn) {
  return typeof fn === 'function';
};
e.isObject = function (fn) {
  return typeof fn === 'object';
};
e.isPromise = function (fn) {
  //console.log('ispromise',fn,  e.isObject(fn) && e.isFunction(fn.then));
  return e.isObject(fn) && e.isFunction(fn.then);
};

/*

interface monad {
  err: any;
  state: string;
  result: any;
}

 */

e.isMonad = function (obj) {
  return e.isObject(obj) && typeof obj.state === 'string';
};

e.toResult = function (monad) {
  return monad.result;
};

e.extend = function(target, obj /* ... */) {
  var arg = 1, k;
  while ((obj = arguments[arg++])) {
    for (k in obj) {
      if (obj.hasOwnProperty(k)) {
        target[k] = obj[k];
      }
    }
  }

  return target;
};

var ebb = function () {
  var args = slice(arguments);
  args = args.map(returnMonad);
  return new ebb.expression(args);
};

ebb.expression = function (p) {
  var me = this;
  var params = p;
  var steps = [];
  var future = new ebb.Future();
  this.evaluate = function () {
    if (steps.length === 0) {
      future.returns(params.map(e.toResult));
      return future.promise({paramCount: params.length});
    }
    else {
      throw new Error('not implemented');
    }
  };
  this.addStep = function (step) {
    steps.push(step);
  };
};

ebb.expression.prototype.map = function (fn) {
  this.addStep(
    function (params) {
      return params.map(fn);
    }
  );
  return this;
};

ebb.expression.prototype.filter = function (fn) {
  this.addStep(
    function (params) {
      return params.filter(fn);
    }
  );
  return this;
};

ebb.expression.prototype.any = function (predicate) {
  //var promise = this.evaluate();
  //promise.progress(function (latestResult) {
  //  if (fn())
  //});

  var future = new ebb.Future();
  var p = this.evaluate();

  if (p.info.paramCount === 0) {
    return future.returns(false);
  }

  p.then(function (val) {
    var params = val.result;

    if (e.isFunction(predicate)) {
      var i, len;
      for (i = 0, len = params.length; i < len; i++) {
        if (predicate(params[i])) {
          future.returns(true);
        }
      }

      future.returns(false);
    } else {
      future.returns(params.length > 0);
    }


  });

  return future.promise();

};

ebb.expression.prototype.all = function (predicate) {
  var future = new ebb.Future();
  var p = this.evaluate();

  if (p.info.paramCount === 0) {
    return future.returns(true);
  }
  p.then(function (val) {
    var params = val.result;

    future.returns(params.map(predicate).reduce(function (m,v) { return m && v; }));
  });

  return future.promise();
};

ebb.expression.prototype.first = function (predicate) {
  var future = new ebb.Future();
  var p = this.evaluate();

  p.then(function (ret) {
    var vals = ret.result;

    if (!e.isFunction(predicate)) {
      if (vals.length === 0) {
        return future.throws(new Error());
      }
      return future.returns(vals[0]);
    }

    var i, len;
    for (i = 0, len = vals.length; i < len; i++) {
      var val = vals[i];
      if (predicate(val)) {
        return future.returns(val);
      }
    }

    // none matched
    future.throws(new Error());
  });



  return future.promise();
};



ebb.Future = function () {
  this.state = 'pending'; // pending, successful, input error, internal error (based on HTTP status code ranges)
  this.resolved = false;
};
ebb.next = function () {
    //console.log('next', this.result, this.state);
    if (this.resolved && e.isFunction(this.continuation)) {
      var monad = returnMonad(this.result, this.state);
      this.continuation.call(null, monad);
      delete this.continuation;
    }

  };

var returnMonad = function (result, state) {
  return {
    result: result,
    state: state || 'successful',
    err: state === 'error' ? result : false
  };

};

ebb.Future.prototype = {
  returns: function (val) {
    if (!this.resolved) {
      this.state = 'successful';
      this.result = val;
      this.resolved = true;
      ebb.next.call(this);
    }
    return this.promise();
  },

  throws: function (err) {
    if (!this.resolved) {
      this.state = 'error';
      this.result = err;
      this.resolved = true;
      ebb.next.call(this);
    }
    return this.promise();

  },
  updateProgress: function (val) {
    if (e.isFunction(this.progressCallback)) {
      this.progressCallback(val);
    }
  },
  promise: function (info) {
    var future = this;
    return {
      info: info,
      then: function (c) {
        future.continuation = c;
        if (future.resolved) {
          ebb.next.call(future);
        }
      },
      onProgress: function (cb) {
        future.progressCallback = cb;
      },
      state: function () {
          return future.state;
      }
    };
  }
};



ebb.async = function (fn) {
  if (fn.async) {
    return fn;
  }

  var asyncFn = function (monad) {
    var future = new ebb.Future();
    var args;
    if (monad !== undefined && e.isMonad(monad)){
      args = [].concat(monad.result);
    } else {
      args = Ap.slice.call(arguments);
    }

    // push execution to bottom of stack
    setTimeout(function () {
      try {
        var res = fn.apply(future, args);
        // if the fn returned a result synchronously, fulfill the promise
        if (res !== undefined) {
          future.returns(res);
        }
      } catch (o_O) {
        future.throws(o_O);
      }
    } , 0);

    return future.promise();

  };

  asyncFn.async = true;
  return asyncFn;
};

ebb.asyncIdentity = ebb.async(function() {
  var args = Ap.slice.call(arguments);
  this.returns.apply(null, args);
});

/**
 * @param  {array.<promise|function>} fns
 * @return {promise}
 */
ebb.syncAll = function (vals) {
  var future = new ebb.Future();
  var pending = 0;
  var results = [];

  var resolve = function (i) {
    return function (result) {
      results[i] = result;
      pending--;
      //console.log('pending ', pending)
      checkDone();
    };
  };

  var checkDone = function () {
    if(pending === 0) {
      future.returns(results);
    }
  };

  vals.forEach(function (val, i) {
    if (e.isPromise(val)) {
      pending++;
      val.then(resolve(i));
    } else {
      results[i] = returnMonad(val);
    }

  });
  checkDone();

  return future.promise();
};

ebb.pipeline = function (/* steps */) {

  var steps = Ap.slice.call(arguments);

  var step = ebb.async(steps.shift());

  return ebb.async(function (res) {
    var me = this,
      p = step.call(null, returnMonad(res));

      p.then(function (err, res) {
        if (steps.length === 0) {
          //console.log('no more steps');
          me.returns(res);
        } else {
          ebb.pipeline.apply(null, steps)(res).then(function (err, res) { me.returns(res); });
        }

      });

  });

};


typeof exports !== 'undefined' && (exports.ebb = ebb, exports.e = e);
