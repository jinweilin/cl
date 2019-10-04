'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const maxmind = require('maxmind');
const emptygif = require('emptygif');
const moment = require('moment-timezone');
const athena = require("athena-client");
var AWS = require("aws-sdk");
AWS.config.update({
  region: 'us-east-1'
});
var cityLookup = maxmind.openSync('./db/GeoLite2-City.mmdb');
var firehose = new AWS.Firehose();
// declare a new express app
const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));

if ( typeof process.env.AWS_ACCESS_KEY_ID == 'undefined') {
  console.log("please set : AWS_ACCESS_KEY_ID") ;
  //process.exit();
}
if ( typeof process.env.AWS_SECRET_ACCESS_KEY == 'undefined') {
  console.log("please set : AWS_SECRET_ACCESS_KEY") ;
  //process.exit();
}
if ( typeof process.env.AWS_KINESIS_DELIVERY_STREAM_NAME == 'undefined') {
  console.log("please set : AWS_KINESIS_DELIVERY_STREAM_NAME") ;
  //process.exit();
}
var config = {
  aws_access_key_id: process.env.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  aws_kinesis_end_point: process.env.AWS_KINESIS_DELIVERY_STREAM_NAME,
  region: 'us-east-1',
};
var clientConfig = {
  bucketUri: 's3://user-accesslog/result'
}
// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//計算統計資料
app.get('/dailyUpdate', function (req, res) {
  var client = athena.createClient(clientConfig, config);
  let sql = "select to_char(date,'yyyymmdd'), recid, array_join(array_agg(prod_no), ',', '') as prods from (" +
  " select date, recid, prod_no from settour.user_accesslog where year = to_char(now()- interval '1' day,'yyyy') "+ 
  " and month = to_char(now()- interval '1' day,'mm') and day = to_char(now()- interval '1' day,'dd') "+
  " order by recid , date desc ) GROUP BY to_char(date,'yyyymmdd'), recid" ;
  client.execute(sql).toPromise()
    .then(function (data) {
      console.log(data)
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data));
    }).catch(function (err) {
      console.error(err)
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({
        error: 0
      }));
    })
});

//使用者資料收集
app.get('/cl', function (req, res) {
  if (Object.keys(req.query).length !== 0) {
    var record = {};
    if (req.query.prod_no) // 商品編號
      record.prod_no = req.query.prod_no.toUpperCase();
    if (req.query.m_id) //會員編號
      record.m_id = req.query.m_id.toUpperCase();
    if (req.query.ord_no) //訂單編號
      record.ord_no = req.query.ord_no.toUpperCase();
    if (req.query.amt) //訂單金額
      record.amt = req.query.amt;
    if (req.query.gid) //GA ID
      record.gid = req.query.gid.toUpperCase();
    if (req.query.recid) //GA ID
      record.recid = req.query.recid.toUpperCase();
    if (req.query.desc) //網頁desc
      record.desc = req.query.desc;
    if (req.query.title) //網頁Title
      record.title = req.query.title;
    if (req.query.beg_dt) //出發日期
      record.beg_dt = req.query.beg_dt;
    if (req.query.url) //網址
      record.url = req.query.url;
    if (req.query.data) //其他Data
      record.data = req.query.data;
    if (req.query.channel) //廣告渠道
      record.channel = req.query.channel.toUpperCase();
    if (req.query.hostname) //網站名稱
      record.hostname = req.query.hostname.toLowerCase();
    if (req.query.uri)
      record.uri = req.query.uri;
    var ip = req.headers['x-forwarded-for'] || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : ""); // IP
    record.ip = ip;
    record.userAgent = req.headers['user-agent'] || ''; //使用瀏覽器版本
    record.date = moment().tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss"); //記錄時間
    if (req.query.act) //網頁活動,預設 VIEW
      record.act = req.query.act.toUpperCase();
    else
      record.act = 'VIEW';
    if (ip !== "") { //用 IP 找出使用者城市資料
      var city = cityLookup.get(ip);
      if (city !== null) {
        if (typeof city.city !== 'undefined') {
          record.city = city.city.names.en;
        }
        record.country = city.country.names.en;
        record.continent = city.continent.names.en;
        record.location = city.location;
      }
    }
    if (Object.keys(record).length !== 0) {
      // emptygif.sendEmptyGif(req, res, {
      //   'Content-Type': 'image/gif',
      //   'Content-Length': emptygif.emptyGifBufferLength,
      //   'Cache-Control': 'public, max-age=0' // or specify expiry to make sure it will call everytime
      // });
      console.log(JSON.stringify(record));
      var params = {
        DeliveryStreamName: config.aws_kinesis_end_point,
        Record: {
          Data: JSON.stringify(record) + "\n"
        }
      };
      firehose.putRecord(params, function (err, data) {
        console.log('save done.');
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data); // successful response
        // emptygif.sendEmptyGif(req, res, {
        //   'Content-Type': 'image/gif',
        //   'Content-Length': emptygif.emptyGifBufferLength,
        //   'Cache-Control': 'public, max-age=0' // or specify expiry to make sure it will call everytime
        // });
      });
    } else {
      emptygif.sendEmptyGif(req, res, {
        'Content-Type': 'image/gif',
        'Content-Length': emptygif.emptyGifBufferLength,
        'Cache-Control': 'public, max-age=0' // or specify expiry to make sure it will call everytime
      });
    }
  } else {
    emptygif.sendEmptyGif(req, res, {
      'Content-Type': 'image/gif',
      'Content-Length': emptygif.emptyGifBufferLength,
      'Cache-Control': 'public, max-age=0' // or specify expiry to make sure it will call everytime
    });
  }
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