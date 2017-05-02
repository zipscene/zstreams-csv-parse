var zstreams = require('zstreams');
var CSVParse = require('./index');
var assert = require('assert');
var objtools = require('objtools');

var csvParse = new CSVParse({ mapHeaders: true });
var rows = [];

var expected = [
	{ Header1: 'Value1', Header2: 'Value2', Header3: 'Value3' },
	{ Header1: 'Value4', Header2: 'Value5', Header3: 'Value6' },
	{ Header1: 'Value7', Header2: 'Value8', Header3: 'Value9,10' }
];

zstreams.fromFile('./test.csv')
	.pipe(csvParse)
	.each(function(row) {
		rows.push(row);
	})
	.intoPromise()
	.then(function() {
		assert(objtools.deepEquals(rows, expected));
		console.log('Done.');
	})
	.catch(function(err) {
		console.warn(err);
		console.warn(err.stack);
		process.exit(1);
	});

