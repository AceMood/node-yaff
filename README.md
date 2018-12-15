# node-yaff

Yet Another Files Finder in Node. Provide a unique way to walk through specific directories and find all matched files.

<p align="left">
    <a href="https://travis-ci.org/AceMood/node-yaff">
        <img src="https://img.shields.io/travis/AceMood/node-yaff/master.svg" alt="Build Status" />
    </a>
    <a href="https://github.com/AceMood/node-yaff">
        <img src="https://img.shields.io/github/downloads/AceMood/node-yaff/total.svg" alt="Downloads">
    </a>
    <a href="https://coveralls.io/github/AceMood/node-yaff?branch=master">
        <img src="https://img.shields.io/coveralls/github/AceMood/node-yaff/master.svg" alt="Coverage Status" />
    </a>
    <a href="https://github.com/AceMood/node-yaff">
        <img src="https://img.shields.io/david/AceMood/node-yaff.svg" alt="Dependency" />
    </a>
    <a href="https://github.com/AceMood/node-yaff/blob/master/LICENSE">
        <img src="https://img.shields.io/npm/l/node-yaff.svg" alt="MIT" />
    </a>
</p>

# API

```javascript
class Finder(dirs, extensions, ignore, native);

Finder.prototype.find: Promise;

Finder.findInNative(dirs, extensions, ignore, resolve, reject): void;

Finder.findInNative(dirs, extensions, ignore, resolve, reject): void;
```

### dirs:Array|String|undefined

directories to be scanned. Defaults to '.'

### extensions:Array|String|undefined

file extensions to be matched. Defaults to '*'

### ignore:Function|undefined

ignore function that accept a filePath and decide whether ignore it or not

### native: boolean|undefined

use shell or node logic

# Usage

Currently node-yaff only used for programmatically.

## example one

find all files in current working directory:

```javascript
const Finder = require('node-yaff');
const f = new Finder(['./'], /* '*' also make sense */);
f.find().then(files => {
    // all files 
})
```
## example two

find all js files in current working directory:

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
