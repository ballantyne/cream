
const path = require('path');
const fs = require('fs');
const sortKeysRecursive = require('sort-keys-recursive');

const { createHmac } = require('node:crypto');


var configuration = { 
  defaultFolder: path.join(__dirname, '..', '..', 'test', 'data', 'cacher')
}

class Cache {
  constructor(options) {
    this.identify(options).then(() =>  {
      //console.log('identified', this);
    });
  }

  existence() {
    var self = this;
    return new Promise(async(resolve, reject) => {
      fs.stat(path.join(self.options.folder, self.options.key), function(err, fileStats) {
	resolve(err == null); 
      });
    })
  }

  fetch(options={}) {
    if (options.buffer == undefined) {
      options.buffer = false;
    } 

    if (options.ttl == undefined && this.options.ttl != undefined) {
      options.ttl = this.options.ttl;
    }

    var self = this;
    return new Promise(async(resolve, reject) => {
      fs.stat(path.join(self.options.folder, self.options.key), function(err, fileStats) {
	self.exists = err == null;

	  if (self.exists) { 
	    self.modified = fileStats.mtime;
	    self.stats = fileStats;
	    
	    if (options.ttl != undefined && options.ttl < self.age()) {
              self.missed = true;
	      self.expired = true;
	      
	      // if it misses because of ttl should it send along the 
	      // data anyway if it has alraedy collected it?  
	      // What a weird question.

	      delete self.data;
	      resolve();
	    } else {
	      fs.promises.readFile(path.join(self.options.folder, self.options.key)).then((data) => {
		self.data = data;

		if (options.buffer == false) {
		  self.data = self.data.toString();
		}
		self.missed = false;

		resolve()
	      })
	    }
	  } else {
	    self.missed = true;
	    resolve(); 
	  }
      });
    })
  }

  age() {
    return (this.modified == undefined ? -1 : (new Date() - this.modified));
  }
  
  write(data) {
    var self = this;
    return new Promise((resolve) => {
      fs.writeFile(path.join(this.options.folder, this.options.key), data, function(err) {
	self.data = data;
	resolve();
      });
    });
  }

  delete() {
    var self = this;
    return new Promise((resolve) => {
      fs.promises.rm(path.join(this.options.folder, this.options.key)).then(() => {
        resolve();
      });
    });
  }

  file() {
    return path.join(this.options.folder, this.options.key);
  }

  identify(options) {
    var self = this;

    if (options.folder == undefined) {
      options.folder = configuration.defaultFolder;
    }

    if (options.silo == undefined) {
      options.silo = 'pages';
    }

    options.folder = path.join(options.folder, options.silo);
    this.options = options;


    if (this.options.key == undefined) { 
      var sorted = sortKeysRecursive(options.signature);
      var string = JSON.stringify(sorted)
const { createHmac } = require('node:crypto');


      var buffer = Buffer.from(string); 
      var signature = buffer.toString('base64');


      this.options.key = createHmac('sha256', 'secret')
               .update(signature)
               .digest('hex');
    }

    if (this.options.verbose) {
      console.log(this.options);
    }

    return new Promise((resolve) => {
      fs.mkdir(self.options.folder, {recursive: true},  function() {
        resolve();
      });
    });
  }
}

module.exports = Cache;
