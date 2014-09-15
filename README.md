# csv-transform
### Simple CSV parser

```javascript
var CSV = require('csv-transform');

// Input: test.txt
// Name|Quantity|Price
// Cheeseburger|1|5.80
// Water|3|0

var csv = new CSV({
	delimiter: '|'
});
fs.createReadStream('test.txt').pipe(csv).pipe(process.stdout);

// Output
// ["Name", "Quantity", "Price"]
// ["Cheeseburger", "1", "5,80"]
// ["Water", "3", "0"]
```

It's a streaming CSV parser. 'Nuff said.

The following options are accepted:
* `delimiter`: The record delimiter in the input data. Defaults to ','.
* `escape`: The record quote character. Defaults to '"'.