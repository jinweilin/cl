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

5. curl -d "prod_no=AAAA&gid=123" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://localhost:55305/cl
You could see the result:  {"code":"000"} and there are some information about kinesis on the console, 
for example : 
{ RecordId: 'tbHeep6BMepjJcKX6WDXTg1OJUUGHhj.........' }

app.js for run on client
lambda.js for run on AWS's lamdba


