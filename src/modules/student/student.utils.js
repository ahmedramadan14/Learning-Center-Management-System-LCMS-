const Student = require('./student.model');

// @desc    Generate a unique 8-digit student code
const generateUniqueStudentCode = async (session = null) => {
  let isUnique = false;
  let studentCode = '';

  while (!isUnique) {
    studentCode = Math.floor(10000000 + Math.random() * 90000000).toString();

    const existingStudent = await Student.findOne({ studentCode }).session(session);

    if (!existingStudent) {
      isUnique = true;
    }
  }

  return studentCode;
};

module.exports = { generateUniqueStudentCode };