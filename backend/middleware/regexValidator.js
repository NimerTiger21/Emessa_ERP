// regexValidator.js
const validateSearch = (req, res, next) => {
  const { search } = req.query;
  if (search && !/^[\w\d]+$/.test(search)) {
    return res.status(400).json({ 
      error: 'Invalid search characters',
      message: 'Only alphanumeric characters allowed'
    });
  }
  next();
};