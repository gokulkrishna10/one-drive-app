const util = require('../customnodemodules/util_node_module/utils')
const ErrorMod = require('../customnodemodules/error_node_module/errors')
const customError = new ErrorMod()
const constants = require('../constants/constants')

exports.apiUsageValidation = function (req, res, next) {
    //If no statuscode, put it as 500
    if (!Boolean(req.body.apiDetails.httpStatusCode)) {
        req.body.apiDetails.httpStatusCode = 500;
    }
    if (util.isNull(req.body) && util.isNull(req.body.apiDetails)) {
        req.isValidationError = true;
        next(customError.BadRequest("request needs a body"))
    } else if (util.isNull(req.headers.api_key) && util.isNull(req.body.apiDetails.apiName)) {
        req.isValidationError = true;
        next(customError.BadRequest("request needs either an api key or api name"))
    } else if (isNaN(req.body.apiDetails.executionTime)) {
        req.isValidationError = true;
        next(customError.BadRequest("request needs an execution time"))
    } else if (util.isNull(req.body.apiDetails.apiVersion)) {
        req.isValidationError = true;
        next(customError.BadRequest("request needs an apiVersion"))
    } else if (util.isNull(req.body.apiDetails.endPointName)) {
        req.isValidationError = true;
        next(customError.BadRequest("request needs an endPointName"))
    } else if (util.isNull(req.body.apiDetails.clientIpAddress)) {
        req.isValidationError = true;
        next(customError.BadRequest("request needs an clientIpAddress"))
    } else if (util.isNull(req.body.apiDetails.httpStatusCode)) {
        req.isValidationError = true;
        next(customError.BadRequest("request needs a httpStatusCode"))
    } else {
        req.isValidationError = false;
        next()
    }
}

exports.getUsageValidation = function (req, res, next) {
    if (util.isNull(req.headers.api_key)) {
        next(customError.BadRequest("API key is required"))
    } else if (util.isNull(req.query.intervalType) && !(constants.intervalTypeConstants.includes(req.query.intervalType.toUpperCase()))) {
        next(customError.BadRequest("Interval type is required and it should be either one of daily, monthly or yearly"))
    } else if (util.isNull(req.query.fromDate)) {
        next(customError.BadRequest("FromDate is required"))
    } else {
        next();
    }
}

//donotUpdateUsage flag is set to true to prevent the invocation of updateApiUsage api in the global error handler
exports.getErrorValidation = function (req, res, next) {
    let err = null;
    if (util.isNull(req.headers.api_key)) {
        err = customError.BadRequest("API key is required");
        err.donotUpdateUsage = true;
        next(err)
    } else if (util.isNull(req.query.intervalType) && !(constants.intervalTypeConstants.includes(req.query.intervalType.toUpperCase()))) {
        err = customError.BadRequest("Interval type is required and it should be either one of daily, monthly or yearly");
        err.donotUpdateUsage = true;
        next(err)
    } else if (util.isNull(req.query.fromDate)) {
        err = customError.BadRequest("FromDate is required");
        err.donotUpdateUsage = true;
        next(err)
    } else if (!Boolean(req.query["getErrorCountsOnly"])) {
        err = customError.BadRequest("getErrorCountsOnly is required");
        err.donotUpdateUsage = true;
        next(err)
    } else {
        next();
    }
}

exports.getAPIOnboardValidation = function (req, res, next) {
    let err = null
    if (Object.entries(req.body).length === 0) {
        err = customError.BadRequest("request needs a body")
        err.donotUpdateUsage = true;
        next(err)
    } else if (util.isNull(req.body.name)) {
        err = customError.BadRequest("request needs apiName")
        err.donotUpdateUsage = true;
        next(err)
    } else if (util.isNull(req.body.displayName)) {
        err = customError.BadRequest("request needs displayName")
        err.donotUpdateUsage = true;
        next(err)
    } else if (util.isNull(req.body.description)) {
        err = customError.BadRequest("request needs description")
        err.donotUpdateUsage = true;
        next(err)
    } else if (util.isNull(req.body.apiVersion)) {
        err = customError.BadRequest("request needs apiVersion")
        err.donotUpdateUsage = true;
        next(err)
    }else if (util.isNull(req.body.basePricePerCall)) {
        err = customError.BadRequest("request needs basePricePerCall")
        err.donotUpdateUsage = true;
        next(err)
    } else {
        next()
    }
}
