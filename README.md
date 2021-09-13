# api-usage-ms

This microservice helps to track the API Usage (requests and errors) and also helps in monetizing the APIs.

# How to Configure Clients for API Usage
If you want an API to make use of API Usage Microservice to keep track of usage, errors for monitoring or monetizing purpose, the following changes are required in the client API. <br/>

### Copy apiUsage module to your project
Path : mh-api-ms/apiUsage/apiUsage.js
<br/>

### config.js changes
Add the following config variables to each section (dev, preprod & prod) of config.json. For example, the local section will have the following entries to the dev section. <br/>
```
	DEV: 
	"API_USAGE_UPDATE_URL": "http://34.249.3.126:7100/v1/api-usage",
    "API_USAGE_VALIDATE_URL": "http://34.249.3.126:7100/v1/validate-api-usage", <br/>
    "API_USAGE_SELF_API_NAME": "Half-Hourly-Meter-History", <br/>
```

### app.js changes
1. Add the middleware - apiUsage.validateRequest - to the beginning of the router middlewares. <br/>
2. Add the router middleware - finalPostResponseProcessor - after the end point call <br/>
```
	router.get('/v1/periodic-data', apiUsage.validateRequest, requestValidation.validatePeriodicQuery, routes.getPeriodicData, finalPostResponseProcessor);
```

3. Add the following block of code that implements this middleware <br/>
Please note the following <br/>
	- The updateApiUsage module should be the first module to be invoked
	- Add the module - uploadLogsToS3 - only if your module implements S3 Logging.
```
	//This should be the last router middle ware, all post-processing activities can 
	// be invoked from here.    
	function finalPostProcessing(req, res) {
		//IMPORTANT: apiUsage middle ware should be the first middleware to be invoked 
		// after the method to be logged for usage so as to keep track of execution time.
		apiUsage.updateApiUsage(req,res);
		s3logger.uploadLogsToS3(req, res);
	}
```
4. Add the usage update and S3 Logging from the error handler in app.js too
Please note the following <br/>
	- The updateApiUsage module should be the first module to be invoked
	- Add the module - uploadLogsToS3 - only if your module implements S3 Logging.
```
	app.use(function error_handler(err, req, res, next) {
    res.header("Content-Type", "application/json; charset=utf-8");
    res.status(err.code || 500).send(err)
    
    apiUsage.updateApiUsage(req, err, next);
    var errData = {};
    errData.responseData = err;
    s3logger.uploadLogsToS3(req, errData, next);
});
```

### router/index.js changes
1. Install node module : perf_hooks
```
	npm i perf_hooks
```
2. The only change you need to make is to insert the following code at the beginning of the function.
```
	req.startTime = performance.now();
```
- Sample code with proper implementation <br/>
	You just need to add the above line before the call begins. <br/>
	But also make sure you are calling next() correctly, depending on success or error sccenario. <br/>
	- Promise pattern
	```
		exports.getPeriodicData = (req, res, next) => {
			req.startTime = performance.now();
			sqlQueries.getPeriodicDataFromDB(req, res)
			.then((response) => {
				res.responseData = response;
				res.send(200, response);
				next();
			}).catch(err => {
				next(err, req, res, next)
			})
	}
	```

	- Callback pattern

	```
		exports.evComparison = (req, res, next) =>{
			req.startTime = performance.now();
			evData.evCompareData(req, (err, vehicleMOTData) => {
				if (err) {
					res.status(err.code).send(err.msg);
					updateResponseData(req, res, err, "evCompare", "getEVComparisonData");
					next();
				} else {
					res.status(200).send(vehicleMOTData);
					updateResponseData(req, res, err, "evCompare", "getEVComparisonData");
					next();
				}
			})
		}
	```

## Testing the Changes
After implementing the above changes, you can check the results from the following DB. <br/>
--Connetion details <br/>
server: openenergy.crjdegsnxmp2.eu-west-1.rds.amazonaws.com <br/>
Schema : api_usage_report_dev <br/>
userName:  api_usasge_report_devuser <br/>
password: 891f5b0d-6873-4b5f-a0ae-9b890ed0739d <br/>


Query: <br/>
Select * from APIUsage
order by APIUsageId desc
LIMIT 5; 




# APIUsage Design


## MIDDLEWARE DESIGN

1. Middleware method will receive all the details in the req & res
	updateAPIUsage(req,res)
		req will have the following : apiKey, apiversion, endPointName, clientIPAdress
		res will have the following : httpStatusCode, timeTakenInMilliSeconds (populated by client) ,errorCode & errorDescription (in case of error)

