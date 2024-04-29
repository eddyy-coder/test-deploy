function checkRequiredFields(obj) {
    const requiredFields = [
        'first_name',
        'last_name',
        'email',
        'profile',
        'height',
        'weight',
        'gender',
        'dob',
        'phone_no',
        'relation',
        'preexisting_medication',
        'preexisting_condition',
        'emergency_contact_name',
        'emergency_contact_number'
    ];

    // Check if all required fields exist in the object
    for (const field of requiredFields) {
        if (!(field in obj)) {
            return false; // Field is missing, return false
        }
    }

    return true; // All required fields exist
}

function checkUserBodyNotUpdate(reqBody) {
    const forbiddenKeys = ['email', 'password', 'phone_no'];

    // Check if any forbidden keys are present in the request body
    const foundKeys = Object.keys(reqBody).filter(key => forbiddenKeys.includes(key));

    // If any forbidden keys are found, throw an error with the key names
    if (foundKeys.length > 0) {
        const forbiddenKeyNames = foundKeys.join(', ');
        throw new Error(`Cannot update the following user details: ${forbiddenKeyNames}`);
    }
}
module.exports = {
    checkRequiredFields,
    checkUserBodyNotUpdate
}

