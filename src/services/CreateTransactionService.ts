import { getCustomRepository, getRepository } from 'typeorm';

// import AppError from '../errors/AppError';
// import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    // Procuro se a Categoria ja existe
    let checkCategoryAlreadyExists = await categoryRepository.findOne({
      where: { title: category },
    });

    console.log(checkCategoryAlreadyExists);

    if (!checkCategoryAlreadyExists) {
      checkCategoryAlreadyExists = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(checkCategoryAlreadyExists);
    }

    // Criando a transação
    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category: checkCategoryAlreadyExists,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
