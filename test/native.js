'use strict';

var expect = require('chai').expect;
var Finder = require('../index');

describe('find in shell', function() {

    it('should list all files except symbolic-link files', function() {
        var f = new Finder(['./test/dir/'], null, null, true);
        f.find().then(function(files) {
            expect(files.length).equal(5);
            for (var i = 0; i < files.length; ++i) {
                var file = files[i];
                expect(file).to.be.an('array');
                expect(file[0]).to.be.a('string');
                expect(file[1]).to.be.a('number');
            }
        })
    });

    it('all matched files name should be top-level relative', function() {
        var f = new Finder(['./test/dir/'], null, null, true);
        f.find().then(function(files) {
            for (var i = 0; i < files.length; ++i) {
                var file = files[i];
                expect(file).to.be.an('array');
                expect(/^\./.test(file[0])).to.be.false;
            }
        })
    });

    it('should list all js files pass ignore function', function() {
        var f = new Finder(['./test/dir'], ['.js'], null, true);
        f.find().then(function(files) {
            var file = files[0];

            expect(files.length).equal(1);
            expect(file[0]).equal('test/dir/foo/b.js');
            expect(file[1]).to.be.a('number');
        })
    });

    it('should ignore the only one js files', function() {
        var f = new Finder(['./test/dir'], ['.js'], function ignore(path) {
            return /\.js$/.test(path)
        }, true);

        f.find().then(function(files) {
            expect(files.length).equal(0);
        })
    });

    it('can accept multiple extensions', function() {
        var f = new Finder(['./test/dir'], ['.js', '.css'],  null, true);

        f.find().then(function(files) {
            expect(files.length).equal(2);
        })
    });

    it('should reject promise when some dirs absent', function() {
        var f = new Finder(['./0'], null, null, true);

        f.find().then(function(files) {}).catch(function(err) {
            expect(err instanceof Error).to.be.true;
            expect(err.code).to.be.a('string').to.equal('ENOENT');
            expect(err.errno).to.be.a('number').to.equal(-2);
        })
    });

});
