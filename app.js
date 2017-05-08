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

app.post('/cl', function (req, res) {
	var record = {
		date: (new Date()).getTime(),
		prod_no: req.body.prod_no,
		member_uuid: req.body.m_id,
		ord_no: req.body.ord_no,
		gid: req.body.gid,
		desc: req.body.desc,
		title: req.body.title,
		beg_dt: req.body.beg_dt,
		url: req.body.url,
		data: req.body.data,
		channel: req.body.channel
	}
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
	res.status(200).json({
		code: "000"
	});
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