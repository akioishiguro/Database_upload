import { Router } from 'express';
import multer from 'multer';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  // Utilizando o metodo criado por nós em '../repositories'
  const getTransaction = getCustomRepository(TransactionsRepository);

  // Lista todas as minhas Transações
  const transactions = await getTransaction.find();

  // Faz um Balanço total
  const balance = await getTransaction.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  // Crio uma nova instancia para Criar uma Transação
  const createTransactionService = new CreateTransactionService();

  // Executa minha instancia
  const transaction = await createTransactionService.execute({
    title,
    type,
    value,
    category,
  });

  // console.log(transaction);

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204).send();
});

// Responsavel por receber um CSV
transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const updateFile = new ImportTransactionsService();

    const file = await updateFile.execute(request.file.path);

    return response.json(file);
  },
);

export default transactionsRouter;
