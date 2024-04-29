const Validator = require("validator");
const isEmpty = require("./is-empty");

function validateDoctorRegisterInput(data) {
  let errors = {};

 // data.first_name = !isEmpty(data.first_name) ? data.first_name : "";
 // data.last_name = !isEmpty(data.last_name) ? data.last_name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
//   data.phone = !isEmpty(data.phone) ? data.phone : "";
  data.password = !isEmpty(data.password) ? data.password : "";
//   data.confirm_password = !isEmpty(data.confirm_password)
//     ? data.confirm_password
//     : "";

  // if (Validator.isEmpty(data.first_name)) {
  //   errors.first_name = "First Name field is required.";
  // }

  // if (Validator.isEmpty(data.last_name)) {
  //   errors.last_name = "Last Name field is required.";
  // }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Please put a valid email address.";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "E-mail field is required.";
  }

//   if (Validator.isEmpty(data.phone)) {
//     errors.phone = "Phone field is required.";
//   }

  if (data.password.length < 6) {
    errors.password = "Password must contain at least 6 characters";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required.";
  }

//   if (data.confirm_password != data.password) {
//     errors.confirm_password =
//       "Both the password and confirm password fields value must be matched.";
//   }

//   if (Validator.isEmpty(data.confirm_password)) {
//     errors.confirm_password = "Confirm Password field is required.";
//   }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

function validateUserRegisterInput(data) {
  let errors = {};

  data.first_name = !isEmpty(data.first_name) ? data.first_name : "";
  data.last_name = !isEmpty(data.last_name) ? data.last_name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.dob = !isEmpty(data.dob) ? data.dob : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.gender = !isEmpty(data.gender) ? data.gender : "";
  data.emergency_contact_name = !isEmpty(data.emergency_contact_name) ? data.emergency_contact_name : "";
  data.emergency_contact_number = !isEmpty(data.emergency_contact_number) ? data.emergency_contact_number : "";

  if (Validator.isEmpty(data.first_name)) {
    errors.first_name = "First Name field is required.";
  }

  if (Validator.isEmpty(data.last_name)) {
    errors.last_name = "Last Name field is required.";
  }
  if (Validator.isEmpty(data.dob)) {
    errors.last_name = "dob - date of birth field is required.";
  }
  if (Validator.isEmpty(data.gender)) {
    errors.last_name = "gender field is required.";
  }
  if (Validator.isEmpty(data.emergency_contact_name)) {
    errors.last_name = "emergency_contact_name is required.";
  }
  if (Validator.isEmpty(data.emergency_contact_number)) {
    errors.last_name = "emergency_contact_number is required.";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Please put a valid email address.";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "E-mail field is required.";
  }

//   if (Validator.isEmpty(data.phone)) {
//     errors.phone = "Phone field is required.";
//   }

  if (data.password.length < 6) {
    errors.password = "Password must contain at least 6 characters";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required.";
  }

//   if (data.confirm_password != data.password) {
//     errors.confirm_password =
//       "Both the password and confirm password fields value must be matched.";
//   }

//   if (Validator.isEmpty(data.confirm_password)) {
//     errors.confirm_password = "Confirm Password field is required.";
//   }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports ={
  validateDoctorRegisterInput,
  validateUserRegisterInput
}