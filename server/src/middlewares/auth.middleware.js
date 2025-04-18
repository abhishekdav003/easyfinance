import jwt from "jsonwebtoken";

export const isAdmin = (req, res, next) => {
  // Retrieve token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the token using the ACCESS_TOKEN_SECRET
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check if the decoded token's role is 'admin'
    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    // Attach the user data to the request object to be used in the next middleware or route handler
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Catch errors like invalid or expired tokens
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid token", error: error.message });
  }
};
