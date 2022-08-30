# TSV

## TOFIX

### stringify

The field names can't have the character ".". This will cause problems when parsing. Imagine the objects:
``` JavaScript
[
	{ MIME: { type: "hello" } },
	{ "MIME.type": "world" }
]
```

This will become:
| MIME.type | MIME.type |
| --- | --- |
| hello ||
|| world |

The table makes sense when looking what originated it. But when parsing table to the array of objects again, how can we know if `type` is a property of `MIME` or `MIME.type` is a property itself? A possible solution is changing all the "." to other character(s), for example "#", an the `MIME.type` woud be `MIME#type`, but and if the string has already the other character? That would cause a problem too.

Solutions:
+ Probably just escape the "." present on the strings with a "\0" so `MIME.type` would become `MIME\x00.type`;

### parse

