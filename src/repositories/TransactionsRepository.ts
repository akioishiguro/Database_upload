import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

// Utiliza a tabela Transaction como referencia
@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const getTransaction = await this.find();

    // array.reduce(callback( acumulador, valorAtual[, index[, array]] )[, valorInicial])

    const { income, outcome } = getTransaction.reduce(
      (accumulator: Balance, currentValue: Transaction) => {
        if (currentValue.type === 'income') {
          accumulator.income += Number(currentValue.value);
        } else accumulator.outcome += Number(currentValue.value);

        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
