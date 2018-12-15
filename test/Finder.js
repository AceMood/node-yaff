'use strict';

var expect = require('chai').expect;
var Finder = require('../index');

describe('find in node', function() {

    it('should tolerant for different type Constructor parameters', function() {
        var f = new Finder('./test/dir');
        expect(f.dirs).to.deep.equal(['./test/dir']);
        expect(f.extensions).to.equal('*');
        expect(f.ignore).to.be.null;
        expect(f.native).to.be.false;
    });

    it('should tolerant for null parameters', function() {
        var f = new Finder();
        expect(f.dirs).to.deep.equal(['.']);
        expect(f.extensions).to.equal('*');
        expect(f.ignore).to.be.null;
        expect(f.native).to.be.false;
    });

    it('STATIC method findInNative should make sense', function() {
        Finder.findInNative(['./test/dir'], '*', null, function cb(files) {
            var f = new Finder(['./test/dir'], null, null, true);
            f.find().then(function(matchedFiles) {
                expect(matchedFiles.length).equal(files.length);
                files.forEach(function loop(f, index) {
                    expect(matchedFiles[index]).to.deep.equal(f);
                })
            })
        });
    });

    it('STATIC method findInNode should make sense', function() {
        Finder.findInNative(['./test/dir'], '*', null, function cb(files) {
            var f = new Finder(['./test/dir'], null, null);
            f.find().then(function(matchedFiles) {
                expect(matchedFiles.length).equal(files.length);
                files.forEach(function loop(f, index) {
                    expect(matchedFiles[index]).to.deep.equal(f);
                })
            })
        });
    });

});
