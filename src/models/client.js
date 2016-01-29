"use strict";

function Client() {

}
var qs = require("qs");
var RestClient = require("node-rest-client").Client;
Client.prototype.restClient = new RestClient();

Client.prototype.setEndPoint = function(endPoint, callback) {
    this.endPoint = endPoint;
    callback(null, endPoint);
};

Client.prototype.getEndPoint = function(callback) {
    if (!this.endPoint) {
        callback(new Error("endPoint not setted"));
    } else {
        callback(null, this.endPoint);
    }
};

Client.prototype.timeout = 3;

Client.prototype.setRequestEvents = function(request, callback) {
    request.on("error", function(err) {
        callback(err);
    });
    request.on("responseTimeout", function(response) {
        var err = new Error("response timeout");
        err.response = response;
        callback(err);
    });
    request.on("requestTimeout", function(request) {
        var err = new Error("request timeout");
        request.abort();
        callback(err);
    });
};

Client.prototype.getResource = function(uri, callback) {
    return this.get(uri, {}, callback);
};

Client.prototype.getResources = function(uri, params, callback) {
    if (!callback) {
        callback = params;
        params = {};
    }
    this.get(uri, params, callback);
};

Client.prototype.get = function(uri, params, callback) {
    var self = this;
    this.getEndPoint(function(err, endPoint) {
        if (err) {
            callback(err);
            return;
        }
        var queryString = qs.stringify(params);
        if (queryString) {
            uri += "?" + queryString;
        }
        var request = self.restClient.get(endPoint + uri, function(data, response) {
            self.handleResponseStatus(200, data, response, callback);
        });
        self.setRequestEvents(request, callback);
    });
};

Client.prototype.handleResponseStatus = function(expectedStatus, data, response, callback) {
    if (response.statusCode !== expectedStatus) {
        var error;
        if (data.error) {
            error = new Error(data.error);
        } else {
            error = new Error(JSON.stringify(data));
        }
        error.statusCode = response.statusCode;
        error.response = response;
        callback(error);
        return;
    }
    callback(null, data);
};


Client.prototype.createResource = function(uri, resource, callback) {
    var self = this;
    this.getEndPoint(function(err, endPoint) {
        if (err) {
            callback(err);
            return;
        }
        var args = {
            "data": resource,
            "headers": {
                "Content-Type": "application/json"
            }
        };
        var request = self.restClient.post(endPoint + uri, args, function(data, response) {
            self.handleResponseStatus(201, data, response, callback);
        });
        self.setRequestEvents(request, callback);
    });
};

Client.prototype.updateResource = function(uri, resource, callback) {
    var self = this;
    this.getEndPoint(function(err, endPoint) {
        if (err) {
            callback(err);
            return;
        }
        var args = {
            "data": resource,
            "headers": {
                "Content-Type": "application/json"
            }
        };
        var request = self.restClient.put(endPoint + uri, args, function(data, response) {
            self.handleResponseStatus(200, data, response, callback);

        });
        self.setRequestEvents(request, callback);
    });
};

Client.prototype.deleteResource = function(uri, callback) {
    var self = this;
    this.getEndPoint(function(err, endPoint) {
        if (err) {
            callback(err);
            return;
        }
        var request = self.restClient.delete(endPoint + uri, function(data, response) {
            self.handleResponseStatus(204, data, response, callback);
        });
        self.setRequestEvents(request, callback);
    });
};


module.exports = Client;
