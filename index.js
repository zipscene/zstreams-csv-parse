var Transform = require('zstreams').Transform;
var util = require('util');

util.inherits(CsvTransform, Transform);

function CsvTransform(opts) {
	if(!opts) opts = {};
	if (!opts.delimiter) opts.delimiter = 'auto';
	if (opts.delimiter === 'auto') opts.delimiter = [ ',', '\t' ];
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
	var str = chunk.toString();
	if (Array.isArray(this.delimiter)) {
		// Autodetecting delimiter
		for (var i = 0; i < str.length; i++) {
			if (this.delimiter.indexOf(str[i]) !== -1) {
				this.delimiter = str[i];
				break;
			}
		}
		if (Array.isArray(this.delimiter)) {
			if (!this._autoDelimiterBuffer) this._autoDelimiterBuffer = '';
			this._autoDelimiterBuffer += str;
		} else {
			if (this._autoDelimiterBuffer) this._processChunk(this._autoDelimiterBuffer);
			delete this._autoDelimiterBuffer;
			this._processChunk(str);
		}
	} else {
		this._processChunk(str);
	}
	cb();
};

CsvTransform.prototype._processChunk = function(str) {
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
			} else if(this.newlines.indexOf(c) !== -1) {
				this.res.push('');
				this._emitLine(this.res);
				this.buf = '';
				this.res = [];
				this.state = 5;
			} else {
				this.buf += c;
				this.state = 4;
			}
		} else if(this.state === 2) {
			if(c === escape) {
				this.state = 3;
			} else if(this.newlines.indexOf(c) !== -1) {
				this.res.push('"' + this.buf);
				this.state = 5;
				this._emitLine(this.res);
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
			} else if(this.newlines.indexOf(c) !== -1) {
				this.res.push(this.buf);
				this.state = 5;
				this._emitLine(this.res);
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
			} else if(this.newlines.indexOf(c) !== -1) {
				this.res.push(this.buf);
				this.state = 5;
				this._emitLine(this.res);
				this.buf = '';
				this.res = [];
			} else {
				if(c != '\r') this.buf += c;
			}
		} else if(this.state === 5) {
			if(this.newlines.indexOf(c) !== -1) {
				//Found another newline character; discard it and wait for next character
			} else {
				//End of newline sequence; change to state 1 WITHOUT CONSUMING CURRENT CHARACTER
				this.state = 1;
				i--;
			}
		}
	}
};

CsvTransform.prototype._emitLine = function(res) {
	if(this.mapHeaders) {
		if(this.headers) {
			var retObj = {};
			for(var i = 0; i < this.headers.length && i < res.length; i++) {
				if (res[i].length > 0) retObj[this.headers[i]] = res[i];
			}
			this.push(retObj);
		} else {
			this.headers = res;
		}
	} else {
		this.push(res);
	}
};

CsvTransform.prototype._flush = function(cb) {
	if (this.buf) {
		this.res.push(this.buf);
	}
	if (this.res.length) {
		this._emitLine(this.res);
	}
	cb();
};

module.exports = CsvTransform;

