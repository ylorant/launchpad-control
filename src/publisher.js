let http = require('http');
let querystring = require('querystring');
let jwt = require('jsonwebtoken');
const { loggers } = require('winston');

class PublisherManager
{
    constructor(configuration)
    {
        this.configuration = configuration;
    }

    publish(event, data)
    {
        let postData = querystring.stringify({
            'topic': this.configuration.topic,
            'data': JSON.stringify({
                type: event,
                params: data
            }),
        });

        let reqHeaders = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
        };

        if(this.configuration.connection.jwtkey) {
            let payload = {
                "mercure": {
                    "publish": [
                        "*"
                    ]
                }
            };
            let token = jwt.sign(payload, this.configuration.connection.jwtkey);
            reqHeaders['Authorization'] = 'Bearer ' + token;
        }

        let req = http.request({
            hostname: this.configuration.connection.host,
            port: this.configuration.connection.port,
            path: '/.well-known/mercure',
            method: 'POST',
            headers: reqHeaders
        });
        req.on('error', function(err) {
            logger.warn("Cannot connect to mercure publisher");
        });
        req.write(postData);
        req.end();
    }
}

module.exports = PublisherManager;