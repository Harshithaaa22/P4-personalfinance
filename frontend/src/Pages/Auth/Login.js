//import backgroundImage from "../../assets/finance.jpg";
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ email: "", password: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

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
    const { email, password } = values;
    if (!email || !password) {
      toast.error("Please fill in all fields", toastOptions);
      return;
    }
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        toast.error(data?.message || "Invalid email or password!", toastOptions);
        setLoading(false);
        return;
      }
  
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // ✅ Store full user object
      localStorage.setItem("userEmail", data.user.email); // ✅ Store only email separately
  
      setIsAuthenticated(true);
      toast.success("Login successful!", toastOptions);
      navigate("/");
    } catch (error) {
      toast.error("Something went wrong!", toastOptions);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    toast.success("Logged out successfully!", toastOptions);
    navigate("/login");
  };

  return (
    <div style={
      { 
       // backgroundImage: url(${backgroundImage}), 
        backgroundSize: "cover", backgroundPosition: "center", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Container className="p-4" style={{ maxWidth: "400px", backgroundColor: "rgba(0, 0, 0, 0.5)", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(255,255,255,0.2)" }}>
        <Row>
          <Col>
            <h1 className="text-center">
              <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "white" }} />
            </h1>
            <h2 className="text-white text-center">{isAuthenticated ? "Welcome!" : "Login"}</h2>
            {!isAuthenticated ? (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mt-3">
                  <Form.Label className="text-white">Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email" name="email" onChange={handleChange} value={values.email} />
                </Form.Group>
                <Form.Group className="mt-3">
                  <Form.Label className="text-white">Password</Form.Label>
                  <Form.Control type="password" name="password" placeholder="Password" onChange={handleChange} value={values.password} />
                </Form.Group>
                <div className="mt-4 text-center">
                  <Link to="/forgotPassword" className="text-white">Forgot Password?</Link>
                  <Button type="submit" className="mt-3 w-100" disabled={loading}>
                    {loading ? "Signing in…" : "Login"}
                  </Button>
                  <p className="mt-3 text-white">
                    Don't Have an Account? <Link to="/register" className="text-white">Register</Link>
                  </p>
                </div>
              </Form>
            ) : (
              <div className="text-center">
                <Button className="mt-3 w-100" onClick={handleLogout}>Logout</Button>
              </div>
            )}
          </Col>
        </Row>
        <ToastContainer />
      </Container>
    </div>
  );
};

export default Login;