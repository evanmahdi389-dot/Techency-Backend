const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

class AuthService {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.email) {
      // Check if email is being changed and is already taken
      if (updateData.email !== user.email) {
        const existingUser = await userRepository.findByEmail(updateData.email);
        if (existingUser) {
          const error = new Error('Email already in use');
          error.statusCode = 400;
          throw error;
        }
        user.email = updateData.email;
      }
    }
    if (updateData.password) user.password = updateData.password;
    if (updateData.profileImage) user.profileImage = updateData.profileImage;

    await user.save();

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage
    };
  }
}

module.exports = new AuthService();
