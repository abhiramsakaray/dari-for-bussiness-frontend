import { apiClient } from '@/lib/api-client';
import { generateIdempotencyKey } from '@/lib/utils';
import {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  PaginatedResponse,
  InvoiceStatus,
  InvoiceLineItem,
} from '@/types/api.types';

export class InvoicesService {
  private basePath = '/invoices';

  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    return apiClient.post<Invoice>(this.basePath, input, {
      idempotencyKey: generateIdempotencyKey(),
    });
  }

  async listInvoices(params?: {
    page?: number;
    page_size?: number;
    status?: InvoiceStatus;
    customer_email?: string;
  }): Promise<PaginatedResponse<Invoice>> {
    const data = await apiClient.get<any>(this.basePath, { params });
    // Backend returns { invoices, total, page, page_size } -- map to { items, ... }
    return {
      items: data.invoices || [],
      total: data.total || 0,
      page: data.page || 1,
      page_size: data.page_size || 20,
      pages: Math.ceil((data.total || 0) / (data.page_size || 20)),
    };
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`${this.basePath}/${invoiceId}`);
  }

  async updateInvoice(invoiceId: string, input: UpdateInvoiceInput): Promise<Invoice> {
    return apiClient.patch<Invoice>(`${this.basePath}/${invoiceId}`, input);
  }

  async sendInvoice(invoiceId: string, message?: string): Promise<Invoice> {
    return apiClient.post<Invoice>(`${this.basePath}/${invoiceId}/send`, { message });
  }

  async sendReminder(invoiceId: string): Promise<void> {
    return apiClient.post<void>(`${this.basePath}/${invoiceId}/remind`);
  }

  async cancelInvoice(invoiceId: string): Promise<Invoice> {
    return apiClient.post<Invoice>(`${this.basePath}/${invoiceId}/cancel`);
  }

  async duplicateInvoice(invoiceId: string): Promise<Invoice> {
    return apiClient.post<Invoice>(`${this.basePath}/${invoiceId}/duplicate`);
  }

  calculateSubtotal(lineItems: InvoiceLineItem[]): number {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  }

  calculateTotal(lineItems: InvoiceLineItem[], tax = 0, discount = 0): number {
    const subtotal = this.calculateSubtotal(lineItems);
    return subtotal + tax - discount;
  }
}

export const invoicesService = new InvoicesService();
