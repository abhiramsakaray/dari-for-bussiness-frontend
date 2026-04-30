import React, { useState } from 'react';
import styles from './RefundForm.module.css';
import refundsService from '../services/refundsService';

interface RefundAmount {
  fiat: number;
  token: number;
}

interface CustomerTransaction {
  id: string;
  type: 'payment' | 'subscription' | 'invoice';
  email: string;
  name: string;
  amount_fiat: string;
  amount_token: string;
  fiat_currency: string;
  token: string;
  chain: string;
  wallet_address: string;
  status: string;
  refundable_amount: string;
  already_refunded: string;
  created_at: string;
}

interface CustomerTransactionList {
  customer_email: string;
  customer_name: string;
  total_transaction_value: string;
  total_transactions: number;
  transactions: CustomerTransaction[];
}

type SearchType = 'email' | 'phone';
type FormStep = 'search' | 'transactions' | 'refund';

const formatPaymentType = (type: 'payment' | 'subscription' | 'invoice'): string => {
  const icons: Record<string, string> = {
    payment: '🏪',
    subscription: '🔄',
    invoice: '📄'
  };
  const labels: Record<string, string> = {
    payment: 'Payment',
    subscription: 'Subscription',
    invoice: 'Invoice'
  };
  return `${icons[type]} ${labels[type]}`;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    completed: '#10b981',
    pending: '#f59e0b',
    failed: '#ef4444',
    refunded: '#8b5cf6',
    active: '#2563eb',
    paused: '#6b7280'
  };
  return colors[status.toLowerCase()] || '#6b7280';
};

