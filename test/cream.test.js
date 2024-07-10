process.env.NODE_ENV = 'test';
var path        = require('path');
var assert      = require('assert');

var Cream = require(path.join(__dirname, '..'));

// maybe there could be more tests.  this is all i needed to get it working for the time being.  feel free to provide pull requests.  don't just steal my shit.

describe('c.r.e.a.m.', () => {
  var cache = new Cream({signature: {test: true}});

  it('should miss', (done) => {
    cache.fetch().then(() => {
      assert.equal(cache.missed, true);
      done();
    });
  })

  it('write and then not miss', function(done) {
    cache.write('ha').then(() => {
      setTimeout(() => {
	cache.fetch().then(() => {
	  assert.equal(cache.age() > 10, true);

	  assert.equal(cache.missed, false);
	  assert.equal(cache.data, 'ha');
	  done();

	});
      }, 50)
    }).catch(console.log)
  });

  it('should miss because of ttl', function(done) {
    cache.options.ttl = 10;
    cache.fetch().then(() => {
      assert.equal(cache.expired, true);
      assert.equal(cache.missed, true);
      done();
    }).catch(console.log)
  });

  it('delete', function(done) {
    cache.delete().then(() => {
      cache.existence().then((exists) => {
	assert.equal(exists, false);
	done();
      }).catch(console.log);
    }).catch(console.log);

  });

});
