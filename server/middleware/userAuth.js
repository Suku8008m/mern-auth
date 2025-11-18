//To get userId from request body,we will get the user id from the token cookies
//we need middleware to get the token and using that token we can get userId
import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const cond = req.body === undefined ? {} : req.body;
  req.body = cond;
  const { token } = req.cookies;
  return res.send(token)
  if (!token) {
    return res.json({
      success: false,
      message: "Not Authoraized.",
    });
  }
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.body.userId = tokenDecode.id;
    } else {
      return res.json({
        success: false,
        message: "Not Authoraized.Login Again",
      });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
export default userAuth;
