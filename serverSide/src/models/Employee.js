dynamodb = require('./../lib/DynamoDB');
var Promise = require('bluebird');

var getAll = function(conditions) {
    var searchString = '';
    if (conditions.search) {
        searchString = "and contains(Username, :search)";
    }
    var params = {
        TableName: "Employee",
        KeyConditionExpression: "#t = :emp",
        FilterExpression: "#s = :s_val " + searchString,
        ExpressionAttributeNames: {"#s": "Status", "#t": "Type"},
        ExpressionAttributeValues: {
            ":s_val": "Active",
            ":emp": "Employee"
        }
    };

    if (searchString != '') {
        params.ExpressionAttributeValues[":search"] = conditions.search;
    }

    if (conditions.page) {
        params.Limit =conditions.page;
    }

    if (conditions.orderBy) {
        var orderBy = conditions.orderBy.toLowerCase() =="asc" ? true : false
        params.ScanIndexForward = orderBy;
    }

    if (conditions.sortBy) {
        switch(conditions.sortBy) {
            case "Email" :
                params.IndexName = "EmployeeAndEmailIndex";
                break;
            case "DateOfJoining":
                params.IndexName = "EmployeeAndDateOfJoiningIndex";
                break;
            case "DateOfBirth":
                params.IndexName = "EmployeeAndDateOfBirthIndex";
                break;
            case "Experience":
                params.IndexName = "EmployeeAndExperienceIndex";
                break;
            default:
        }
    }
    return new Promise(function(resolve, reject) {
        dynamodb.query(params, function(err, data) {
            if (err) {
                console.log(JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log(JSON.stringify(data, null, 2));
                resolve(data);
            }
        });
    });
}


var createEmployee = function(Employee) {

    var params = {
        TableName: "Employee",
        Item : Employee,
        ConditionExpression: "attribute_not_exists(#t) and attribute_not_exists(EmpId) " +
        "and attribute_not_exists(Username) and attribute_not_exists(Email)",
        ExpressionAttributeNames: {"#t": "Type"}
    };

    return new Promise(function(resolve, reject) {
        dynamodb.put(params, function(err, data) {
            if (err) {
                console.log(JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log(JSON.stringify(data, null, 2));
                resolve(data);
            }
        });
    })
}

var updateEmployee = function(Employee) {

    var updateExpression =  [];
    ExpressionAttributeNames = {};
    ExpressionAttributeValues = {};

    if (typeof Employee.Status !== "undefined") {
        updateExpression.push("#st = :s");
        ExpressionAttributeNames = {"#st": "Status"};
        ExpressionAttributeValues[":s"] = Employee.Status;
    }

    if (typeof Employee.Experience !== "undefined") {
        updateExpression.push("Experience = :e");
        ExpressionAttributeValues[":e"] = Employee.Experience;
    };

    if (typeof Employee.DateOfBirth !== "undefined") {
        updateExpression.push("DateOfBirth = :dob");
        ExpressionAttributeValues[":dob"] = Employee.DateOfBirth;
    }

    if (typeof Employee.DateOfJoining !== "undefined") {
        updateExpression.push("DateOfJoining = :doj");
        ExpressionAttributeValues[":doj"] =  Employee.DateOfJoining;
    }

    var params = {
        TableName: "Employee",
        Key:{
            "Type": Employee.Type,
            "EmpId": parseInt(Employee.EmpId)
        },
        UpdateExpression: "set "+updateExpression.join(","),
        ExpressionAttributeNames: ExpressionAttributeNames,
        ExpressionAttributeValues: ExpressionAttributeValues,
        ReturnValues:"ALL_NEW"
    };

    return new Promise(function(resolve, reject) {
        dynamodb.update(params, function(err, data) {
            if (err) {
                console.log(JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log(JSON.stringify(data, null, 2));
                resolve(data);
            }
        });
    });
}

var getEmployeeById = function(Employee) {
    var params = {
        TableName: "Employee",
        Key:{
            "Type": Employee.Type,
            "EmpId": parseInt(Employee.EmpId)
        }
    };

    return new Promise(function(resolve, reject) {
        dynamodb.get(params, function(err, data) {
            if (err) {
                console.log(JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log(JSON.stringify(data, null, 2));
                resolve(data);
            }
        });
    });
}

var deleteEmployee = function(Employee) {
    var params = {
        TableName: "Employee",
        Key:{
            "Type": Employee.Type,
            "EmpId": parseInt(Employee.EmpId)
        }
    };

    return new Promise(function(resolve, reject) {
        dynamodb.delete(params, function(err, data) {
            if (err) {
                console.log(JSON.stringify(err, null, 2));
                reject(err);
            } else {
                console.log(JSON.stringify(data, null, 2));
                resolve(data);
            }
        });
    });
}

module.exports = {
    getAll : getAll,
    createEmployee : createEmployee,
    updateEmployee : updateEmployee,
    getEmployeeById: getEmployeeById,
    deleteEmployee : deleteEmployee
};