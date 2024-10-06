// backend/controllers/controller.js
const bcrypt = require("bcrypt")
const mongoose = require('mongoose');
const Employee = require('../models/Employee_DB');
 
const BasicSalary = require('../models/Basicsalary_DB');
 
const CreateError = require('../utilis/createError');
const Leave = require('../models/Leave_DB');
const LeaveRequest = require('../models/LeaveRequests_DB');
const Admin = require("../models/Admin")
const jwt = require("jsonwebtoken")
 
const { getIO } = require('../socket'); 
const fs = require('fs');
const path = require('path');
 

// Add this function to your existing controller.js file
const countEmployeesByDesignation = async (req, res) => {
  try {
    const count = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(count.map(item => ({ department: item._id, count: item.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 

const add_admin = async (req,res, next) => {

  try {
      const hash = bcrypt.hashSync(req.body.password, 5)
      const newUser = new Admin({
          ...req.body,
          password: hash
      })
      await newUser.save()
      res.status(201).send("User has been Created!")

  } catch (error) {
      next(error)
  }
}

const login_admin = async (req,res, next) => {
  try {
      const user = await Admin.findOne({email: req.body.email})
      
      if(!user) return next(CreateError(404,"user not found"))

      const isCorrect = bcrypt.compareSync(req.body.password, user.password)
      if (!isCorrect) return next(400, "wrong password or username!")

      const token = jwt.sign(
          {
          id: user._id,
          },
           process.env.JWT_KEY
      )
      
      const {password, ...info} = user._doc
      res
          .cookie("accessToken", token, {
              httpOnly: false,
              path: '/',
          })
          .status(200)
          .send(info)

  } catch (error) {
      next(error)
  }
}


// register api for employee


const addEmployee = async (req, res) => {
  try {
   
    const hash = bcrypt.hashSync(req.body.password, 5)
    const newEmployee = new Employee({
      ...req.body,
      password: hash,
    });
 
    // Saving the new employee to the database
    await newEmployee.save();
 
    // Sending the created employee data as a response
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login_employee = async (req,res, next) => {
  try {
      const user = await Employee.findOne({email: req.body.email})
      
      if(!user) return next(CreateError(404,"user not found"))

      const isCorrect = bcrypt.compareSync(req.body.password, user.password)
      if (!isCorrect) return next(400, "wrong password or username!")

      const token = jwt.sign(
          {
          id: user._id,
          },
           process.env.JWT_KEY
      )
      
      const {password, ...info} = user._doc
      res
          .cookie("accessToken", token, {
              httpOnly: false,
          })
          .status(200)
          .send(info)

  } catch (error) {
      next(error)
  }
}

 
 
const getAllEmployees = async (req, res) => {
  try {
    // Fetch all employees from the database
    const employees = await Employee.find();
 
    // Sending the list of employees as a response
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 

const editEmployee = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
 
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
 
    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
 
const getEmployeeById = async (req, res) => {
  const { id } = req.params;
 
  try {
    // Fetch the employee from the database using the provided ID
    const employee = await Employee.findById(id);
 
    // Check if the employee with the specified ID exists
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
 
    // Sending the employee data as a response
    res.status(200).json(employee);
  } catch (error) {
    console.error('Error fetching employee by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
 
 
const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
 
    // Check if the employee with the given ID exists
    const existingEmployee = await Employee.findById(employeeId);
    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
 
    // Delete the employee from the database using deleteOne()
    await Employee.deleteOne({ _id: employeeId });
 
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};
const searchEmployee = async (req, res) => {
  const { query } = req.params;

  try {
    // Use a case-insensitive regex to match the query in multiple fields
    const employees = await Employee.find({
      $or: [
        { firstName: { $regex: new RegExp(query, 'i') } },
        { lastName: { $regex: new RegExp(query, 'i') } },
        // Add more fields as needed for searching
      ],
    });

    res.status(200).json(employees);
  } catch (error) {
    console.error('Error searching employees:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
 
const addBasicSalary = async (req, res) => {
  try {
    const { designation, salary } = req.body;
    const newBasicSalary = new BasicSalary({ designation, salary });
    await newBasicSalary.save();
    res.status(201).json(newBasicSalary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBasicSalaries = async (req, res) => {
  try {
    const basicSalaries = await BasicSalary.find();
    res.status(200).json(basicSalaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editBasicSalary = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const updatedBasicSalary = await BasicSalary.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedBasicSalary) {
      return res.status(404).json({ error: 'Basic Salary not found' });
    }

    res.status(200).json(updatedBasicSalary);
  } catch (error) {
    console.error('Error updating basic salary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteBasicSalary = async (req, res) => {
  try {
    const basicSalaryId = req.params.id;

    const existingBasicSalary = await BasicSalary.findById(basicSalaryId);
    if (!existingBasicSalary) {
      return res.status(404).json({ message: 'Basic Salary not found' });
    }

    await BasicSalary.deleteOne({ _id: basicSalaryId });

    res.status(200).json({ message: 'Basic Salary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 

const generatePayslip = async (req, res) => {
  const employeeId = req.params.id;

  try {
    // Fetch employee details
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Fetch basic salary based on employee designation
    const basicSalary = await BasicSalary.findOne({ designation: employee.designation });
    if (!basicSalary) {
      return res.status(404).json({ message: 'Basic salary not found for the employee' });
    }

    // Fetch all allowances
    const allowances = await Allowance.find();

    // Calculate total allowance
    let totalAllowance = 0;
    const individualAllowances = [];
    allowances.forEach((allowance) => {
      totalAllowance += allowance.value;
      individualAllowances.push({
        name: allowance.name,
        value: allowance.value
      });
    });

    // Fetch tax percentage based on employee designation
    const deduction = await Deduction.findOne({ designation: employee.designation });
    if (!deduction) {
      return res.status(404).json({ message: 'Tax percentage not found for the employee' });
    }

    // Calculate tax amount
    const taxAmount = (deduction.tax / 100) * basicSalary.salary;
    const sub_total=basicSalary.salary + totalAllowance;
    // Calculate total salary
    const totalSalary = sub_total - taxAmount;

    // Prepare payslip data
    const payslip = {
      name: `${employee.firstName} ${employee.lastName}`,
      employeeId: employee._id,
      designation: employee.designation,
      email: employee.email,
      basicSalary: basicSalary.salary,
      allowances: individualAllowances,
      taxAmount,
      sub_total,
      totalSalary,
    };

    res.status(200).json(payslip);
  } catch (error) {
    console.error('Error generating payslip:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


 
const editProfilePic = async (req, res) => {
  const { id } = req.params;
  const { profilepic } = req.body; // Assuming the file path is in req.body

  try {
    const updatedApplicant = await Applicant.findByIdAndUpdate(id, { profilepic }, { new: true });
    if (!updatedApplicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    res.status(200).json(updatedApplicant);
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const editCV = async (req, res) => {
  const { id } = req.params;
  const { profilecv } = req.body; // Assuming profilecv path is in req.body if uploaded

  try {
    const updatedApplicant = await Applicant.findByIdAndUpdate(
      id,
      profilecv ? { profilecv } : {}, // Update only if profilecv exists
      { new: true }
    );
    if (!updatedApplicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    res.status(200).json(updatedApplicant);
  } catch (error) {
    console.error('Error updating CV:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
 
const addLeave = async (req, res) => {
  try {
    const { name, type, unit } = req.body;
    const newLeave = new Leave({
      name,
      type,
      unit,
      status: 'inactive', // You can set a default status if needed
    });
    const savedLeave = await newLeave.save();
    res.status(201).json(savedLeave);
  } catch (error) {
    console.error('Error adding leave:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

 
const deleteLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;

    const existingLeave = await Leave.findById(leaveId);
    if (!existingLeave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    await Leave.deleteOne({ _id: leaveId });

    res.status(200).json({ message: 'Leave deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find();
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const activateDeactivateLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const { status } = req.body;

    // Find leave by ID and update its status
    const updatedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      { $set: { status } },
      { new: true } // Return the updated leave
    );

    if (!updatedLeave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    res.json(updatedLeave);
  } catch (error) {
    console.error('Error activating/deactivating leave:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const editJob = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const updatedJob = await Job.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(200).json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const editLeave = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  try {
    const updatedLeave = await Leave.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedLeave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    res.status(200).json(updatedLeave);
  } catch (error) {
    console.error('Error updating leave:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}; 
const getLeaveById = async (req, res) => {
 
  
  try {
    const { id } = req.params;
    console.log('Fetching leave with ID:', id);
    const leave = await Leave.findById(id);
    if (!leave) {
      console.log('Leave not found');
      return res.status(404).json({ error: 'Leave not found' });
    }

    console.log('Leave found:', leave);
    res.status(200).json(leave);
  } catch (error) {
    console.error('Error fetching leave by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getAllLeaveTypes = async (req, res) => {
  try {
    const leaves = await Leave.find({}, 'name'); // Only fetch the 'name' field of leaves
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addLeaveRequest = async (req, res) => {
  try {
    // Extract data from request body
    const { userID, username, startDate, endDate, leaveType, description } = req.body;

    // Validate required fields (example)
    if (!startDate || !endDate || !leaveType) {
      console.log("Missing required fields for leave request");
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    // Create a new leave request instance
    const newLeaveRequest = new LeaveRequest({
      userID,
      username,
      startDate,
      endDate,
      leaveType,
      description,
    });

    // Save the new leave request to the database
    await newLeaveRequest.save();
    console.log("Leave request saved:", newLeaveRequest);

    // Emitting event to all connected clients
    console.log(`Emitting newLeaveRequestNotification event for user ${username}`);
    getIO().emit('newLeaveRequestNotification', {
      message: `New leave request from ${username}`,
      leaveRequestID: newLeaveRequest._id,
    });

    res.status(201).json(newLeaveRequest);
  } catch (error) {
    console.error('Error adding leave request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find();
    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Internal Server Error' }); // Improve error handling
  }
};
const getAllLeaveRequestsbyid = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ userID: req.params.userID });
    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Internal Server Error' }); // Improve error handling
  }
};


const cancelLeaveRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedLeaveRequest = await LeaveRequest.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });

    if (updatedLeaveRequest) {
      res.json(updatedLeaveRequest);
    } else {
      res.status(404).json({ message: 'Leave request not found' });
    }
  } catch (error) {
    console.error('Error cancelling leave request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const approveLeaveRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedLeaveRequest = await LeaveRequest.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
    if (updatedLeaveRequest) {
      console.log(`Leave request ${id} approved, emitting leaveStatusChanged event`);
      getIO().emit('leaveStatusChanged', { leaveRequestId: id, status: 'approved' });
      res.json(updatedLeaveRequest);
    } else {
      console.log(`Leave request ${id} not found for approval`);
      res.status(404).json({ message: 'Leave request not found' });
    }
  } catch (error) {
    console.error('Error approving leave request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const rejectLeaveRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedLeaveRequest = await LeaveRequest.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (updatedLeaveRequest) {
      console.log(`Leave request ${id} rejected, emitting leaveStatusChanged event`);
      getIO().emit('leaveStatusChanged', { leaveRequestId: id, status: 'rejected' });
      res.json(updatedLeaveRequest);
    } else {
      console.log(`Leave request ${id} not found for rejection`);
      res.status(404).json({ message: 'Leave request not found' });
    }
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const editEmployeeName = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid applicant ID' });
    }

    // Check if name is provided
    if (!name) {
      return res.status(400).json({ message: 'Please provide the name' });
    }

    // Find the applicant by ID and update its name
    const updatedApplicant = await Employee.findByIdAndUpdate(id, { name }, { new: true });

    // Check if the applicant with the provided ID exists
    if (!updatedApplicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    // If the applicant is updated successfully, send a success response
    res.status(200).json({ message: 'Applicant name updated successfully', employee: updatedApplicant });
  } catch (error) {
    console.error('Error updating applicant name:', error);
    res.status(500).json({ message: 'Failed to update applicant name', error: error.message });
  }
};

const editEmployeeEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid applicant ID' });
    }

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: 'Please provide the email' });
    }

    // Find the applicant by ID and update its email
    const updatedApplicant = await Employee.findByIdAndUpdate(id, { email }, { new: true });

    // Check if the applicant with the provided ID exists
    if (!updatedApplicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    // If the applicant is updated successfully, send a success response
    res.status(200).json({ message: 'Applicant email updated successfully', employee: updatedApplicant });
  } catch (error) {
    console.error('Error updating applicant email:', error);
    res.status(500).json({ message: 'Failed to update applicant email', error: error.message });
  }
};

const editEmployeePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid applicant ID' });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ message: 'Please provide the password' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 5);

    // Find the applicant by ID and update its password
    const updatedApplicant = await Employee.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });

    // Check if the applicant with the provided ID exists
    if (!updatedApplicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    // If the applicant is updated successfully, send a success response
    res.status(200).json({ message: 'Applicant password updated successfully', employee: updatedApplicant });
  } catch (error) {
    console.error('Error updating applicant password:', error);
    res.status(500).json({ message: 'Failed to update applicant password', error: error.message });
  }
};






const editEProfilePic = async (req, res) => {
  const { id } = req.params;
  const { profilepic } = req.body; // Assuming the file path is in req.body

  try {
    const updatedApplicant = await Employee.findByIdAndUpdate(id, { profilepic }, { new: true });
    if (!updatedApplicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    res.status(200).json(updatedApplicant);
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const editECV = async (req, res) => {
  const { id } = req.params;
  const { profilecv } = req.body; // Assuming profilecv path is in req.body if uploaded

  try {
    const updatedApplicant = await Employee.findByIdAndUpdate(
      id,
      profilecv ? { profilecv } : {}, // Update only if profilecv exists
      { new: true }
    );
    if (!updatedApplicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    res.status(200).json(updatedApplicant);
  } catch (error) {
    console.error('Error updating CV:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const editAdminName = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid applicant ID' });
    }

    // Check if name is provided
    if (!name) {
      return res.status(400).json({ message: 'Please provide the name' });
    }

    // Find the applicant by ID and update its name
    const updatedAdmin = await Admin.findByIdAndUpdate(id, { name }, { new: true });

    // Check if the applicant with the provided ID exists
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    // If the applicant is updated successfully, send a success response
    res.status(200).json({ message: 'Applicant name updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating applicant name:', error);
    res.status(500).json({ message: 'Failed to update applicant name', error: error.message });
  }
};

const editAdminEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid applicant ID' });
    }

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ message: 'Please provide the email' });
    }

    // Find the applicant by ID and update its email
    const updatedAdmin = await Admin.findByIdAndUpdate(id, { email }, { new: true });

    // Check if the applicant with the provided ID exists
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    // If the applicant is updated successfully, send a success response
    res.status(200).json({ message: 'Applicant email updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating applicant email:', error);
    res.status(500).json({ message: 'Failed to update applicant email', error: error.message });
  }
};

const editAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid applicant ID' });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ message: 'Please provide the password' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 5);

    // Find the applicant by ID and update its password
    const updatedAdmin = await Admin.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });

    // Check if the applicant with the provided ID exists
    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    // If the applicant is updated successfully, send a success response
    res.status(200).json({ message: 'Applicant password updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating applicant password:', error);
    res.status(500).json({ message: 'Failed to update applicant password', error: error.message });
  }
};




const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Applicant not found' });
    }
    res.status(200).json({ admin: admin });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applicant', error: error.message });
  }
};

const editAdminProfilePic = async (req, res) => {
  const { id } = req.params;
  const { profilepic } = req.body; // Assuming the file path is in req.body

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(id, { profilepic }, { new: true });
    if (!updatedAdmin) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const editAdminCV = async (req, res) => {
  const { id } = req.params;
  const { profilecv } = req.body; // Assuming profilecv path is in req.body if uploaded

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      profilecv ? { profilecv } : {}, // Update only if profilecv exists
      { new: true }
    );
    if (!updatedAdmin) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    res.status(200).json(updatedAdmin);
  } catch (error) {
    console.error('Error updating CV:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  add_admin,
  login_admin,
  addEmployee,
  login_employee,
   getAllEmployees,
  deleteEmployee,
  editEmployee,
  getEmployeeById,
  editEmployeeName,editEmployeeEmail,editEmployeePassword, editECV, editEProfilePic,
  searchEmployee,
 
  addBasicSalary,
  getAllBasicSalaries,
  editBasicSalary,
  deleteBasicSalary,
 
  generatePayslip,
 
 
  editJob,
  
  getAdminById,editAdminName,editAdminEmail,editAdminPassword,editAdminCV,editAdminProfilePic,
 
  editProfilePic,editCV,
 
  getAllLeaves, deleteLeave, editLeave, addLeave, activateDeactivateLeave,
  getLeaveById, getAllLeaveTypes,
 
  countEmployeesByDesignation,
  addLeaveRequest,getAllLeaveRequests,cancelLeaveRequest,
  approveLeaveRequest,rejectLeaveRequest, getAllLeaveRequestsbyid
};
 