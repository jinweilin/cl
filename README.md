# Collect Data to S3 by AWS Kinesis
You could post some user's data to lambda and lambda saves that by kinesis firehose,
and it will be deliveried to S3. You also save that to Redshift.

#Create AWS Kinesis Firehose Service
You have to create a Kinesis Firehose and set the delivery name in the envirament.

#Run Client
1. install nodejs
2. npm install
3. export Envirament 
<pre>
  export AWS_ACCESS_KEY_ID= AWS access key id
  export AWS_SECRET_ACCESS_KEY= AWS secret access key
  export AWS_KINESIS_DELIVERY_STREAM_NAME= AWS Kinesis Firehose delivery stream name
</pre>
4. node app.js
Run it on terminal , then you could see : Example app listening at http://localhost:55090/cl

5. Tracker : curl http://localhost:55305/cl?prod_no=AAAA&gid=123
app.js for run on client
lambda.js for run on AWS's lamdba

6. It collects these data. 
<pre>
  prod_no : String (UpperCase)
  m_id : String (UpperCase)
  ord_no : String (UpperCase)
  gid : String (UpperCase)
  desc : String
  title : String
  beg_dt : String
  url : String
  data : Json
  channel: String (UpperCase)
  hostname : String (LowerCase)
  uri: String
  ip : String
  userAgent : String
  date : timestamp
  act : String ( Default : View)
  city : String
  country : String
  continet : String
  location : Json
</pre>


