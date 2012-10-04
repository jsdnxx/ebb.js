describe ('ebb.expression', function () {
  it ('is what monads were meant for - lazy evaluation', function () {
    // once the parameters go in, no guarantees are made as to the order (or number) 
    // of values at any step in evaluating the expression
  });

  describe ('.evaluate', function () {
    it ('returns a promise for the values', function (done) {
      var promise = ebb(1).evaluate();
      e.isPromise(promise).should.equal(true);


      promise.then(function (val) {
        val.result.join().should.equal([1].join());
        done();
      });
    });

    it('includes the number of parameters in the promise info', function () {
      var promise = ebb(1).evaluate();
      promise.info.paramCount.should.equal(1);
    });

    it('is immediately resolved successfully if there are no steps', function () {
      var promise = ebb(1).evaluate();

      promise.state().should.equal('successful');
    });
  });

  describe ('.any', function () {

    it ('returns true if any of the expression values match the predicate', function (done) {
      var even = function (a) { return a % 2 === 0; };

      ebb(1,2,3).any(even).then(function (r) { 
        r.result.should.equal(true);
      })
      ebb(1,3).any(even).then(function (r) {
        r.result.should.equal(false);
        done();
      });
    });

    it ('simply checks if there are any values if no predicate is given', function () {
      ebb(1).any().should.equal(true);
      ebb().any().should.equal(false);
    });

    it ('causes the expression to be evaluated', function () {

    });
  });

  describe ('.all', function () {
    it('returns true if all of the expression values match the predicate', function () {
      var even = function (a) { 
        return a % 2 === 0; 
      };
      var integers = function (a) {
        return a === parseInt(a);
      };
  
      ebb(1,2,3).all(even).should.equal(false);
      ebb(1,2,3).all(integers).should.equal(true);
    });

    it('returns true if there are no values', function () {
      ebb().all(function () {}).should.equal(true);
    });

  });

  describe ('.first', function () {
    it ('returns the first value that matches the predicate', function () {
      var even = function (a) { return a % 2 === 0; };

      ebb(1,2,3).first(even).should.equal(2);
    });

    it ('returns the first value if there is no predicate', function () {
      ebb(1,2,3).first().should.equal(1);
    });

    it ('throws an exception if none of the values match the predicate', function () {
      var even = function (a) { return a % 2 === 0; };

      (function () {
          ebb(1,3).first(even);
      }).should.throw(new Error());
    });

    it ('throws an exception if there are no values', function () {
      (function () {
        ebb().first();
      }).should.throw(new Error());
    })
  });



});