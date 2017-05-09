'use strict'
const express = require('express');
const bodyParser = require('body-parser');
var AWS = require("aws-sdk");
AWS.config.update({
	region: 'us-east-1'
});
var firehose = new AWS.Firehose();
// declare a new express app
const app = express();
app.use(bodyParser.urlencoded({
	extended: false
}));

var config = {
	aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
	aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
	aws_kinesis_end_point: process.env.AWS_KINESIS_DELIVERY_STREAM_NAME
};

// Enable CORS for all methods
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/cl', function (req, res) {
	if (Object.keys(req.query).length !== 0 ) {
		var record = {};
		if (req.query.prod_no)
			record.prod_no = req.query.prod_no.toUpperCase();
		if (req.query.m_id)
			record.m_id = req.query.m_id.toUpperCase();
		if (req.query.ord_no)
			record.ord_no = req.query.ord_no.toUpperCase();
		if (req.query.gid)
			record.gid = req.query.gid.toUpperCase();
		if (req.query.desc)
			record.desc = req.query.desc;
		if (req.query.title)
			record.title = req.query.title;	
		if (req.query.beg_dt)
			record.beg_dt = req.query.beg_dt;	
		if (req.query.url)
			record.url = req.query.url;	
		if (req.query.data)
			record.data = req.query.data;	
		if (req.query.channel)
			record.channel = req.query.channel.toUpperCase();	
		if (req.query.act)
			record.act = req.query.act.toUpperCase();	
		else 
			record.act = 'VIEW';	
		if (Object.keys(record).length !== 0 && (req.query.gid||req.query.m_id)) {
			record.date = (new Date()).getTime();
			console.log(JSON.stringify(record));
			var params = {
				DeliveryStreamName: config.aws_kinesis_end_point,
				Record: {
					Data: JSON.stringify(record) + "\n"
				}
			};
			firehose.putRecord(params, function (err, data) {
				if (err) console.log(err, err.stack); // an error occurred
				else console.log(data); // successful response
			});
		}
	}
	var buf = new Buffer(35);
	res.writeHead(200, {
     'Content-Type': 'image/png',
     'Content-Length': buf.length
   });
   res.end(buf); 
});

let server = app.listen(function () {
	let host = server.address().address;
	if (host == "::") {
		host = "localhost";
	}
	let port = server.address().port;
	console.log("Example app listening at http://%s:%s/cl", host, port);
})

module.exports = app;