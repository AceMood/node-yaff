# node-yaff

Yet Another Files Finder in Node. Provide a unique way to walk through specific directories
an trigger callback function when find a matched file.

[![Build Status](https://img.shields.io/travis/AceMood/node-yaff/master.svg)](https://travis-ci.org/AceMood/node-yaff)

[![Download Count](https://img.shields.io/npm/dt/localeval.svg)]

[![Coveralls](https://img.shields.io/coveralls/AceMood/node-yaff/master.svg)](https://coveralls.io/AceMood/node-yaff)

# API

```javascript
class Finder(dirs, extensions, ignore, native);

Finder.prototype.find: Promise;

Finder.findInNative(dirs, extensions, ignore, resolve, reject): void;

Finder.findInNative(dirs, extensions, ignore, resolve, reject): void;
```

*dirs:Array|String|undefined*

directories to be scanned. Defaults to '.'

*extensions:Array|String|undefined*

file extensions to be matched. Defaults to '*'

*ignore:Function|undefined*

ignore function that accept a filePath and decide whether ignore it or not

*native: boolean|undefined*

use shell or node logic

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