## USAGE DATA INJECTION

1. The middleware module will POST to the following method of this micro service:
```
	POST usage <br/>
	    Url : v1/usage<br/>
	    Header : apiKey<br/>
    Body (JSON):<br/>
	Success Scenario Args : apiversion, endPointName, clientIPAdress,httpStatusCode, timeTakenInMilliSeconds	<br/>
	Error Scenario Args : apiversion, endPointName, clientIPAdress, httpStatusCode, 
    timeTakenInMilliSeconds, errorCode, errorDescription  <br/>
        - Insert in to APIError table first in case of an error <br/>
        - Insert to APIUsage table : <br/>
				- apiCustomerId, apiRouteid, apiKey, apiName, apiVersion, 
				endPointName, clientIPAdress, httpStatusCode, pricePerCall, TimeTakenInMilliSeconds
    <br/>
	Validation:<br/>
		- All parameters are required, error params required in case of error only.<br/>
```


2. All Client API Endpoint Validation:<br/>

```
    POST validateRequest<br/>
        Url : v1/validateRequest<br/>
        Header : apiKey<br/>
        Body (JSON) :  <br/>
		- Check if the customer has valid subscription based on the APIKey<br/>
```
<br/>  

3. Record internal errors in the API during processing to the APIError table<br/>

```
	- Any errors during processing have to be logged as internal errors in the APIError <br/>table<br/>
		ErrorTypeId - 1 (External by default)<br/>
		ErrorId - errorCode from input <br/>
		ErrorMessage - errorDescription from input <br/>
		InputData - Inout JSON object to the usage end point
		ErrorStatus -  0 - no action required
        			   1 - active, need to be resolved, when ErrorType = Internal <br/>
		ErrorMessage - Details of the error occured<br/>
```
<br/>
<br/>

## USAGE DATA RETRIEVAL<br/>
<br/>
1. GET usage<br/>

```
	Header : apiKey, apiVersion<br/>
	Query Params : intervalType ,endPointName = null, fromDate, toDate = null<br/>
	intervalType : d, m or y<br/>
    <br/>
    Validations:<br/>
		- endPointName - Validate in the middleware where we will have all endpoints listed<br/>
		- usageType (Jaipal)<br/>
			=> d : If difference between date > x days, give an error: Please provide a range less than 60 days<br/>
		- fromDate & toDate : dateTime values, format : YYYY-MM-DD:HH:MM:SS<br/>
```

2. GET errors<br/>

```
	Header : apiKey, apiVersion<br/>
	Query Params : intervalType ,endPointName = null, fromDate, toDate = null<br/>
	intervalType : d, m or y<br/>
    <br/>
    Validations:<br/>
		- endPointName - Validate in the middleware where we will have all endpoints listed<br/>
		- usageType (Jaipal)<br/>
			=> d : If difference between date > x days, give an error: Please provide a range less than 60 days<br/>
		- fromDate & toDate : dateTime values, format : YYYY-MM-DD:HH:MM:SS<br/>
```
<br/>


## API Usage Management - INTERNAL APIs<br/>
<br/>
1. On boarding an API for APIUsage<br/>
	RegisterAPIRoute<br/>
		- apiName, apiVersion, endpointName = null<br/>
			- Create entry in APIRoute & APIRoutePrice tables<br/>
            
2. Customer Onboarding for an API Subscription<br/>
	RegisterAPICustomer<br/>
		- apiKey, customerName, address = null, email = null, pricingModelName <br/>
				- Create an entry in Customer, APISubscription tables <br/>
3. Ability to subscribe an API for a Customer <br/>
4. Ability for Admin to unsubscribe an API for a Customer <br/>
<br/>

## Non-Functional Requirements<br/>
<br/>

1. Send Alert Email on Receiving requests from an invalid subscription<br/>
		- Check if the customer has an active entry in the table : APISubscription<br/>
        - If the previous query has flag : HasQuotaLimits set to true, Check if the <br/>customer has not exceeded the volume limits in the table : APIRouteCustomerLimit<br/>
2. Semd Alert Email on customer reaching limits<br/>
3. Need to reset API Quota Limits <br/>
		- Use a Cron Job to implement this<br/>
6. Invoice creation process<br/>
<br/>
<br/>


## Analytics SQL Queries :<br/>
<br/>
1. Time:<br/>
	- Best Time Averages<br/>
	- Time Averages Per Route<br/>
2. Revenue:<br/>
	- Most Revenue APIs<br/>