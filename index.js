/**
 * @file Yet Another Files Finder
 * @author AceMood
 */

'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');
var spawn = require('child_process').spawn;

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
                return reject(err)
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

// @see http://man7.org/linux/man-pages/man1/find.1.html
function findInNative(dirs, extensions, ignore, resolve, reject) {
    // in Windows we use node-fashion-find
    if (os.platform() === 'win32') {
        return findInNode(dirs, extensions, ignore, resolve, reject);
    }

    var args = [dirs];
    // only find file type, exclude all symbolic-links and directories
    args.push('-type', 'f');

    if (extensions === '*') {
        // do nothing
    } else {
        extensions.forEach(function loop(ext, index) {
            if (index) {
                args.push('-o')
            }
            args.push('-iname');
            args.push('*' + ext)
        })
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
        lines = lines.map(function map(p) {
            return path.normalize(p)
        });

        if (ignore) {
            lines = lines.filter(function filter(p) {
                return !ignore(p)
            })
        }

        var result = [];
        var count = lines.length;

        lines.forEach(function loop(filePath) {
            fs.stat(filePath, function(err, stat) {
                if (err) {
                    return reject(err)
                }

                if (stat) {
                    result.push([filePath, stat.mtime.getTime()])
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
 * @param {Function=} ignore Optional. Function to filter out paths
 * @param {boolean} native Optional. Whether use shell command
 */
function Finder(dirs, extensions, ignore, native) {
    if (typeof dirs === 'string') {
        dirs = [dirs]
    }
    if (!Array.isArray(dirs)) {
        dirs = ['.']
    }

    this.dirs = dirs;
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
