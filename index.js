/**
 * @file Yet Another Files Finder
 * @author AceMood
 */

'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');
var spawn = require('child_process').spawn;

function findInNode(dirs, extensions, ignore, cb) {
    var result = [];
    var activeCalls = 0;

    function readFile(curFile) {
        if (ignore && ignore(curFile)) {
            return;
        }
        activeCalls++;

        fs.lstat(curFile, function(err, stat) {
            activeCalls--;

            if (!err && stat && !stat.isSymbolicLink()) {
                if (stat.isDirectory()) {
                    readDirRecursive(curFile)
                } else {
                    var ext = path.extname(curFile);
                    if (extensions.indexOf(ext) !== -1) {
                        result.push([curFile, stat.mtime.getTime()])
                    }
                }
            }

            if (activeCalls === 0) {
                cb(result)
            }
        });
    }

    function readDirRecursive(curDir) {
        activeCalls++;
        fs.readdir(curDir, function(err, names) {
            if (err) {
                throw err
            }

            activeCalls--;

            // normalizing file path
            for (var i = 0; i < names.length; i++) {
                names[i] = path.join(curDir, names[i])
            }

            names.forEach(readFile);

            if (activeCalls === 0) {
                cb(result)
            }
        });
    }

    dirs.forEach(readDirRecursive);
}

function findInNative(dirs, extensions, ignore, cb) {
    if (os.platform() === 'win32') {
        return findInNode(dirs, extensions, ignore, cb);
    }

    var args = [].concat(dirs);
    args.push('-type', 'f');
    extensions.forEach(function(ext, index) {
        if (index) {
            args.push('-o')
        }
        args.push('-iname');
        args.push('*' + ext)
    });

    var findProcess = spawn('find', args);
    var stdout = '';
    findProcess.stdout.setEncoding('utf-8');
    findProcess.stdout.on('data', function(data) {
        stdout += data
    });

    findProcess.stdout.on('close', function() {
        // split by lines, trimming the trailing newline
        var lines = stdout.trim().split('\n');
        if (ignore) {
            lines = lines.filter(function(x) {
                return !ignore(x)
            })
        }

        var result = [];
        var count = lines.length;

        lines.forEach(function(path) {
            fs.stat(path, function(err, stat) {
                if (err) {
                    throw err
                }

                if (stat && !stat.isDirectory()) {
                    result.push([path, stat.mtime.getTime()]);
                }
                if (--count === 0) {
                    cb(result)
                }
            });
        })
    })
}

/**
 * Class
 * @param  {Array.<string>} dirs    dirs to be scanned, ex: ['html']
 * @param  {Array.<string>} extensions  extensions, ex: ['.js']
 * @param  {?Function}      ignore  Optional function to filter out paths
 * @param  {boolean}        native  whether use native shell command
 * @return {!Object}
 */
function Finder(dirs, extensions, ignore, native) {
    this.dirs = dirs || ['.'];
    this.extensions = exts || ['.js'];
    this.ignore = ignore || null;
    this.native = native || false;
}

Finder.findInNode = findInNode;

Finder.findInNative = findInNative;

Finder.prototype.find = function find(cb) {
    var impl = this.native ? findInNative : findInNode;
    impl(this.dirs, this.extensions, this.ignore, cb)
};

module.exports = Finder;
