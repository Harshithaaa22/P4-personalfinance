//import backgroundImage from "../../assets/finance.jpg";
import { useEffect, useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"; // Import axios for API requests

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/"); // Redirect if already logged in
    }
  }, [navigate]);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = values;

    if (!name || !email || !password) {
      toast.error("All fields are required!", toastOptions);
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:4000/api/auth/register", {
        name,
        email,
        password,
      });

      localStorage.setItem("user", JSON.stringify(data)); // Store token
      toast.success("Registration successful!", toastOptions);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed!", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="register-container"
        style={{
         // backgroundImage: url(`${backgroundImage}`),
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container className="form-container">
          <h2 className="text-white text-center">Sign Up</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label className="text-white">Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Full name"
                value={values.name}
                onChange={handleChange}
                className="input-field"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="text-white">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={values.email}
                onChange={handleChange}
                className="input-field"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label className="text-white">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                value={values.password}
                onChange={handleChange}
                className="input-field"
              />
            </Form.Group>

            <Button type="submit" className="mt-3 btn-style" disabled={loading}>
              {loading ? "Registering..." : "Signup"}
            </Button>

            <p className="mt-2 text-center" style={{ color: "#ccc", fontSize: "14px" }}>
              Already have an account? <Link to="/login" className="text-white">Login</Link>
            </p>
          </Form>
        </Container>

        <ToastContainer />
      </div>
    </>
  );
};

export default Register;