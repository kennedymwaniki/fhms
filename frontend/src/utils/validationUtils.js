export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  // Minimum 6 characters, at least one letter and one number
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return regex.test(password);
};

export const validatePhone = (phone) => {
  // Basic phone number validation (can be customized based on country format)
  const regex = /^\+?[\d\s-]{10,}$/;
  return regex.test(phone);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateLength = (value, min, max) => {
  if (!value) return false;
  const length = value.toString().length;
  return length >= min && (max ? length <= max : true);
};

export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = values[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = 'This field is required';
    } else if (value) {
      if (fieldRules.email && !validateEmail(value)) {
        errors[field] = 'Invalid email address';
      }
      if (fieldRules.phone && !validatePhone(value)) {
        errors[field] = 'Invalid phone number';
      }
      if (fieldRules.password && !validatePassword(value)) {
        errors[field] = 'Password must be at least 6 characters with letters and numbers';
      }
      if (fieldRules.minLength && !validateLength(value, fieldRules.minLength)) {
        errors[field] = `Must be at least ${fieldRules.minLength} characters`;
      }
      if (fieldRules.maxLength && !validateLength(value, 0, fieldRules.maxLength)) {
        errors[field] = `Must not exceed ${fieldRules.maxLength} characters`;
      }
      if (fieldRules.match && value !== values[fieldRules.match]) {
        errors[field] = `Must match ${fieldRules.match}`;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};