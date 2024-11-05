export type TransactionCallback = (connection: unknown) => Promise<void>;

export default interface IDatabase {
  startTransaction(callback: TransactionCallback): Promise<void>;
}
