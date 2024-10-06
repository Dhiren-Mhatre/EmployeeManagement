// backend/routes/routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controller/Controller');
const emailController = require('../nodemailController');
const { verifyToken } = require("../middleware/jwt")

 
// Define routes
router.post('/send-email', verifyToken, emailController.sendEmail);
router.get('/email-count',verifyToken, emailController.getEmailCount);

// admin
router.post('/add_admin', controller.add_admin);
router.post('/login_admin', controller.login_admin);
 
 
// Employee routes
// Add this line inside your routes configuration
router.get('/employee/designation-count', controller.countEmployeesByDesignation);
router.post('/add_employee',verifyToken, controller.addEmployee);
router.post('/login_employee', controller.login_employee);

router.get('/get_employees',verifyToken,controller.getAllEmployees);
router.put('/edit_employee/:id',verifyToken, controller.editEmployee);
router.get('/get_employee/:id',verifyToken, controller.getEmployeeById);
router.delete('/delete_employee/:id',verifyToken, controller.deleteEmployee);
router.get('/search_employee/:query',verifyToken, controller.searchEmployee);

router.put('/employeeName/:id',verifyToken, controller.editEmployeeName);
router.put('/employeeEmail/:id',verifyToken, controller.editEmployeeEmail);
router.put('/employeePassword/:id',verifyToken, controller.editEmployeePassword);
router.put('/addEmployeeimg/:id', verifyToken,controller.editEProfilePic);
router.put('/addEmployeecv/:id', verifyToken,controller.editECV);

router.get('/get_admin/:id',verifyToken, controller.getAdminById);
router.put('/adminName/:id',verifyToken, controller.editAdminName);
router.put('/adminEmail/:id',verifyToken, controller.editAdminEmail);
router.put('/adminPassword/:id',verifyToken, controller.editAdminPassword);
router.put('/addAdminimg/:id', verifyToken,controller.editAdminProfilePic);
router.put('/addAdmincv/:id', verifyToken,controller.editAdminCV);

 
  
 
// Basic Salary routes
router.post('/add_basic_salary',verifyToken, controller.addBasicSalary);
router.get('/get_basic_salaries', verifyToken,controller.getAllBasicSalaries);
router.put('/edit_basic_salary/:id', verifyToken,controller.editBasicSalary);
router.delete('/delete_basic_salary/:id', verifyToken,controller.deleteBasicSalary);
//helloooo
//
// Payslip route
 
 //admin_side
router.get('/get_leaves', verifyToken,controller.getAllLeaves);
router.post('/add_leave', verifyToken,controller.addLeave);
router.put('/edit_leave/:id', verifyToken,controller.editLeave);
router.delete('/delete_leave/:id', verifyToken,controller.deleteLeave);
router.put('/activate_deactivate_leave/:id', verifyToken,controller.activateDeactivateLeave);
router.get('/get_leave/:id', verifyToken,controller.getLeaveById);

//employee_side
router.post('/requests', verifyToken,controller.addLeaveRequest);
router.get('/requests',verifyToken, controller.getAllLeaveRequests);
router.get('/requestsbyid/:userID',verifyToken, controller.getAllLeaveRequestsbyid);
router.patch('/requests/:id',verifyToken, controller.cancelLeaveRequest);

//admin side
router.patch('/approve_requests/:id', verifyToken,controller.approveLeaveRequest);
router.patch('/reject_requests/:id', verifyToken,controller.rejectLeaveRequest);
 

 

 
module.exports = router;
 