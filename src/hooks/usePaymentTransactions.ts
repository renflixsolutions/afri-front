import { useEffect, useState } from 'react';
import { fetchPaymentTransactions, PaymentTransaction, PaymentSummary, PaymentTransactionsPagination } from '../services/api/PaymentService';

interface UsePaymentTransactionsResult {
  transactions: PaymentTransaction[];
  summary: PaymentSummary | null;
  pagination: PaymentTransactionsPagination | null;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
}

export function usePaymentTransactions(initialPage: number = 1): UsePaymentTransactionsResult {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [pagination, setPagination] = useState<PaymentTransactionsPagination | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPaymentTransactions(page)
      .then((res) => {
        setTransactions(res.data.transactions.data);
        setPagination(res.data.transactions);
        setSummary(res.data.summary);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to fetch transactions');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page]);

  return { transactions, summary, pagination, loading, error, page, setPage };
}

