# Less Harmful XML

This little library permits you to convert a list on JavaScript objects to
some of the alternatives that [cat-v](https://harmful.cat-v.org/software/xml).

## Usage example

You can make it so that on your REST API if you make an HTTP GET to
`api.example.com/products.json` you receive this JSON:

``` json
[
	{ "name": "apple", "color": "red" },
	{ "name": "apple", "color": "green" },
	{ "name": "banana", "color": "yellow" }
]
```

But when the request is to `api.example.com/products.csv` you receive the CSV:

``` csv
name,color
apple,red
apple,green
banana,yellow
```

That on a spreadsheet will look something like this:

|name|color|
|---|---|
|apple|red|
|apple|green|
|banana|yellow|

# Concerns

The way I found better to transform an array to a string is by
`JSON.stringify`ing it. This make so that when I parse a "less harmful XML"
back to an array of JavaScript objects the original values may don't be equal
to the parsed results.

When an object as a number or a symbol as property name they will be converted
to a string when `stringify`ing. Because of this when parsing all the property
names will be strings. And if you had a symbol with a descriptor equal to one
of his properties, one of them won't become part of the object.

I found a workaround to objects inside objects so it shouldn't be a problem.
