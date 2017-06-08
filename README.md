# Custom XMP-reader module  
Extracts custom defined XMP/RDF metadata tags from image files.

### new API: 
```AsciiDoc
xmp-reader (*NodeBuffer* buffer, *object* nsTagAndAttributeNames) : *object* tagAndAttributeProps
```

 - where the buffer is a file (like png) that has has xmp embedded. And the tagAndAttributeNames has the three properties: *string* ns, *object* tags, *object* attributes

### Issue: 
If the xmp is wrongly formatted (ie. tag-names in sequence is not put inside proper envelopTag, 
the tags are parsed as attributes instead...)

## Usage
To install the module add it to your project's package.json dependencies or install manually running:

```
npm install xmp-reader
```

Then pull it in your code:

```javascript
const xmpReader = require('xmp-reader');
```

You can either feed it a buffer:
```javascript
xmpReader.fromBuffer(buffer, tags, (err, data) => {
  if (err) console.log(err);
  else console.log(data);
});
```

Both methods above return a promise, you can use that instead of the ``callback``:
```javascript
xmpReader.fromBuffer(buffer).then(
  (data) => console.log(data),
  (err) => console.log(err)
);
```

Output will look something like that, depending on your metadata:
```javascript
{
	"customTag1": "value",
	"customTag2": "value0",
	"keyword1": "value1",
	"keyword2": "value2",
	"raw": "<xmp...",
}
```

## License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)

This module was derived from [xmp-reader](https://github.com/shkuznetsov/xmp-reader).
