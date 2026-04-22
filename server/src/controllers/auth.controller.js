export async function register(req, res) {
  const { name, email } = req.body;

  return res.status(201).json({
    message: "Register endpoint is ready",
    user: {
      name,
      email
    }
  });
}

export async function login(req, res) {
  const { email } = req.body;

  return res.status(200).json({
    message: "Login endpoint is ready",
    email
  });
}
