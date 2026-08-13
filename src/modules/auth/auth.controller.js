const asyncHandler = require('../../middlewares/asyncHandler');
const ApiError = require('../../utils/ApiErrors');
const User = require('../user/user.model');
const Teacher = require('../teacher/teacher.model');
const Student = require('../student/student.model');
const TokenBlacklist = require('../tokenBlacklist/tokenBlacklist.model');
const Parent = require('../parent/parent.model');
const { generateUniqueStudentCode } = require('../student/student.utils');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 
const mongoose = require('mongoose');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

// @desc    Unified Signup (Student, Teacher, Parent)
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signup = asyncHandler(async (req, res, next) => {
  const {
    name,
    phone,
    email,
    password,
    role,
    gender,
    grade,
    parentPhone,
  } = req.body;

  if (role === 'secretary' || role === 'admin') {
    return next(new ApiError('You cannot sign up with this role directly', 400));
  }

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    return next(new ApiError('This phone number is already registered', 400));
  }

  if (email) {
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return next(new ApiError('This email address is already registered', 400));
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const isApproved = role !== 'teacher'; 

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [user] = await User.create(
      [
        {
          name,
          phone,
          email: email || undefined,
          password: hashedPassword,
          role,
          isApproved,
          ...(role === 'teacher' && { approvalStatus: 'pending' }),
        },
      ],
      { session }
    );

    let profile = null;

    if (role === 'teacher') {
      const [teacher] = await Teacher.create(
        [{ userId: user._id, isActive: true }],
        { session }
      );
      profile = teacher;
    } else if (role === "student") {
      const studentCode = await generateUniqueStudentCode();

      const [student] = await Student.create(
        [
          {
            userId: user._id,
            studentCode: studentCode,
            parentPhone,
            gender,
            grade,
            // Public registration must not let a caller enroll themselves in
            // an arbitrary teacher's records. Staff assignment happens only
            // through the protected student-management endpoint.
            teacher: null,
            createdById: req.user ? req.user._id : user._id,
          },
        ],
        { session }
      );

      profile = student;
    } else if (role === 'parent') {
      const [parent] = await Parent.create(
        [{ user: user._id }],
        { session }
      );
      profile = parent;
    }

    await session.commitTransaction();
    session.endSession();

    const userObj = user.toObject();
    delete userObj.password;

    const token = isApproved ? generateToken(user._id) : null;

    res.status(201).json({
      success: true,
      message:
        role === 'teacher'
          ? 'Teacher account registered successfully. Pending admin approval.'
          : 'Account created successfully',
      data: {
        user: userObj,
        profile,
      },
      ...(token && { token }),
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
});
// @desc    Login
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ phone: req.body.phone }).select('+password');

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Incorrect phone or password', 401));
  }

  if (user.isActive === false) {
    return next(new ApiError('Your account has been deactivated', 403));
  }

  if (user.role === 'teacher' && user.approvalStatus === 'rejected') {
    return next(new ApiError('Your teacher account request was rejected', 403));
  }

  if (user.isApproved !== true) {
    return next(new ApiError('Your account is pending approval', 403));
  }

  const token = generateToken(user._id);

  const userObj = user.toObject();
  delete userObj.password;

  res.status(200).json({ data: userObj, token });
});

// @desc    Protect Routes Middleware
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new ApiError('You are not logged in, please login to get access to this route', 401)
    );
  }

  const isBlacklisted = await TokenBlacklist.findOne({ token });
  if (isBlacklisted) {
    return next(new ApiError('Invalid token, please login again', 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError('The user belonging to this token no longer exists', 401)
    );
  }

  if (currentUser.isActive === false) {
    return next(new ApiError('Your account has been deactivated', 403));
  }

  if (currentUser.role === 'teacher' && currentUser.approvalStatus === 'rejected') {
    return next(new ApiError('Your teacher account request was rejected', 403));
  }

  if (currentUser.isApproved !== true) {
    return next(new ApiError('Your account is pending admin approval', 403));
  }

  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError('User recently changed password, please login again...', 401)
      );
    }
  }

  req.user = currentUser;
  next();
});

exports.requireApproved = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'teacher' && req.user.approvalStatus === 'rejected') {
    return next(new ApiError('Your teacher account request was rejected', 403));
  }

  if (req.user.isApproved !== true) {
    return next(new ApiError('Your account is pending admin approval', 403));
  }
  next();
});

// @desc    Logout
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError('No token provided', 400));
  }

  const token = authHeader.split(' ')[1];

  await TokenBlacklist.create({ token });

  res.status(200).json({ message: 'Logged out successfully' });
});

exports.allowedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to access this route', 403)
      );
    }
    next();
  };
};
