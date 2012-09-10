ebb = require('../ebb').ebb;

describe('ebb', function () {

  it('is a simple yet powerful control flow library', function () {});

  describe('creating an async function', function () {

    it('uses the helper function ebb.async', function () {

      var waiter = ebb.async(function (name){
        this.return('Good day to you, ' + name);
      });

    });
  });
});