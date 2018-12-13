/**
 * @file Yet Another Files Finder
 * @author AceMood
 */

'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');
var spawn = require('child_process').spawn;
var toString = Object.prototype.toString;
var isArray = Array.isArray ? Array.isArray : function isArray(val) {
    return toString.call(val) === '[object Array]'
};

function findInNode(dirs, extensions, ignore, resolve, reject) {
    // store files matched. second is mtime in milliseconds
    var result = [];
    // tasks can not be finished when activeCalls greater than zero
    var activeCalls = 0;

    function readFile(cur) {
        if (ignore && ignore(cur)) {
            return
        }

        activeCalls++;

        fs.lstat(cur, function(err, stat) {
            activeCalls--;

            // eliminate symbolic-link
            if (!err && stat && !stat.isSymbolicLink()) {
                if (stat.isDirectory()) {
                    readDir(cur)
                } else {
                    var ext = path.extname(cur);
                    // if file does not have a extension, the `extname` will return the whole file path
                    if (extensions === '*' || extensions.indexOf(ext) !== -1) {
                        result.push([cur, stat.mtime.getTime()])
                    }
                }
            }

            if (activeCalls === 0) {
                resolve(result)
            }
        })
    }

    function readDir(cur) {
        activeCalls++;

        fs.readdir(cur, function(err, names) {
            if (err) {
                reject(err)
            }

            activeCalls--;

            // normalizing file path
            for (var i = 0; i < names.length; i++) {
                names[i] = path.join(cur, names[i])
            }

            names.forEach(readFile);

            if (activeCalls === 0) {
                resolve(result)
            }
        })
    }

    dirs.forEach(readDir);
}

// @see https://shapeshed.com/unix-find/#what-is-the-find-command-in-unix
function findInNative(dirs, extensions, ignore, resolve, reject) {
    // in Windows we only use node
    if (os.platform() === 'win32') {
        return findInNode(dirs, extensions, ignore, resolve, reject);
    }

    var args = [].concat(dirs);
    args.push('-type', 'f');

    if (extensions === '*') {

    } else {
        extensions.forEach(function loop(ext, index) {
            if (index) {
                args.push('-o')
            }
            args.push('-iname');
            args.push('*' + ext)
        });
    }

    var findProcess = spawn('find', args);
    var stdout = '';

    findProcess.stdout.setEncoding('utf-8');
    findProcess.stdout.on('data', function out(data) {
        stdout += data
    });

    findProcess.stdout.on('close', function close() {
        // split by lines, trimming the trailing newline
        var lines = stdout.trim().split('\n');
        if (ignore) {
            lines = lines.filter(function(x) {
                return !ignore(x)
            })
        }

        var result = [];
        var count = lines.length;

        lines.forEach(function loop(filepath) {
            fs.stat(filepath, function(err, stat) {
                if (err) {
                    reject(err)
                }

                if (stat && !stat.isDirectory()) {
                    result.push([filepath, stat.mtime.getTime()])
                }

                if (--count === 0) {
                    resolve(result)
                }
            });
        })
    })
}

/**
 * Finder Class
 * @param {Array.<string>|String} dirs dirs to be scanned, ex: ['html']
 * @param {Array.<string>|String} extensions  extensions, ex: ['.js']
 * @param {Function=} ignore  Optional function to filter out paths
 * @param {boolean} native  whether use native shell command
 */
function Finder(dirs, extensions, ignore, native) {
    if (!dirs || !isArray(dirs)) {
        dirs = ['.'];
    }

    this.dirs = typeof dirs === 'string' ? [dirs] : dirs;
    this.extensions = extensions || '*';
    this.ignore = ignore || null;
    this.native = native || false;
}

Finder.findInNode = findInNode;

Finder.findInNative = findInNative;

Finder.prototype.find = function find() {
    var self = this;
    return new Promise(function executor(resolve, reject) {
        var impl = self.native ? findInNative : findInNode;
        impl(self.dirs, self.extensions, self.ignore, resolve, reject)
    });
};

module.exports = Finder;
