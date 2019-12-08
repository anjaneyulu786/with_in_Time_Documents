module.exports = function (app) {
	app.post('/ui/appointment', function (req, res) {
		try {
			var sessionObj = req.session;
			var userObj = sessionObj.requestObj['userObj'];
			req.body['createdBy'] = userObj.userId;
			create(req.body, function (response) {
				res.json(response);
			});
		} catch (e) {
			res.json(e);
		}
	});
	app.put('/ui/appointment', function (req, res) {
		try {
			update(req.body, function (response) {
				res.json(response);
			});
		} catch (e) {
			res.json(e);
		}
	});
	app.get('/ui/appointment/:appointmentId', function (req, res) {
		try {
			getDetails(req.params.appointmentId, function (response) {
				res.json(response);
			});
		} catch (e) {
			res.json(e);
		}
	});
	app.get('/ui/query/appointment', function (req, res) {
		try {
			getList(req.query, function (response) {
				res.json(response);
			});
		} catch (e) {
			res.json(e);
		}
	});
	app.get('/ui/query/appointmentList', function (req, res) {
		try {
			getAppointmentList(req.query, function (response) {
				res.json(response);
			});
		} catch (e) {
			res.json(e);
			console.log("req query error enter  ::: 2 ", e);
		}
	});
	app.get('/ui/userAppointments/', function (req, res) {
		try {
			var sessionObj = req.session;
			var userObj = sessionObj.requestObj['userObj'];
			getAllAppointmentsOfUser(userObj.userId, userObj.emailAddress, userObj.mobileNumber, function (response) {
				res.json(response);
			});
		} catch (e) {
			res.json(e);
		}
	});
	app.get('/ui/businessAppointments/:businessId', function (req, res) {
		try {
			getBusinessAppointments(req.params.businessId, function (response) {
				res.json(response);
			});
		} catch (e) {
			res.json(e);
		}
	});
	app.get('/ui/guestAppointments/', function (req, res) {
		try {
			var sessionObj = req.session;
			var guestObj = sessionObj.requestObj;
			getAllAppointmentsOfGuest(guestObj, function (response) {
				res.json(response);
			});
		} catch (e) {
			res.json(e);
		}
	});
	app.delete('/ui/appointment/:appointmentId', function (req, res) {
		try {
			remove(req.params.appointmentId, function (response) {
				res.json(response);
			});
		} catch (e) {
			res.json(e);
		}
	});
}

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var AppointmentSchema = new Schema(require('./appointmentSchema').appointmentSchema, { collection: 'appointment' });
var AppointmentModel = mongoose.model('appointment', AppointmentSchema);
var AppointmentController = require('./appointmentController');
var appointmentTemplate = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css"><div style="background-color:#69c0e2;width:80%; margin-left:auto; margin-right:auto; margin-bottom: 10px; border: 1px solid transparent; border-radius: 4px;"><h2 style="color:white;text-align: center;">Schedule App</h4></div><div style="width:80%; margin-left:auto; margin-right:auto; padding: 15px; margin-bottom: 20px; border: 1px solid transparent; border-radius: 4px;""><div style="font-family: Arial; border-color: #bce8f1;"><div style="vertical-align:middle; text-align:center;"><h2 style="color:#e62626">Your one stop place for all Appointment Schedules.!</h2><h5 style="color:#1d757d">Leverage the power of accesing shared calendar</h5><p style="color:#1d757d; text-align:left;">Congratulations!</p ><p style="font-size:0.8em; color:#A9A9A9; text-decoration:none;">If you are not the one who created account with us, please report this by going to this link <a style="text-decoration:none;" href="#">Report</a></p><hr/><p style="color:#1d757d">Dear <b>{0}</b> {1} has create you an appoinment for the "{2}". This appiontment is about "{3}". This is going to be happen on {4} at {5}.  You can contact the appiontor further regarding this.</p><a style="text-decoration: none; color: #337ab7;" href="{6}" target="_blank"><button id="acceptApt" style = "color: red;">Cencel</button></a><a style="text-decoration: none; color:#337ab7;" href="{7}" target ="_blank"><button id="cancelApt" style = "color: green; margin-left: 3%;">Accept</button><br><hr/><a style="font-size:0.8em; color:#3b5998; text-decoration:none;" href="#"> <i class="fa fa-facebook-official"></i> </a> | <a style="font-size:0.8em; color:#55acee; text-decoration:none;" href="#"> <i class="fa fa-twitter-square"></i> </a> |<a style="font-size:0.8em; color:#dc4e41; text-decoration:none;" href="#"> <i class="fa fa-google-plus-square"</i> </a></div></div></div>';

