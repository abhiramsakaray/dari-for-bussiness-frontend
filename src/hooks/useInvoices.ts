import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoicesService } from '@/services/invoices.service';
import { CreateInvoiceInput, UpdateInvoiceInput, InvoiceStatus } from '@/types/api.types';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';

export const INVOICES_QUERY_KEY = 'invoices';

export function useInvoices(
  page = 1,
  pageSize = 20,
  status?: InvoiceStatus,
  customerEmail?: string
) {
  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, { page, pageSize, status, customerEmail }],
    queryFn: () =>
      invoicesService.listInvoices({
        page,
        page_size: pageSize,
        status,
        customer_email: customerEmail,
      }),
  });
}

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, invoiceId],
    queryFn: () => invoicesService.getInvoice(invoiceId),
    enabled: !!invoiceId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateInvoiceInput) => invoicesService.createInvoice(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      toast.success(`Invoice ${data.invoice_number} created`);
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to create invoice'));
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, input }: { invoiceId: string; input: UpdateInvoiceInput }) =>
      invoicesService.updateInvoice(invoiceId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY, data.id] });
      toast.success('Invoice updated');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to update invoice'));
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, message }: { invoiceId: string; message?: string }) =>
      invoicesService.sendInvoice(invoiceId, message),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY, data.id] });
      toast.success('Invoice sent successfully');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to send invoice'));
    },
  });
}

export function useSendReminder() {
  return useMutation({
    mutationFn: (invoiceId: string) => invoicesService.sendReminder(invoiceId),
    onSuccess: () => {
      toast.success('Reminder sent');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to send reminder'));
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => invoicesService.cancelInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      toast.success('Invoice cancelled');
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to cancel invoice'));
    },
  });
}

export function useDuplicateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => invoicesService.duplicateInvoice(invoiceId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      toast.success(`Invoice duplicated as ${data.invoice_number}`);
    },
    onError: (error: any) => {
      toast.error(extractErrorMessage(error, 'Failed to duplicate invoice'));
    },
  });
}
