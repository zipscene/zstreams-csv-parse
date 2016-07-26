var Transform = require('zstreams').Transform;
var util = require('util');

util.inherits(CsvTransform, Transform);

function CsvTransform(opts) {
	if(!opts) opts = {};
	this.delimiter = opts.delimiter || ',';
	this.escape = opts.escape || '"';
	this.newlines = ['\r','\n'];
	this.mapHeaders = !!opts.mapHeaders;
	this.headers = opts.headers;
	Transform.call(this, {});
	this._readableState.objectMode = true;   // Read data, write objects
	this._readableState.highWaterMark = 100;
	this.state = 1;
	this.buf = '';
	this.res = [];
}


CsvTransform.prototype._transform = function(chunk, encoding, cb) {
	var self = this;
	var str = chunk.toString();
	var delimiter = this.delimiter || ',';
	var escape = this.escape || '"';
	// States:
	// 1: Scanning immediately after a delimiter
	// 2: Scanning inside an escape sequence
	// 3: Scanning immediately after the assumed end of an escape sequence
	// 4: Scanning outside of an escape sequence
	// 5: Scanning a sequence of newline characters
	for(var i = 0; i < str.length; i++) {
		var c = str[i];
		if(this.state === 1) {
			if(c === delimiter) {
				this.res.push(this.buf);
				this.buf = '';
			} else if(c === escape) {
				this.state = 2;
			} else if(this.newlines.indexOf(c) != -1) {
				this.res.push('');
				emitLine(this.res);
				this.buf = '';
				this.res = [];
			} else {
				this.buf += c;
				this.state = 4;
			}
		} else if(this.state === 2) {
			if(c === escape) {
				this.state = 3;
			} else if(this.newlines.indexOf(c) != -1) {
				this.res.push('"' + this.buf);
				this.state = 1;
				emitLine(this.res);
				this.buf = '';
				this.res = [];
			} else {
				if(c != '\r') this.buf += c;
			}
		} else if(this.state === 3) {
			if(c === delimiter) {
				this.res.push(this.buf);
				this.buf = '';
				this.state = 1;
			} else if(c === escape) {
				this.buf += c;
				this.state = 2;
			} else if(this.newlines.indexOf(c) != -1) {
				this.res.push(this.buf);
				this.state = 1;
				emitLine(this.res);
				this.buf = '';
				this.res = [];
			} else {
				if(c != '\r') this.buf += '"' + c;
				this.state = 2;
			}
		} else if(this.state === 4) {
			if(c === delimiter) {
				this.res.push(this.buf);
				this.buf = '';
				this.state = 1;
			} else if(this.newlines.indexOf(c) != -1) {
				this.res.push(this.buf);
				this.state = 1;
				emitLine(this.res);
				this.buf = '';
				this.res = [];
			} else {
				if(c != '\r') this.buf += c;
			}
		} else if(this.state === 5) {
			if(this.newlines.indexOf(c) != -1) {
				//Found another newline character; discard it and wait for next character
			} else {
				//End of newline sequence; change to state 1 WITHOUT CONSUMING CURRENT CHARACTER
				this.state = 1;
				i--;
			}
		}
	}
	cb();

	function emitLine(res) {
		if(self.mapHeaders) {
			if(self.headers) {
				var retObj = {};
				for(var i = 0; i < self.headers.length; i++) {
					if (res[i].length > 0) retObj[self.headers[i]] = res[i];
				}
				self.push(retObj);
			} else {
				self.headers = res;
			}
		} else {
			self.push(res);
		}
	}
};

CsvTransform.prototype._flush = function(cb) {
	var self = this;
	if (self.buf) {
		self.res.push(self.buf);
	}
	if (self.res.length) {
		self.push(self.res);
	}
}

module.exports = CsvTransform;
