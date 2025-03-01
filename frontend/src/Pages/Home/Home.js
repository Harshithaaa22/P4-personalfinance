import "./home.css";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Spinner from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
import TableData from "./TableData";
import Analytics from "./Analytics";

const Home = () => {
  const navigate = useNavigate();
  const [cUser, setcUser] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  // Fetch user details from backend
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User not logged in!", toastOptions);
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:4000/api/auth/getUser", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setcUser(data.user);
        } else {
          toast.error("Failed to fetch user data", toastOptions);
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Something went wrong!", toastOptions);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch transactions when cUser is available
  useEffect(() => {
    if (!cUser || !cUser._id) return;

    const fetchAllTransactions = async () => {
      if (!cUser || !cUser._id) return; // Prevent fetching without a valid user
    
      setLoading(true);
    
      try {
        const response = await fetch("http://localhost:4000/api/v1/getTransaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: cUser._id,
            type,
            frequency,
            startDate,
            endDate,
          }),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        if (data.success) {
          setTransactions(data.transactions);
        } else {
          toast.error("Failed to fetch transactions.", toastOptions);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    
      setLoading(false);
    };
    

    fetchAllTransactions();
  }, [cUser, refresh, frequency, type, startDate, endDate]);

  // Modal open/close handlers
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Form state
  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleStartChange = (date) => {
    setStartDate(date);
  };

  const handleEndChange = (date) => {
    setEndDate(date);
  };

  const handleChangeFrequency = (e) => {
    setFrequency(e.target.value);
  };

  const handleSetType = (e) => {
    setType(e.target.value);
  };

  // Handle transaction submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, amount, description, category, date, transactionType } = values;

    if (!title || !amount || !description || !category || !date || !transactionType) {
      toast.error("Please enter all the fields", toastOptions);
      return;
    }

    if (!cUser || !cUser._id) {
      toast.error("User not found. Please log in again.", toastOptions);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/v1/addTransaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount,
          description,
          category,
          date,
          transactionType,
          userId: cUser._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Transaction added successfully!", toastOptions);
        setRefresh(!refresh);
      } else {
        toast.error(data.message || "Failed to add transaction.", toastOptions);
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Something went wrong. Please try again.", toastOptions);
    }

    setLoading(false);
    handleClose();
  };

  const handleReset = () => {
    setType("all");
    setStartDate(null);
    setEndDate(null);
    setFrequency("7");
    setRefresh(!refresh);
  };

  const handleTableClick = () => {
    setView("table");
  };

  const handleChartClick = () => {
    setView("chart");
  };


  return (
    <>
      <Header />

      {loading ? (
        <>
          <Spinner />
        </>
      ) : (
        <>
          <Container 
            style={{ position: "relative", zIndex: "2 !important", backgroundColor:'#2D336B'  }}
            className="mt-3 full-screen-container"
          >
            <div className="filterRow">
              <div className="text-white">
                <Form.Group className="mb-3" controlId="formSelectFrequency">
                  <Form.Label>Select Frequency</Form.Label>
                  <Form.Select
                    name="frequency"
                    value={frequency}
                    onChange={handleChangeFrequency}
                  >
                    <option value="7">Last Week</option>
                    <option value="30">Last Month</option>
                    <option value="365">Last Year</option>
                    <option value="custom">Custom</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="text-white type">
                <Form.Group className="mb-3" controlId="formSelectFrequency">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={type}
                    onChange={handleSetType}
                  >
                    <option value="all">All</option>
                    <option value="expense">Expense</option>
                    <option value="credit">Income</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="text-white iconBtnBox">
                <FormatListBulletedIcon
                  sx={{ cursor: "pointer" }}
                  onClick={handleTableClick}
                  className={`${
                    view === "table" ? "iconActive" : "iconDeactive"
                  }`}
                />
                <BarChartIcon
                  sx={{ cursor: "pointer" }}
                  onClick={handleChartClick}
                  className={`${
                    view === "chart" ? "iconActive" : "iconDeactive"
                  }`}
                />
              </div>
              {/* Display selected filter options */}


              <div>
                <Button onClick={handleShow} className="addNew">
                  Add New
                </Button>
                <Button onClick={handleShow} className="mobileBtn">
                  +
                </Button>
                <Modal show={show} onHide={handleClose} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Add Transaction Details</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          name="title"
                          type="text"
                          placeholder="Enter Transaction Name"
                          value={values.name}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formAmount">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control
                          name="amount"
                          type="number"
                          placeholder="Enter your Amount"
                          value={values.amount}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formSelect">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          name="category"
                          value={values.category}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="Groceries">Groceries</option>
                          <option value="Rent">Rent</option>
                          <option value="Salary">Salary</option>
                          <option value="Tip">Tip</option>
                          <option value="Food">Food</option>
                          <option value="Medical">Medical</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          type="text"
                          name="description"
                          placeholder="Enter Description"
                          value={values.description}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formSelect1">
                        <Form.Label>Transaction Type</Form.Label>
                        <Form.Select
                          name="transactionType"
                          value={values.transactionType}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="credit">Credit</option>
                          <option value="expense">Expense</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formDate">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={values.date}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      {/* Add more form inputs as needed */}
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                      Submit
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>
            <br style={{ color: "white" }}></br>
            {transactions.length > 0 && frequency !== "all" && type !== "all" && (
  <div style={{ textAlign: "center", color: "white", margin: "20px 0" }}>
    <h4 style={{ fontWeight: "bold", marginBottom: "15px" }}>Filtered Transactions</h4>

    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
      backgroundColor: "#ddd",
      padding: "20px",
      borderRadius: "10px",
      maxWidth: "500px",
      margin: "auto",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"
    }}>
      {transactions.map((txn) => (
        <div key={txn._id} style={{
          backgroundColor: "#2D336B",
          padding: "10px 15px",
          borderRadius: "8px",
          width: "100%",
          textAlign: "center",
          color: "#fff",
          fontSize: "16px",
          fontWeight: "500"
        }}>
          {txn.title} - ₹{txn.amount} ({txn.transactionType})
        </div>
      ))}
    </div>
  </div>
)}




            {frequency === "custom" ? (
              <>
                <div className="date">
                  <div className="form-group">
                    <label htmlFor="startDate" className="text-white">
                      Start Date:
                    </label>
                    <div>
                      <DatePicker
                        selected={startDate}
                        onChange={handleStartChange}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate" className="text-white">
                      End Date:
                    </label>
                    <div>
                      <DatePicker
                        selected={endDate}
                        onChange={handleEndChange}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}

            <div className="containerBtn">
              <Button variant="primary" onClick={handleReset}>
                Reset Filter
              </Button>
            </div>
            {view === "table" ? (
              <>
                <TableData data={transactions} user={cUser} />
              </>
            ) : (
              <>
                <Analytics transactions={transactions} user={cUser} />
              </>
            )}
            <ToastContainer />
            

          </Container>
        </>
      )}
    </>
  );
};

export default Home;