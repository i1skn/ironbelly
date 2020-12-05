import moment from 'moment'
export const mockRustTransaction = (
  id: number,
  type: string,
  amountCredited: string,
  amountDebited: string,
  fee: string,
  txSlateId: string,
) => ({
  amount_credited: amountCredited,
  amount_debited: amountDebited,
  confirmation_ts: moment().format(),
  confirmed: true,
  creation_ts: moment().format(),
  fee,
  id,
  kernel_excess: null,
  kernel_lookup_min_height: null,
  num_inputs: 0,
  num_outputs: 1,
  parent_key_id: '0200000000000000000000000000000000',
  payment_proof: null,
  reverted_after: null,
  stored_tx: null,
  ttl_cutoff_height: null,
  tx_slate_id: txSlateId,
  tx_type: type, // 'TxReceived',
})

export const mockedRustTransactions: { [key: string]: any } = {
  slateId1: mockRustTransaction(
    0,
    'TxReceived',
    '123438749',
    '0',
    '0',
    'slateId1',
  ),
  '6ef39b6d-ce3c-4a22-a536-cea395dc4b62': mockRustTransaction(
    1,
    'TxSent',
    '0',
    '123438749',
    '8000000',
    '6ef39b6d-ce3c-4a22-a536-cea395dc4b62',
  ),
}
