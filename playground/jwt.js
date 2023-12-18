const jwt = require("jsonwebtoken");

const generateJWT = async (payload) => {
  const token = jwt.sign(
    {
      data: payload,
    },
    "secret-asim",
    { expiresIn: "1h" }
  );
  return token;
};

const verifyJWT = async (token) => {
  const d = jwt.verify(token, "secret-asim");

  return d;
};

const test = async () => {
  const data = await generateJWT({
    userId: "630xxxxx",
    email: "asimneupane11@gmail.com",
    Role: ["Admin"],
  });
  const isVerified = await verifyJWT(data);
  console.log({ data, isVerified });
};

test();


