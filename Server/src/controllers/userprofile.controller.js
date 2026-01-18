
const dotenv = require("dotenv");
dotenv.config();
const { sequelize } = require("../models");
const {
    User,
    UserProfile
} = require("../models/index.js");
const getUserProfile = async (req, res) => {
    try {
        const userId = req?.user?.id;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
            include: [
                {
                    model: UserProfile,
                    as: "profile"
                }
            ]
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "User found successfully",
            user: user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get user profile",
            error: error.message
        })
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const userId = req?.user?.id;
        const { firstName, lastName, phone, avatar } = req.body;
        const user = await User.findByPk(userId, {
            attributes: {
                exclude: ['password']
            },
            include: [
                {
                    model: UserProfile,
                    as: "profile",
                    where: {
                        userId: userId
                    },
                    attributes: {
                        exclude: ['userId']
                    }
                }
            ]
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;
        user.avatar = avatar;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            user: user
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to update user profile",
            error: err.message
        })
    }
}

const deleteUserProfile = () => {

}

module.exports = {
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
}

