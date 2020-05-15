import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const getTransaction = getCustomRepository(TransactionsRepository);

    const findTransaction = await getTransaction.findOne(id);

    if (!findTransaction) {
      throw new AppError('Transaction dont Find');
    }

    await getTransaction.remove(findTransaction);
  }
}

export default DeleteTransactionService;
