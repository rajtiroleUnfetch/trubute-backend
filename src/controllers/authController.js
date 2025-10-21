const users = [
    { id: "1", username: "admin", password: "admin123", role: "admin" },
    { id: "2", username: "user", password: "user123", role: "user" },
  ];
  
  // 👤 Login for both admin & user
  exports.login = (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username && u.password === password);
  
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  
    res.json({ message: "Login successful", user });
  };
  