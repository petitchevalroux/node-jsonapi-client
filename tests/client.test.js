"use strict";

var assert = require("assert");
var sinon = require("sinon");
var path = require("path");

describe("models/client", function() {
    var Client = require(path.join(__dirname, "..", "src", "models", "client"));

    describe("setEndPoint", function() {
        it("set client endpoint to the client endpoint", function() {
            var client = new Client();
            client.setEndPoint("http://localhost:8080", function(err) {
                assert.equal(err, null);
                assert.equal("http://localhost:8080", client.endPoint);
            });
        });
    });
    describe("getEndPoint", function() {
        it("get an empty client endpoint return an error", function() {
            var client = new Client();
            client.getEndPoint(function(err, endPoint) {
                assert.equal(null, endPoint);
                assert.ok(err instanceof Error, "err is not an Error instance");
            });
        });
        it("return client endpoint", function() {
            var client = new Client();
            client.endPoint = "http://localhost:8081";
            client.getEndPoint(function(err, endPoint) {
                assert.equal(err, null);
                assert.equal(endPoint, "http://localhost:8081");
            });
        });
    });

    describe("getResource", function() {
        it("return a resource", function(done) {
            var client = new Client();
            var expectedArticle = {
                "id": "1",
                "title": "sample title"
            };
            var stubRestClientGet = sinon.stub(client.restClient, "get", function(url, callback) {
                assert.equal(url, "http://192.168.99.100:8080/articles/1");
                callback(expectedArticle);
                return {
                    "on": function() {}
                };
            });
            client.setEndPoint("http://192.168.99.100:8080", function() {
                client.getResource("/articles/1", function(err, article) {
                    assert.equal(err, null);
                    assert.equal(article, expectedArticle);
                    done();
                });
            });
            stubRestClientGet.restore();
        });
    });


    describe("getResources", function() {
        it("return resources", function(done) {
            var client = new Client();
            var expectedArticles = [{
                "id": "1",
                "title": "sample title"
            }];
            var stubRestClientGet = sinon.stub(client.restClient, "get", function(url, callback) {
                assert.equal(url, "http://192.168.99.100:8080/articles");
                callback(expectedArticles);
                return {
                    "on": function() {}
                };
            });
            client.setEndPoint("http://192.168.99.100:8080", function() {
                client.getResources("/articles", function(err, articles) {
                    assert.equal(err, null);
                    assert.equal(articles, expectedArticles);
                    done();
                });
            });
            stubRestClientGet.restore();
        });
    });

    describe("createResource", function() {
        it("return resource", function(done) {
            var client = new Client();
            var expectedUser = {
                "name": "John Doe"
            };
            var stubRestClientPost = sinon.stub(client.restClient, "post", function(url, args, callback) {
                assert.equal(url, "http://192.168.99.100:8080/users");
                callback(expectedUser);
                return {
                    "on": function() {}
                };
            });
            client.setEndPoint("http://192.168.99.100:8080", function() {
                client.createResource("/users", {
                    "name": "John Doe"
                }, function(err, user) {
                    assert.equal(err, null);
                    assert.equal(user, expectedUser);
                    done();
                });
            });
            stubRestClientPost.restore();
        });
    });

    describe("updateResource", function() {
        it("return updated resource", function(done) {
            var client = new Client();
            var expectedUser = {
                "name": "John Foo"
            };
            var stubRestClientPut = sinon.stub(client.restClient, "put", function(url, args, callback) {
                assert.equal(url, "http://192.168.99.100:8080/users/1");
                callback(expectedUser);
                return {
                    "on": function() {}
                };
            });
            client.setEndPoint("http://192.168.99.100:8080", function() {
                client.updateResource("/users/1", {
                    "name": "John Foo"
                }, function(err, user) {
                    assert.equal(err, null);
                    assert.equal(user, expectedUser);
                    done();
                });
            });
            stubRestClientPut.restore();
        });
    });

    describe("deleteResource", function() {
        it("deleting resource return true", function(done) {
            var client = new Client();
            var stubRestClientDelete = sinon.stub(client.restClient, "delete", function(url, callback) {
                assert.equal(url, "http://192.168.99.100:8080/users/90");
                callback(true, {
                    statusCode: 204
                });
                return {
                    "on": function() {}
                };
            });
            client.setEndPoint("http://192.168.99.100:8080", function() {
                client.deleteResource("/users/90", function(err, result) {
                    assert.equal(err, null);
                    assert.equal(result, true);
                    done();
                });
            });
            stubRestClientDelete.restore();
        });
    });

});
