import express from 'express';
import { addTransactionController, deleteTransactionController, getAllTransactionController, updateTransactionController, getUserIdByEmailController } from '../controllers/transactionController.js';

const router = express.Router();

router.route("/addTransaction").post(addTransactionController);

router.route("/getTransaction").get(getAllTransactionController);

router.route("/deleteTransaction/:id").delete(deleteTransactionController);

router.route("/getUserId").all( getUserIdByEmailController);

router.route('/updateTransaction/:id').put(updateTransactionController);

export default router;