import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../utils/axios';
import { closePosition } from '../services/transaction';
import { useWalletStore } from '../stores/useWalletStore';
import { notify } from '../components/layout/notifier/Notifier';

export const useClosePosition = () => {
  const { walletId } = useWalletStore();

  return useMutation({
    mutationFn: async () => {
      if (!walletId) {
        console.error('closePositionEvent: walletId is undefined');
        return;
      }
      const response = await axiosInstance.get('/api/get-repay-data', {
        params: {
          wallet_id: walletId,
        },
      });
      const transactionResult = await closePosition(response.data);
      console.log('TransactionResult', transactionResult);
      await axiosInstance.get('/api/close-position', {
        params: {
          position_id: response.data.position_id,
          transaction_hash: transactionResult.transaction_hash,
        },
      });
    },
    onError: (error) => {
      console.error('Error during closePositionEvent', error);
      notify(`Error during closePositionEvent: ${error.message}`, 'error');
    },
  });
};

export const useCheckPosition = () => {
  const { walletId } = useWalletStore();

  return useQuery({
    queryKey: ['hasOpenPosition', walletId],
    queryFn: async () => {
      if (!walletId) return { has_opened_position: false };

      const { data } = await axiosInstance.get('/api/has-user-opened-position', {
        params: { wallet_id: walletId },
      });
      return data;
    },
    enabled: !!walletId,
  });
};
