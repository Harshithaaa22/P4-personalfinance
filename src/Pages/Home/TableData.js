import React, { useEffect, useState } from "react";
import { Button, Container, Form, Modal, Table, Alert } from "react-bootstrap";
import moment from "moment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import "./home.css";

const TableData = (props) => {
  const [show, setShow] = useState(false);
  const [transactions, setTransactions] = useState([]);
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

  // Fetch data from local storage on mount
  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(storedTransactions);
  }, [props.data]); 

  // Show modal and load transaction data
  const handleEditClick = (itemKey) => {
    const editTran = transactions.find((item) => item._id === itemKey);
    if (editTran) {
      setCurrId(itemKey);
      setEditingTransaction(editTran);
      setValues({
        title: editTran.title,
        amount: editTran.amount,
        description: editTran.description,
        category: editTran.category,
        date: moment(editTran.date).format("YYYY-MM-DD"),
        transactionType: editTran.transactionType,
      });
      setShow(true);
    }
  };

  // Update transaction and save to local storage
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedTransactions = transactions.map((transaction) =>
      transaction._id === currId ? { ...transaction, ...values } : transaction
    );

    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
    setTransactions(updatedTransactions);
    setShow(false);
  };

  // Delete transaction and update local storage with undo option
  // Delete a single transaction and update local storage
const handleDeleteClick = (itemKey) => {
  const transactionToDelete = transactions.find((transaction) => transaction._id === itemKey);
  if (!transactionToDelete) return;

  setDeletedTransaction(transactionToDelete); // Store deleted transaction
  setShowUndo(true);

  const updatedTransactions = transactions.filter((transaction) => transaction._id !== itemKey);

  setTransactions(updatedTransactions);
  localStorage.setItem("transactions", JSON.stringify(updatedTransactions));

  // Auto-hide undo after 5 seconds
  setTimeout(() => {
    setShowUndo(false);
    setDeletedTransaction(null);
  }, 5000);
};

// Restore only the last deleted transaction
const handleUndoDelete = () => {
  if (deletedTransaction) {
    setTransactions((prevTransactions) => {
      const updatedTransactions = [...prevTransactions, deletedTransaction];
      localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
      return updatedTransactions;
    });

    setShowUndo(false);
    setDeletedTransaction(null);
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
            {transactions.map((item) => (
              <tr key={item._id}>
                <td>{moment(item.date).format("YYYY-MM-DD")}</td>
                <td>{item.title}</td>
                <td>{item.amount}</td>
                <td>{item.transactionType}</td>
                <td>{item.category}</td>
                <td>
                  <div className="icons-handle">
                    <EditNoteIcon
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleEditClick(item._id)}
                    />
                    <DeleteForeverIcon
                      sx={{ color: "red", cursor: "pointer" }}
                      onClick={() => handleDeleteClick(item._id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      {/* Edit Modal */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                name="title"
                type="text"
                value={values.title}
                onChange={(e) => setValues({ ...values, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                name="amount"
                type="number"
                value={values.amount}
                onChange={(e) => setValues({ ...values, amount: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={values.category}
                onChange={(e) => setValues({ ...values, category: e.target.value })}
              >
                <option value="">Select a category</option>
                <option value="Groceries">Groceries</option>
                <option value="Rent">Rent</option>
                <option value="Salary">Salary</option>
                <option value="Food">Food</option>
                <option value="Medical">Medical</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Transportation">Transportation</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={values.description}
                onChange={(e) => setValues({ ...values, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Transaction Type</Form.Label>
              <Form.Select
                name="transactionType"
                value={values.transactionType}
                onChange={(e) => setValues({ ...values, transactionType: e.target.value })}
              >
                <option value="Credit">Credit</option>
                <option value="Expense">Expense</option>
              </Form.Select>
            </Form.Group>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
              <Button variant="primary" type="submit">Submit</Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TableData;