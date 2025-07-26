const Joi = require('joi');

const validateParseOrder = (req, res, next) => {
  const schema = Joi.object({
    text: Joi.string()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'string.empty': 'Order text cannot be empty',
        'string.min': 'Order text must be at least 1 character long',
        'string.max': 'Order text cannot exceed 1000 characters',
        'any.required': 'Order text is required'
      }),
    
    category: Joi.string()
      .valid('beverages', 'snacks', 'fruits', 'groceries', 'food', 'health', 'household', 'automotive')
      .required()
      .messages({
        'any.only': 'Category must be one of: beverages, snacks, fruits, groceries, food, health, household, automotive',
        'any.required': 'Category is required'
      })
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return next(error);
  }
  
  next();
};

module.exports = {
  validateParseOrder
};