var utils = require('../../assets/utils').utils;
var MailHelper = require('../mailHelper/mailHelper');
var Token = require('../token/token');
var CONSTANTS = utils.CONSTANTS;
var DB_CODES = CONSTANTS.DATABASE_CODES;
var REQUEST_CODES = CONSTANTS.REQUEST_CODES;
var APPOINTMENT_CODES = CONSTANTS.APPOINTMENT;
var VALIDATE = utils.CONSTANTS.VALIDATE;
var validate = utils.validate;
var mongoUtils = utils.mongoUtils;
var moment = require('moment');
var Business = require('../business/business');

function create(appointment, callback) {
	var appointmentAPI = AppointmentController.AppointmentAPI(appointment);
	var errorList = [];
	if (!appointmentAPI.getTitle()) {
		var e = {
			status: VALIDATE.FAIL,
			error: utils.formatText(VALIDATE.REQUIRED, 'title')
		};
		errorList.push(e);
	}
	if (!appointmentAPI.getStartDate()) {
		var e = {
			status: VALIDATE.FAIL,
			error: utils.formatText(VALIDATE.REQUIRED, 'startDate')
		};
		errorList.push(e);
	}
	// if (!appointmentAPI.getEndDate()) {
	//    	var e = {
	// 			status: VALIDATE.FAIL,
	// 			error: utils.formatText(VALIDATE.REQUIRED, 'endDate')
	// 	};
	// 	errorList.push(e);
	// }
	if (!appointmentAPI.getAppointeeName()) {
		var e = {
			status: VALIDATE.FAIL,
			error: utils.formatText(VALIDATE.REQUIRED, 'appointeeName')
		};
		errorList.push(e);
	}
	if (!appointmentAPI.getAppointeePhone()) {
		var e = {
			status: VALIDATE.FAIL,
			error: utils.formatText(VALIDATE.REQUIRED, 'appointeePhone')
		};
		errorList.push(e);
	}
	if (!appointmentAPI.getStatus()) {
		var e = {
			status: VALIDATE.FAIL,
			error: utils.formatText(VALIDATE.REQUIRED, 'status')
		};
		errorList.push(e);
	}
	if (!appointmentAPI.getCreatedBy()) {
		var e = {
			status: VALIDATE.FAIL,
			error: utils.formatText(VALIDATE.REQUIRED, 'createdBy')
		};
		errorList.push(e);
	}
	if (errorList.length) {
		throw {
			status: REQUEST_CODES.FAIL,
			error: errorList
		};
	} else {
		var appointmentModel = new AppointmentModel(appointmentAPI);
		mongoUtils.getNextSequence('appointmentId', function (oSeq) {
			appointmentModel.appointmentId = oSeq;
			appointmentModel.dateCreated = utils.getSystemTime();
			appointmentModel.save(function (error) {
				if (error) {
					callback({
						status: DB_CODES.FAIL,
						error: error
					});
					return;
				} else {
					var phoneNumber = appointment.appointeePhone;
					var userPhoneNumber = appointment.userPhone;
					if (appointment.appointeeEmail) {
						var mailAddress = appointment.appointeeEmail;
						var template = {
							'subject': 'Invitation : ' + appointment.title,
							'body': utils.formatText(appointmentTemplate, mailAddress.substr(0, mailAddress.indexOf('@')), appointment.appointeeName, appointment.title, appointment.description, utils.getDateFromString(appointment.st + '', 'http://18.222.177.141:3003/ui/user/accept', 'http://18.222.177.141:3003/ui/user/cancle')),
							'recipients': [mailAddress],
							'from': 'Schedule App'
						};
						MailHelper.sendMail(template, function (response) {
							if (phoneNumber && phoneNumber.length) {
								utils.sendOtp(phoneNumber, appointment.description);
								callback({
									status: REQUEST_CODES.SUCCESS,
									result: [utils.formatText(APPOINTMENT_CODES.CREATE_SUCCESS, appointmentModel.appointmentId)]
								});
								return;
							}
						});
					} else if (phoneNumber && phoneNumber.length) {
						utils.sendOtp(phoneNumber, appointment.description);
						callback({
							status: REQUEST_CODES.SUCCESS,
							result: [utils.formatText(APPOINTMENT_CODES.CREATE_SUCCESS, appointmentModel.appointmentId)]
						});
						return;
					}
				}
			});
		});
	}
}

function getDetails(appointmentId, callback) {
	AppointmentModel.find({ 'appointmentId': appointmentId }, function (error, appointmentRecords) {
		if (error) {
			callback({
				status: DB_CODES.FAIL,
				error: error
			});
			return;
		} else {
			callback({
				status: REQUEST_CODES.SUCCESS,
				result: appointmentRecords
			});
			return;
		}
	});
}

