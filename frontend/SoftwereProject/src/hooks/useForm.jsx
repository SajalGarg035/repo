import { useState } from 'react';

const useForm = (initialState = {}, onSubmit) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length === 0) {
      await onSubmit(values);
    } else {
      setErrors(validationErrors);
    }
  };

  const validate = (formValues) => {
    const errors = {};
    Object.keys(formValues).forEach((key) => {
      if (!formValues[key] && formValues[key] !== 0) {
        errors[key] = `${key} is required`;
      }
    });
    return errors;
  };

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
    setValues,
  };
};

export default useForm;