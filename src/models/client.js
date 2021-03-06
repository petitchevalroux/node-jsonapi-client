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
    var metas;
    try {
        if (response.statusCode !== expectedStatus) {
            if (data.error) {
                throw new Error(data.error);
            } else {
                throw new Error(JSON.stringify(data));
            }
        }
        if (response.headers && response.headers["x-json-api"]) {
            metas = JSON.parse(response.headers["x-json-api"]);
        }
    } catch (error) {
        error.statusCode = response.statusCode;
        error.response = response;
        callback(error);
        return;
    }
    callback(null, data, metas);
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

/**
 * Apply walkCallback function to all resources
 * @param {string} uri
 * @param {object} params
 * @param {function} walkCallback function(resource) {console.log(resource)}
 * @param {function} callback
 * @returns {undefined}
 */
Client.prototype.walkResources = function(uri, params, walkCallback, callback) {
    var self = this;
    this.getResources(uri, params, function(err, resources, metas) {
        if (err) {
            callback(err);
            return;
        }
        resources.forEach(walkCallback);
        if (metas && metas.links && metas.links.next) {
            self.walkResources(metas.links.next, {}, walkCallback, callback);
        } else {
            callback(null, true);
        }
    });
};

module.exports = Client;
