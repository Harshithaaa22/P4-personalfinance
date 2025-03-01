import React, { useEffect, useState } from "react";
import { Button, Container, Form, Modal, Table, Alert } from "react-bootstrap";
import axios from "axios";
import moment from "moment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import "./home.css";

const TableData = () => {
  const [transactions, setTransactions] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currId, setCurrId] = useState(null);
  const [deletedTransaction, setDeletedTransaction] = useState(null);
  const [showUndo, setShowUndo] = useState(false);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const [newTransaction, setNewTransaction] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: moment().format("YYYY-MM-DD"),
    transactionType: "Expense",
  });

  // Fetch transactions from MongoDB
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail");

        if (!userEmail) {
          console.error("User email is missing. Please log in.");
          return;
        }

        const response = await axios.get(`http://localhost:4000/api/v1/getTransaction?email=${userEmail}`);
        setTransactions(response.data.transactions || []);
      } catch (error) {
        console.error("Error fetching transactions:", error.response?.data || error.message);
      }
    };
    fetchTransactions();
  }, []);

  // Open Edit Modal and Load Data
  const handleEditClick = (transactionId) => {
    console.log("Clicked Edit for:", transactionId);
    
    const transaction = transactions.find((item) => item._id === transactionId);
  
    if (transaction) {
      console.log("Transaction found:", transaction);
  
      setCurrId(transactionId);
      setEditingTransaction(transaction);
      setValues({
        title: transaction.title,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: moment(transaction.date).format("YYYY-MM-DD"),
        transactionType: transaction.transactionType,
      });
  
      setShowEdit(true);
    } else {
      console.error("Transaction not found for ID:", transactionId);
    }
  };
  

  // Update Transaction in MongoDB
  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const userEmail = localStorage.getItem("userEmail");
  
      if (!userEmail) {
        console.error("User email not found. Ensure the user is logged in.");
        return;
      }
  
      const userId = await getUserIdByEmail(userEmail);
  
      if (!userId) {
        console.error("Failed to fetch userId for email:", userEmail);
        return;
      }
  
      const response = await axios.put(
        `http://localhost:4000/api/v1/updateTransaction/${currId}?userId=${userId}`,
        values
      );
  
      // Update state with the modified transaction
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === currId ? { ...transaction, ...values } : transaction
        )
      );
  
      setShowEdit(false);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };
  

  // Delete Transaction from MongoDB
  // Function to get userId by email
const getUserIdByEmail = async (userEmail) => {
  try {
    const response = await axios.get(`http://localhost:4000/api/v1/getUserId?email=${userEmail}`);
    return response.data.userId; // Extract userId from the response
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
};

// Function to delete a transaction
const handleDeleteClick = async (transactionId) => {
  try {
    const userEmail = localStorage.getItem("userEmail"); // ✅ Get stored email

    if (!userEmail) {
      console.error("User email not found. Ensure the user is logged in.");
      return;
    }

    const userId = await getUserIdByEmail(userEmail); // ✅ Fetch userId dynamically

    if (!userId) {
      console.error("Failed to fetch userId for email:", userEmail);
      return;
    }

    const response = await axios.delete(
      `http://localhost:4000/api/v1/deleteTransaction/${transactionId}?userId=${userId}`
    );

    if (response.status === 200) {
      console.log("Transaction deleted successfully");

      // Update state after successful deletion
      setTransactions((prevTransactions) =>
        prevTransactions.filter((t) => t._id !== transactionId)
      );
    } else {
      console.error("Failed to delete transaction:", response.data);
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
  }
};

  
  const handleUndoDelete = async () => {
    if (!deletedTransaction) return;
    
    try {
      const response = await axios.post("http://localhost:4000/api/v1/addTransaction", deletedTransaction);
  
      // Restore the deleted transaction to the state
      setTransactions((prevTransactions) => [...prevTransactions, response.data.transaction]);
  
      setShowUndo(false);
      setDeletedTransaction(null);
    } catch (error) {
      console.error("Error restoring transaction:", error);
    }
  };
  
 

  // Add New Transaction to MongoDB
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const userEmail = localStorage.getItem("userEmail");
      const transactionData = { ...newTransaction, email: userEmail };

      const response = await axios.post("http://localhost:4000/api/v1/addTransaction", transactionData);

      setTransactions((prevTransactions) => [...prevTransactions, response.data.transaction]);

      setShowAdd(false);
      setNewTransaction({
        title: "",
        amount: "",
        description: "",
        category: "",
        date: moment().format("YYYY-MM-DD"),
        transactionType: "Expense",
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <>
      <Container>
        {showUndo && (
          <Alert variant="warning" onClose={() => setShowUndo(false)} dismissible>
            Transaction deleted! <Button variant="link" onClick={handleUndoDelete}>Undo</Button>
          </Alert>
        )}

        

        <Table responsive="md" className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {transactions && transactions.length > 0 ? (
              transactions.map((item) => (
                <tr key={item._id}>
                  <td>{moment(item.date).format("YYYY-MM-DD")}</td>
                  <td>{item.title}</td>
                  <td>{item.amount}</td>
                  <td>{item.transactionType}</td>
                  <td>{item.category}</td>
                  <td>
                    <EditNoteIcon sx={{ cursor: "pointer" }} onClick={() => handleEditClick(item._id)} />
                    <DeleteForeverIcon sx={{ color: "red", cursor: "pointer" }} onClick={() => handleDeleteClick(item._id)} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No transactions found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>

      {/* Add Transaction Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={newTransaction.title} onChange={(e) => setNewTransaction({ ...newTransaction, title: e.target.value })} />
            </Form.Group>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAdd(false)}>Close</Button>
              <Button variant="primary" type="submit">Add</Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Edit Transaction Modal */}
<Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Edit Transaction</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleEditSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control 
          type="text" 
          value={values.title} 
          onChange={(e) => setValues({ ...values, title: e.target.value })} 
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Amount</Form.Label>
        <Form.Control 
          type="number" 
          value={values.amount} 
          onChange={(e) => setValues({ ...values, amount: e.target.value })} 
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Control 
          type="text" 
          value={values.category} 
          onChange={(e) => setValues({ ...values, category: e.target.value })} 
        />
      </Form.Group>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowEdit(false)}>Close</Button>
        <Button variant="primary" type="submit">Save Changes</Button>
      </Modal.Footer>
    </Form>
  </Modal.Body>
</Modal>

    </>
  );
};

export default TableData;