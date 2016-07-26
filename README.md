# zstreams-csv-parse
### ZStreams simple CSV parser

```javascript
var CSVParse = require('zstreams-csv-parse');

// Input: test.txt
// Name|Quantity|Price
// Cheeseburger|1|5.80
// Water|3|0

var csvParse = new CSVParse({
	delimiter: '|'
});
zstreams.fromFile('test.txt').pipe(csvParse).pipe(process.stdout);

// Output
// ["Name", "Quantity", "Price"]
// ["Cheeseburger", "1", "5,80"]
// ["Water", "3", "0"]
```

It's a streaming CSV parser. 'Nuff said.

The following options are accepted:
* `delimiter`: The record delimiter in the input data. Defaults to ','.
* `escape`: The record quote character. Defaults to '"'.
* `mapHeaders`: If this is set to true, instead of returning arrays, this stream will return objects
     mapping each spreadsheet header to its respective cell. The first row read form the file will be
     treated as the header row.
* `headers`: An array of strings. If `mapHeaders` is set and the spreadsheet being parsed has no header
     row, use this to manually set the headers.