function getList(query, callback) {
	AppointmentModel.find(query, function (error, appointmentRecords) {
		if (error) {
			console.log("query Error enter  ::: 1 ");
			callback({
				status: DB_CODES.FAIL,
				error: error
			});
			return;
		} else {
			callback({
				status: REQUEST_CODES.SUCCESS,
				result: appointmentRecords
			});
			return;
		}
	});
}

function getAppointmentList(query, callback) {
	businessId = query.businessId;
	startdate = query.startdate;
	Business.getDetails(businessId, function (response) {
		if (response.error) {
			callback(response);
			return;
		} else {
			var endDate;
			var business = response.result[0];
			var appointmentDuration = business.appointmentDuration;
			var appointmentsPerHour = business.appointmentsPerHour;

			if (appointmentDuration == '01:00') {
				const startDate = moment(startdate, "YYYY-MM-DDT HH:mm:ss");
				var resultDate = moment(startDate).add(60, 'minutes');
				endDate = moment(resultDate).format("YYYYMMDDHHmmss");

			} else if (appointmentDuration == '00:30') {
				const startDate = moment(startdate, "YYYY-MM-DDT HH:mm:ss");
				var resultDate = moment(startDate).add(30, 'minutes');
				endDate = moment(resultDate).format("YYYYMMDDHHmmss");
			}
			console.log(" start date final ::::", startdate);
			console.log(" End date final ::::::", endDate);
			query = { $and: [{ endDate: { $gt: startdate } }, { startDate: { $lt: endDate } }] };
			getList(query, function ( response) {
				console.log("query response enter  :::", response);
				if (response.error) {
					callback({
						status: DB_CODES.FAIL,
						error: error
					});
					return;
				} else {
					var appoinmentsCount = response.result.length;
					console.log("query appointments count ::: " ,appoinmentsCount);
					console.log('appoinments per hour :::', appointmentsPerHour);
					if (appoinmentsCount >= appointmentsPerHour) {
						callback({
							status: REQUEST_CODES.FAIL
						});
						return;
					} else {
						callback({
							status: REQUEST_CODES.SUCCESS,
							result: endDate
						});
						return;
					}
				}
			});
		}
	});
}

function update(appointment, callback) {
	appointment['dateUpdated'] = utils.getSystemTime();
	AppointmentModel.update({ "appointmentId": appointment.appointmentId }, { $set: appointment }, function (error, effectedRows) {
		if (error) {
			callback({
				status: DB_CODES.FAIL,
				error: error
			});
			return;
		} else {
			if (!effectedRows.nModified) {
				callback({
					status: REQUEST_CODES.FAIL,
					error: utils.formatText(APPOINTMENT_CODES.UPDATE_FAIL, appointment.appointmentId)
				});
				return;
			} else {
				callback({
					status: REQUEST_CODES.SUCCESS,
					result: [utils.formatText(APPOINTMENT_CODES.UPDATE_SUCCESS, appointment.appointmentId)]
				});
				return;
			}
		}
	});
}

function remove(appointmentId, callback) {
	AppointmentModel.remove({ "appointmentId": appointmentId }, function (error, effectedRows) {
		if (error) {
			callback({
				status: DB_CODES.FAIL,
				error: error
			});
			return;
		} else {
			if (!effectedRows.n) {
				callback({
					status: REQUEST_CODES.FAIL,
					error: utils.formatText(APPOINTMENT_CODES.DELETE_FAIL, appointmentId)
				});
				return;
			} else {
				callback({
					status: REQUEST_CODES.SUCCESS,
					result: [utils.formatText(APPOINTMENT_CODES.DELETE_SUCCESS, appointmentId)]
				});
				return;
			}
		}
	});
}

