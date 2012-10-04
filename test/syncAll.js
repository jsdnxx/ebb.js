describe('ebb.syncAll', function () {

  var asyncPrint = ebb.async(function (txt) { 
    return txt;
  });

  it('takes an array of promises and returns when they are all resolved', function (done) {

    var f1 = new ebb.Future(),
        f2 = new ebb.Future(),
        p1 = f1.promise(),
        p2 = f2.promise();

    ebb.syncAll([p1, p2]).then(function () {
      p1.state().should.equal('successful');
      p2.state().should.equal('successful');
      done();
    });

    f1.returns('hello');
    f2.returns('world');

  });

  it('can also take an array of current values (POJOs)', function (done) {

    ebb.syncAll(['jolly good','right-o']).then(function () {
      done();
    });
  });

  it('returns the results of the promises in the order they were passed in', function (done) {
    var f1 = new ebb.Future(),
        p1 = f1.promise();

    ebb.syncAll([p1, 'world']).then(function (ret) {
      Array.isArray(ret.result).should.equal(true);
      ret.result.length.should.equal(2);
      ret.result.map(function(r){return r.result; }).join()
        .should.equal(['hello','world'].join());
      done();
    });

    f1.returns('hello');
  });

  
});