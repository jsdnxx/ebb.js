describe('ebb.async', function () {

  it('creates an async function', function () {

    var waiter = ebb.async(function (name){
      this.returns('Good day to you, ' + name);
    });

    waiter.should.be.a('function');

  });

  describe('the functions returned by async', function () {

    it('has an `async` flag set to true', function (){

      var fn = ebb.async(function () {});
      fn.async.should.equal(true);

    });

    it ('returns a promise', function () {
      var fn = ebb.async(function () {});
      var ret = fn();
      e.isPromise(ret).should.equal(true);
    });

    it('is called with `this` bound to the future object', function () {
      var fn = ebb.async(function () {
        this.returns.should.be.a('function');
        this.throws.should.be.a('function');
        (this.next === undefined).should.equal(true);
      });

      fn();

    });


    it('can return an async value using this.return', function (done) {
      var fn = ebb.async(function() {
        this.returns(true);
      });

      fn().then(function (ret) {
        ret.result.should.equal(true);
        done();
      });

    });

    it('can wrap a sync function with no knowledge of async', function (done) {
      // will use the synchronous return value if not undefined
      // (to wrap a sync function in an async monad)
      
      var syncFn = function () {
        return 'sync result';
      }
      var fn = ebb.async(syncFn);

      fn.async.should.equal(true);
      fn().then(function (ret) {
        ret.result.should.equal('sync result');
        done();
      });

    });


    it('can throw an async error using this.throw', function (done) {

        var fn = ebb.async(function () {
          this.throws('o_O');
        });

        fn().then(function (ret) {
          ret.state.should.equal('error');
          ret.result.should.equal('o_O');
          done();
        })

      });

    });

    it('will catch errors thrown by a sync function as an async error result', function (done) {
      var syncFn = function () {
        throw 'o_O';
      }

      var fn = ebb.async(syncFn);

      fn().then(function (ret) {
        ret.state.should.equal('error');
        ret.result.should.equal('o_O');
        done();
      })
    })


});