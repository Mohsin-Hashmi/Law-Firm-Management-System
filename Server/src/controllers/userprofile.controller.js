
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
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
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
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
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

const deleteUserProfile = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }
        const userProfile = await UserProfile.findOne({
            where: {
                userId: userId
            }
        }, { transaction: t });
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: "User profile not found"
            })
        }
        await userProfile.destroy({ transaction: t });
        await t.commit();
        return res.status(200).json({
            success: true,
            message: "User profile deleted successfully"
        })
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            success: false,
            message: "Failed to delete user profile",
            error: error.message
        })
    }
}

module.exports = {
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
}