const RefundForm: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState<FormStep>('search');
  const [searchType, setSearchType] = useState<SearchType>('email');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState<CustomerTransactionList | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<CustomerTransaction | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundReasonType, setRefundReasonType] = useState<'customer_request' | 'duplicate' | 'fraud' | 'item_defective' | 'wrong_amount' | 'custom'>('customer_request');
  const [refreshBalance, setRefreshBalance] = useState(false);
  const [forceExternal, setForceExternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSearchCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter an email or phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await refundsService.getCustomerTransactions(
        searchType === 'email' ? searchQuery : undefined,
        searchType === 'phone' ? searchQuery : undefined
      );

      if (!data.transactions || data.transactions.length === 0) {
        setError('No transactions found for this customer');
        return;
      }

      setTransactions(data);
      setStep('transactions');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTransaction = (transaction: CustomerTransaction) => {
    if (parseFloat(transaction.refundable_amount) <= 0) {
      setError('This transaction cannot be refunded');
      return;
    }
    setSelectedTransaction(transaction);
    setRefundAmount(transaction.refundable_amount.toString());
    setStep('refund');
  };

  const handleBackToTransactions = () => {
    setSelectedTransaction(null);
    setRefundAmount('');
    setRefundReason('');
    setRefreshBalance(false);
    setForceExternal(false);
    setError('');
    setStep('transactions');
  };

  const handleCreateRefund = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTransaction) return;

    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      setError('Please enter a valid refund amount');
      return;
    }

    if (parseFloat(refundAmount) > parseFloat(selectedTransaction.refundable_amount)) {
      setError(`Refund amount cannot exceed ${selectedTransaction.refundable_amount}`);
      return;
    }

    if (refundReasonType === 'custom' && !refundReason.trim()) {
      setError('Please provide a refund reason for "Other" option');
      return;
    }

    const reasonLabel: Record<string, string> = {
      customer_request: 'Customer Requested',
      duplicate: 'Duplicate Transaction',
      fraud: 'Fraud / Unauthorized',
      item_defective: 'Item Defective or Damaged',
      wrong_amount: 'Wrong Amount Charged',
      custom: refundReason.trim()
    };

    setSubmitting(true);
    setError('');

    try {
      await refundsService.createRefund(selectedTransaction.id, {
        amount: parseFloat(refundAmount),
        refund_address: selectedTransaction.wallet_address || '',
        reason: reasonLabel[refundReasonType],
        queue_if_insufficient: refreshBalance,
        force: forceExternal
      });

      // Reset form and show success
      alert('Refund issued successfully!');
      setStep('search');
      setSearchQuery('');
      setTransactions(null);
      setSelectedTransaction(null);
      setRefundAmount('');
      setRefundReason('');
      setRefundReasonType('customer_request');
      setRefreshBalance(false);
      setForceExternal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create refund');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSearchStep = () => (
    <div className={styles.searchStep}>
      <h3>Search Customer</h3>
      <p className={styles.subtitle}>Find customer by email or phone number to view all transactions</p>

      <div className={styles.searchTypeToggle}>
        <button
          className={`${styles.toggleBtn} ${searchType === 'email' ? styles.active : ''}`}
          onClick={() => {
            setSearchType('email');
            setSearchQuery('');
            setError('');
          }}
        >
          📧 Email
        </button>
        <button
          className={`${styles.toggleBtn} ${searchType === 'phone' ? styles.active : ''}`}
          onClick={() => {
            setSearchType('phone');
            setSearchQuery('');
            setError('');
          }}
        >
          📱 Phone
        </button>
      </div>

      <form onSubmit={handleSearchCustomer}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="searchQuery">
            {searchType === 'email' ? 'Customer Email' : 'Customer Phone'}
          </label>
          <input
            id="searchQuery"
            type={searchType === 'email' ? 'email' : 'tel'}
            className={styles.input}
            placeholder={searchType === 'email' ? 'customer@example.com' : '+1 (555) 123-4567'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setError('');
            }}
            disabled={loading}
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderTransactionsStep = () => {
    if (!transactions) return null;

    return (
      <div className={styles.transactionsStep}>
        <button className={styles.backBtn} onClick={() => setStep('search')}>
          ← Back to Search
        </button>

        <h3>Customer Transactions</h3>

        <div className={styles.customerHeader}>
          <div>
            <h4 style={{ marginBottom: 0 }}>
              {transactions.customer_name}
            </h4>
            <p className={styles.customerName}>{transactions.customer_email}</p>
          </div>
          <div className={styles.customerStats}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Paid Transactions</div>
              <div className={styles.statValue}>{transactions.transactions.filter(t => t.status === 'PAID').length}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Total Value</div>
              <div className={styles.statValue}>${parseFloat(transactions.total_transaction_value).toFixed(2)}</div>
            </div>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.transactionsList}>
          {transactions.transactions.filter(t => t.status === 'PAID').length === 0 ? (
            <div className={styles.noTransactions}>No paid transactions found</div>
          ) : (
            transactions.transactions
              .filter((transaction) => transaction.status === 'PAID')
              .map((transaction) => (
              <div
                key={transaction.id}
                className={styles.transactionCard}
                onClick={() => handleSelectTransaction(transaction)}
              >
                <div className={styles.transactionHeader}>
                  <span className={styles.transactionType}>
                    {formatPaymentType(transaction.type)}
                  </span>
                  <span
                    className={styles.transactionStatus}
                    style={{ backgroundColor: getStatusColor(transaction.status) }}
                  >
                    {transaction.status}
                  </span>
                </div>

                <div className={styles.transactionDetails}>
                  <div className={styles.detail}>
                    <span className={styles.label}>Amount (Fiat)</span>
                    <span className={`${styles.value} ${styles.valueGreen}`}>
                      ${parseFloat(transaction.amount_fiat).toFixed(2)} {transaction.fiat_currency}
                    </span>
                  </div>

                  <div className={styles.detail}>
                    <span className={styles.label}>Amount (Crypto)</span>
                    <span className={styles.value}>
                      {parseFloat(transaction.amount_token).toFixed(6)} {transaction.token}
                    </span>
                  </div>

                  <div className={styles.detail}>
                    <span className={styles.label}>Chain</span>
                    <span className={styles.value}>{transaction.chain}</span>
                  </div>

                  <div className={styles.detail}>
                    <span className={styles.label}>Wallet</span>
                    <span className={`${styles.value} ${styles.valueMonospace}`}>
                      {transaction.wallet_address ? `${transaction.wallet_address.substring(0, 8)}...${transaction.wallet_address.slice(-6)}` : 'N/A'}
                    </span>
                  </div>

                  <div className={styles.detail}>
                    <span className={styles.label}>Refundable</span>
                    <span className={`${styles.value} ${styles.valueGreen}`}>
                      ${parseFloat(transaction.refundable_amount).toFixed(2)}
                    </span>
                  </div>

                  <div className={styles.detail}>
                    <span className={styles.label}>Already Refunded</span>
                    <span className={`${styles.value} ${styles.valueGray}`}>
                      ${parseFloat(transaction.already_refunded).toFixed(2)}
                    </span>
                  </div>

                  <div className={styles.detail}>
                    <span className={styles.label}>Date</span>
                    <span className={styles.value}>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className={styles.selectTransactionBtn}>
                  Click to select and process refund →
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderRefundStep = () => {
    if (!selectedTransaction) return null;

    return (
      <div className={styles.refundStep}>
        <button className={styles.backBtn} onClick={handleBackToTransactions}>
          ← Back to Transactions
        </button>

        <h3>Process Refund</h3>
        <p className={styles.subtitle}>Review transaction and enter refund details</p>

        <div className={styles.transactionSummary}>
          <div className={styles.summaryRow}>
            <span className={styles.label}>Transaction Type</span>
            <span className={styles.value}>{formatPaymentType(selectedTransaction.type)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.label}>Amount (Fiat)</span>
            <span className={`${styles.value} ${styles.valueGreen}`}>
              ${parseFloat(selectedTransaction.amount_fiat).toFixed(2)} {selectedTransaction.fiat_currency}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.label}>Amount (Crypto)</span>
            <span className={styles.value}>
              {parseFloat(selectedTransaction.amount_token).toFixed(6)} {selectedTransaction.token}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.label}>Chain</span>
            <span className={styles.value}>{selectedTransaction.chain}</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.label}>Status</span>
            <span
              className={styles.value}
              style={{ color: getStatusColor(selectedTransaction.status) }}
            >
              {selectedTransaction.status}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.label}>Refundable Amount</span>
            <span className={`${styles.value} ${styles.valueGreen}`}>
              ${parseFloat(selectedTransaction.refundable_amount).toFixed(2)} max
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.label}>Recipient Wallet</span>
            <span className={`${styles.value} ${styles.valueMonospace}`}>
              {selectedTransaction.wallet_address ? `${selectedTransaction.wallet_address.substring(0, 10)}...${selectedTransaction.wallet_address.slice(-8)}` : 'N/A'}
            </span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.label}>Created</span>
            <span className={styles.value}>
              {new Date(selectedTransaction.created_at).toLocaleDateString()} at{' '}
              {new Date(selectedTransaction.created_at).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleCreateRefund}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="refundAmount">Refund Amount (USD)</label>
            <input
              id="refundAmount"
              type="number"
              step="0.01"
              className={styles.input}
              placeholder="Refund amount"
              value={refundAmount}
              onChange={(e) => {
                setRefundAmount(e.target.value);
                setError('');
              }}
              max={parseFloat(selectedTransaction.refundable_amount)}
              disabled={submitting}
            />
            <small>
              Max: ${parseFloat(selectedTransaction.refundable_amount).toFixed(2)}
              {parseFloat(selectedTransaction.already_refunded) > 0 &&
                ` (Already refunded: $${parseFloat(selectedTransaction.already_refunded).toFixed(2)})`}
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="refundReasonType">Refund Reason</label>
            <select
              id="refundReasonType"
              className={styles.input}
              value={refundReasonType}
              onChange={(e) => {
                setRefundReasonType(e.target.value as any);
                if (e.target.value !== 'custom') {
                  setRefundReason('');
                }
                setError('');
              }}
              disabled={submitting}
              style={{ cursor: 'pointer' }}
            >
              <option value="customer_request">Customer Requested</option>
              <option value="duplicate">Duplicate Transaction</option>
              <option value="fraud">Fraud / Unauthorized</option>
              <option value="item_defective">Item Defective or Damaged</option>
              <option value="wrong_amount">Wrong Amount Charged</option>
              <option value="custom">Other (Please specify)</option>
            </select>
          </div>

          {refundReasonType === 'custom' && (
            <div className={styles.formGroup}>
              <label htmlFor="refundReason">Please describe the refund reason</label>
              <textarea
                id="refundReason"
                className={styles.textarea}
                placeholder="Explain why this refund is being issued..."
                value={refundReason}
                onChange={(e) => {
                  setRefundReason(e.target.value);
                  setError('');
                }}
                rows={4}
                disabled={submitting}
              />
            </div>
          )}

          <div className={styles.optionsSection}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={refreshBalance}
                onChange={(e) => setRefreshBalance(e.target.checked)}
                disabled={submitting}
              />
              <span>
                <strong>Queue if insufficient balance</strong>
                <small>Process refund when merchant balance is sufficient</small>
              </span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={forceExternal}
                onChange={(e) => setForceExternal(e.target.checked)}
                disabled={submitting}
              />
              <span>
                <strong>Force from external wallet</strong>
                <small>Send refund from external wallet instead of merchant balance</small>
              </span>
            </label>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleBackToTransactions}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={submitting}>
              {submitting ? 'Processing...' : 'Issue Refund'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className={styles.formContainer}>
      {step !== 'search' && onBack && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Issue Refund</h2>
          <button
            onClick={() => {
              setStep('search');
              setTransactions(null);
              setSelectedTransaction(null);
              setSearchQuery('');
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#0066cc',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'none',
              padding: '0',
              fontWeight: '500'
            }}
          >
            ← Back to Search
          </button>
        </div>
      )}
      {step === 'search' && renderSearchStep()}
      {step === 'transactions' && renderTransactionsStep()}
      {step === 'refund' && renderRefundStep()}
    </div>
  );
};

export default RefundForm;
