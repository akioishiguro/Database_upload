import { getRepository, getCustomRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    // Essa função faz o papel de ler o arquivo por partes conforme for necessário sem precisar armazenar o arquivo inteiro na memória da aplicação.
    const readCSVStream = fs.createReadStream(filePath);

    // Também é uma stream de leitura, assim como o readCSVStream.
    const parseStream = csvParse({
      from_line: 2, // Descarta a primeira linha do arquivo que, nesse caso, não são dados e sim o título para cada coluna.

      // Os outros dois parâmetros servem pra remover espaços em branco desnecessários que ficam entre cada um dos valores.
      ltrim: true,
      rtrim: true,
    });

    // Passando as informações de readCSVStream para parseStream e salvando na variavel parseCSV
    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    // const balance = await transactionRepository.getBalance();

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      // Verifica se todos os dados estão presentes
      if (!title || !type || !value) return;

      /* if (type !== 'income' && type !== 'outcome') return;

      if (type === 'outcome' && value > balance.total) return; */

      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    // evento chamado end que avisa que a comunicação foi finalizada
    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // Procura as categorias que já existem
    const existCategory = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    // console.log(existCategory);

    // Pegamos só o title referente as categorias que achamos
    const existCategoryTitle = existCategory.map(
      (category: Category) => category.title,
    );

    // console.log(addCategoryTitles);

    const addCategoryTitles = categories
      .filter(category => !existCategoryTitle.includes(category)) // Filtra as categorias que ainda não existem no BD
      .filter((value, index, self) => self.indexOf(value) === index); // Remove caso alguma das categorias sejam duplicadas

    // console.log(addCategoryTitles);

    // Criando as categorias no BD
    const newCategories = categoryRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    // Salvando
    await categoryRepository.save(newCategories);

    // Salvando todas as categorias em um array
    const finalCategories = [...newCategories, ...existCategory];

    // Criando nossa transação
    const createdTransaction = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    // Salvando nossa transação
    await transactionRepository.save(createdTransaction);

    // Apagando nosso arq
    await fs.promises.unlink(filePath);

    return createdTransaction;
  }
}

export default ImportTransactionsService;