function getAllAppointmentsOfUser(userId, emailAddress, phoneNumber, callback) {
	var colorCodes = ['#3de875', '#d3215b', '#3a3fd1', '#d13ac6'];
	var appointments = [];
	var query = { $or: [{ 'createdBy': userId }, { 'appointeePhone': phoneNumber }, { 'appointeeEmail': emailAddress }] };
	// console.log('query', query);
	getList(query, function (response) {
		// console.log('response', response);
		if (response.error) {
			callback(response);
			return;
		} else {
			var appointmentRecords = response.result;
			if (appointmentRecords && appointmentRecords.length) {
				var lastIndex = appointmentRecords.length;
				var colorCodesIndex = 0;
				appointmentRecords.forEach(function (appointmentRecord) {
					if (colorCodesIndex > 3) {
						colorCodesIndex = 0;
					} else {
						colorCodesIndex = colorCodesIndex + 1;
					}
					var appt = {
						"appointmentId": appointmentRecord.appointmentId,
						"title": appointmentRecord.title,
						"description": appointmentRecord.description,
						"startDate": appointmentRecord.startDate,
						"endDate": appointmentRecord.endDate,
						"appointeeName": appointmentRecord.appointeeName,
						"appointeePhone": appointmentRecord.appointeePhone,
						"appointeeEmail": appointmentRecord.appointeeEmail,
						"dateCreated": appointmentRecord.dateCreated,
						"dateUpdated": appointmentRecord.dateUpdated,
						"status": appointmentRecord.status,
						"colorCode": colorCodes[colorCodesIndex]
					};
					appointments.push(appt);
					lastIndex = lastIndex - 1;
					if (lastIndex <= 0) {
						callback({
							status: REQUEST_CODES.SUCCESS,
							result: appointments
						});
						return;
					}
				});
			} else {
				callback({
					status: REQUEST_CODES.SUCCESS,
					result: appointmentRecords
				});
				return;
			}
		}
	});
}

function getAllAppointmentsOfGuest(guestObj, callback) {
	var colorCodes = ['#3de875', '#d3215b', '#3a3fd1', '#d13ac6'];
	var appointments = [];
	var phoneNumber = guestObj.mobile;
	var query = { 'appointeePhone': phoneNumber.substring(3) };
	getList(query, function (response) {
		if (response.error) {
			callback(response);
			return;
		} else {
			var appointmentRecords = response.result;
			if (appointmentRecords && appointmentRecords.length) {
				var lastIndex = appointmentRecords.length;
				var colorCodesIndex = 0;
				appointmentRecords.forEach(function (appointmentRecord) {
					if (colorCodesIndex > 3) {
						colorCodesIndex = 0;
					} else {
						colorCodesIndex = colorCodesIndex + 1;
					}
					var appt = {
						"appointmentId": appointmentRecord.appointmentId,
						"title": appointmentRecord.title,
						"description": appointmentRecord.description,
						"startDate": appointmentRecord.startDate,
						"endDate": appointmentRecord.endDate,
						"appointeeName": appointmentRecord.appointeeName,
						"appointeePhone": appointmentRecord.appointeePhone,
						"appointeeEmail": appointmentRecord.appointeeEmail,
						"dateCreated": appointmentRecord.dateCreated,
						"dateUpdated": appointmentRecord.dateUpdated,
						"status": appointmentRecord.status,
						"colorCode": colorCodes[colorCodesIndex]
					};
					appointments.push(appt);
					lastIndex = lastIndex - 1;
					if (lastIndex <= 0) {
						callback({
							status: REQUEST_CODES.SUCCESS,
							result: appointments
						});
						return;
					}
				});
			} else {
				callback({
					status: REQUEST_CODES.SUCCESS,
					result: appointmentRecords
				});
				return;
			}
		}
	});
}

function getBusinessAppointments(businessId, callback) {
	var colorCodes = ['#3de875', '#d3215b', '#3a3fd1', '#d13ac6'];
	var appointments = [];
	var query = { 'createdBy': businessId };
	getList(query, function (response) {
		console.log("Inside API code ::::::::::::")
		if (response.error) {
			callback(response);
			return;
		} else {
			var appointmentRecords = response.result;
			if (appointmentRecords && appointmentRecords.length) {
				var lastIndex = appointmentRecords.length;
				var colorCodesIndex = 0;
				appointmentRecords.forEach(function (appointmentRecord) {
					if (colorCodesIndex > 3) {
						colorCodesIndex = 0;
					} else {
						colorCodesIndex = colorCodesIndex + 1;
					}
					var appt = {
						"appointmentId": appointmentRecord.appointmentId,
						"title": appointmentRecord.title,
						"description": appointmentRecord.description,
						"startDate": appointmentRecord.startDate,
						"endDate": appointmentRecord.endDate,
						"appointeeName": appointmentRecord.appointeeName,
						"appointeePhone": appointmentRecord.appointeePhone,
						"appointeeEmail": appointmentRecord.appointeeEmail,
						"dateCreated": appointmentRecord.dateCreated,
						"dateUpdated": appointmentRecord.dateUpdated,
						"status": appointmentRecord.status,
						"colorCode": colorCodes[colorCodesIndex]
					};
					appointments.push(appt);
					lastIndex = lastIndex - 1;
					if (lastIndex <= 0) {
						callback({
							status: REQUEST_CODES.SUCCESS,
							result: appointments
						});
						return;
					}
				});
			} else {
				callback({
					status: REQUEST_CODES.SUCCESS,
					result: appointmentRecords
				});
				return;
			}
		}
	});
}

module.exports.getList = getList;