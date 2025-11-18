import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  const { userId } = req.body;
  return userId?res.send(userId+"USER_ID"):res.send("no user id")
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
