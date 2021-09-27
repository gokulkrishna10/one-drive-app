//----------------------Usage Queroes-------------------------
module.exports.GET_DAILY_USAGE_WITH_ENDPOINTS_QUERY = `SELECT DATE(RequestDate) as Date, an.DisplayName as APIName , APIVersion, EndpointName, Count(*) as Count 
FROM APIUsage au
JOIN APIName an on au.APINameId = an.APINameId
where APIKey = ? 
AND DATE(RequestDate) >= DATE(?) 
AND DATE(RequestDate)<= DATE(?) 
GROUP BY Date, an.DisplayName, APIVersion, EndpointName`;
module.exports.GET_DAILY_USAGE_WO_ENDPOINTS_QUERY = `SELECT DATE(RequestDate) as Date, an.DisplayName as APIName , APIVersion, Count(*) as Count 
FROM APIUsage au
JOIN APIName an on au.APINameId = an.APINameId
where APIKey = ?
AND DATE(RequestDate) >= DATE(?) 
AND DATE(RequestDate)<= DATE(?) 
GROUP BY Date, an.DisplayName, APIVersion`;

module.exports.GET_MONTHLY_USAGE_WITH_ENDPOINTS_QUERY = `SELECT DATE_FORMAT(RequestDate,'%M %Y') AS Month, an.DisplayName as APIName , APIVersion, EndpointName, Count(*) as Count 
FROM APIUsage au
JOIN APIName an on au.APINameId = an.APINameId
where APIKey = ? 
AND DATE(RequestDate) >= DATE(?) 
AND DATE(RequestDate)<= DATE(?) 
GROUP BY Month, an.DisplayName, APIVersion, EndpointName`;
module.exports.GET_MONTHLY_USAGE_WO_ENDPOINTS_QUERY = `SELECT DATE_FORMAT(RequestDate,'%M %Y') AS Month, an.DisplayName as APIName , APIVersion, Count(*) as Count 
FROM APIUsage au
JOIN APIName an on au.APINameId = an.APINameId
where APIKey = ?
AND DATE(RequestDate) >= DATE(?) 
AND DATE(RequestDate)<= DATE(?) 
GROUP BY Month, an.DisplayName, APIVersion`;

module.exports.GET_YEARLY_USAGE_WITH_ENDPOINTS_QUERY = `SELECT YEAR(RequestDate) AS Year, an.DisplayName as APIName , APIVersion, EndpointName, Count(*) as Count 
FROM APIUsage au
JOIN APIName an on au.APINameId = an.APINameId
where APIKey = ? 
AND DATE(RequestDate) >= DATE(?) 
AND DATE(RequestDate)<= DATE(?) 
GROUP BY Year, an.DisplayName, APIVersion, EndpointName`;
module.exports.GET_YEARLY_USAGE_WO_ENDPOINTS_QUERY = `SELECT YEAR(RequestDate) AS Year, an.DisplayName as APIName , APIVersion, Count(*) as Count 
FROM APIUsage au
JOIN APIName an on au.APINameId = an.APINameId
where APIKey = ?
AND DATE(RequestDate) >= DATE(?) 
AND DATE(RequestDate)<= DATE(?) 
GROUP BY Year, an.DisplayName, APIVersion`;

//----------------------Error Queroes-------------------------
module.exports.GET_ERRORS_WITH_DETAILS = `SELECT RequestDate as DateTime, an.DisplayName as APIName , APIVersion, EndpointName, HttpStatusCode, ae.ErrorId, ae.ErrorMessage
FROM APIUsage au
JOIN APIName an on au.APINameId = an.APINameId
JOIN APIError ae on ae.APIErrorId = au.APIErrorId
where APIKey = ?
AND DATE(RequestDate) >= DATE(?) 
AND DATE(RequestDate)<= DATE(?) 
AND au.APIErrorId IS NOT NULL
LIMIT ?`;

module.exports.GET_DAILY_ERROR_COUNT = `SELECT DATE(RequestDate) as Date, an.DisplayName as APIName , APIVersion, EndpointName, Count(*) as Count
FROM APIUsage au
JOIN APIName an on au.APINameId = an.APINameId
JOIN APIError ae on ae.APIErrorId = au.APIErrorId
where APIKey = ?
AND DATE(RequestDate) >= DATE(?) 
AND DATE(RequestDate)<= DATE(?) 
AND au.APIErrorId IS NOT NULL
GROUP BY Date, an.DisplayName, APIVersion`;
module.exports.GET_MONTLY_ERROR_COUNT = `SELECT DATE_FORMAT(RequestDate,'%M %Y') AS Month, an.DisplayName as APIName , APIVersion, EndpointName, Count(*) as Count
FROM APIUsage au
JOIN APIName an on au.APINameId = an.APINameId
JOIN APIError ae on ae.APIErrorId = au.APIErrorId
where APIKey = ?
AND DATE(RequestDate) >= DATE(?) 
AND DATE(RequestDate)<= DATE(?) 
AND au.APIErrorId IS NOT NULL
GROUP BY Month, an.DisplayName, APIVersion`;
module.exports.GET_YEARLY_ERROR_COUNT = `SELECT YEAR(RequestDate) AS Year, an.DisplayName as APIName , APIVersion, EndpointName, Count(*) as Count
FROM APIUsage au
JOIN APIName an on au.APINameId = an.APINameId
JOIN APIError ae on ae.APIErrorId = au.APIErrorId
where APIKey = ?
AND DATE(RequestDate) >= DATE(?) 
AND DATE(RequestDate)<= DATE(?) 
AND au.APIErrorId IS NOT NULL
GROUP BY Year, an.DisplayName, APIVersion`;

