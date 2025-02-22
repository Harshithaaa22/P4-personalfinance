import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "./auth.css";
import Particles from "react-tsparticles";
//import { loadFull } from "tsparticles";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/"); // Redirect if user is already logged in
    }
  }, [navigate]);

  // const particlesInit = useCallback(async (engine) => {
  //   await loadFull(engine);
  // }, []);

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    theme: "dark",
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, password } = values;

    if (!name || !email || !password) {
      toast.error("All fields are required!", toastOptions);
      return;
    }

    setLoading(true);

    // Retrieve existing users from localStorage
    const existingUsers = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email is already registered
    const userExists = existingUsers.find((user) => user.email === email);
    if (userExists) {
      toast.error("Email already registered. Please log in.", toastOptions);
      setLoading(false);
      return;
    }

    // Store new user
    const newUser = { name, email, password };
    const updatedUsers = [...existingUsers, newUser];

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("user", JSON.stringify(newUser)); // Store logged-in user

    toast.success("Registration successful!", toastOptions);

    setTimeout(() => {
      navigate("/"); // Redirect to homepage after success
    }, 2000);
  };

  return (
    <>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <Particles
          //id="tsparticles"
          //init={particlesInit}
          options={{
            background: { color: { value: "#000" } },
            fpsLimit: 60,
            particles: {
              number: { value: 200, density: { enable: true, value_area: 800 } },
              color: { value: "#ffcc00" },
              shape: { type: "circle" },
              opacity: { value: 0.5, random: true },
              size: { value: 3, random: { enable: true, minimumValue: 1 } },
              move: { enable: true, speed: 2 },
            },
            detectRetina: true,
          }}
          style={{
            position: "absolute",
            zIndex: -1,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        <Container className="mt-5" style={{ position: "relative", zIndex: 2, color: "white" }}>
          <Row>
            <h1 className="text-center">
              <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "white" }} />
            </h1>
            <h1 className="text-center text-white">Welcome to Expense Management System</h1>
            <Col md={{ span: 6, offset: 3 }}>
              <h2 className="text-white text-center mt-5">Registration</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mt-3">
                  <Form.Label className="text-white">Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={values.name}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label className="text-white">Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={values.email}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label className="text-white">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={values.password}
                    onChange={handleChange}
                  />
                </Form.Group>

                <div className="text-center mt-4">
                  <Link to="/forgotPassword" className="text-white">Forgot Password?</Link>

                  <Button type="submit" className="mt-3 btnStyle" disabled={loading}>
                    {loading ? "Registering..." : "Signup"}
                  </Button>

                  <p className="mt-3" style={{ color: "#9d9494" }}>
                    Already have an account? <Link to="/login" className="text-white">Login</Link>
                  </p>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
        <ToastContainer />
      </div>
    </>
  );
};

export default Register;