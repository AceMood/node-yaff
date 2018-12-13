'use strict';

var expect = require('chai').expect;
var Finder = require('../index');

describe('find in node', function() {

    it('should list all files except symbolic-link files', async function() {
        var f = new Finder(['./test/dir']);
        var files = await f.find();

        expect(files.length).equal(5);
        for (var i = 0; i < files.length; ++i) {
            var file = files[i];
            expect(file).to.be.an('array');
            expect(file[0]).to.be.a('string');
            expect(file[1]).to.be.a('number');
        }
    });

    it('should list all js files through ignore function', async function() {
        var f = new Finder(['./test/dir'], ['.js']);
        var files = await f.find();
        var file = files[0];

        expect(files.length).equal(1);
        expect(file[0]).equal('test/dir/foo/b.js');
        expect(file[1]).to.be.a('number');
    });

    it('should ignore the only one js files', async function() {
        var f = new Finder(['./test/dir'], ['.js'], function ignore(path) {
            return /\.js$/.test(path)
        });

        var files = await f.find();

        expect(files.length).equal(0);
    });

});
