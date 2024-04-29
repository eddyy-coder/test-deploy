function checkRequiredFields(obj) {
    const requiredFields = [
        'first_name',
        'last_name',
        'email',
        'profile',
        'gender',
        'specialist',
        'phone_no',
    ];

    // Check if all required fields exist in the object
    for (const field of requiredFields) {
        if (!(field in obj)) {
            return false; // Field is missing, return false
        }
    }

    return true; // All required fields exist
}

module.exports = {
    checkRequiredFields
}

