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
