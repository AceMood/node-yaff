# node-yaff

Yet Another Files Finder in Node. Provide a unique way to walk through specific directories
an trigger callback function when find a matched file.

# Usage

Currently node-yaff only used for programmatically.

## example one

find all files in current directory:

```javascript
const Finder = require('node-yaff');
const f = new Finder(['./'], /* '*' also make sense */);
f.find().then(files => {
    // all files 
})
```
## example two

find all js files in current directory:

```javascript
const Finder = require('node-yaff');
const f = new Finder(['./'], ['.js']);
f.find().then(files => {
    // all js files
})
```
## example three

find all files do not have special character:

```javascript
const Finder = require('node-yaff');
const f = new Finder(['./'], '*', p => /s$/.test(p));
f.find().then(files => {
    // all files without s as a suffix character
})
```
