# TSV

## TOFIX

### stringify

+ The field names can't have the character ".". This will cause problems when parsing. Imagine the objects:
``` JavaScript
[
	{ MIME: { type: "hello" } },
	{ "MIME.type": "world" }
]
```
This will become:
| MIME.type | MIME.type |
| --- | --- |
| hello | |
| | world |
**Solutions**:
	+ *none*;

### parse

