// Sending Response and Token function
export const sendToken = (res, user, statusCode, message) => {
  // token
  const token = user.getJWTToken();

  // cookie options
  const options = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
  };
  const user__data = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    tasks: user.tasks,
    verified: user.verified,
  };

  //   saving in a cookie
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, message, user: user__data });
};
