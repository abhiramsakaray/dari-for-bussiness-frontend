import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateInvoice } from '../../../hooks/useInvoices';
import { invoicesService } from '../../../services/invoices.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { DashboardLayout } from '../DashboardLayout';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';

// Hash-based navigation helper
const navigateTo = (path: string) => {
  window.location.hash = path;
};

const AVAILABLE_TOKENS = ['USDC', 'USDT', 'XLM', 'ETH', 'MATIC'];
const AVAILABLE_CHAINS = ['stellar', 'polygon', 'ethereum', 'base', 'tron'];

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().min(0, 'Price must be non-negative'),
});

const createInvoiceSchema = z.object({
  customer_email: z.string().email('Invalid email'),
  customer_name: z.string().optional(),
  customer_address: z.string().optional(),
  description: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1, 'Add at least one line item'),
  tax: z.number().min(0),
  discount: z.number().min(0),
  due_date: z.string().min(1, 'Due date required'),
  accepted_tokens: z.array(z.string()).min(1, 'Select at least one token'),
  accepted_chains: z.array(z.string()).min(1, 'Select at least one chain'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  send_immediately: z.boolean(),
});

type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;

export function CreateInvoiceForm() {
  const createMutation = useCreateInvoice();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateInvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      line_items: [{ description: '', quantity: 1, unit_price: 0 }],
      tax: 0,
      discount: 0,
      accepted_tokens: ['USDC'],
      accepted_chains: ['polygon'],
      send_immediately: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'line_items',
  });

  const lineItems = watch('line_items');
  const tax = watch('tax') || 0;
  const discount = watch('discount') || 0;
  const acceptedTokens = watch('accepted_tokens');
  const acceptedChains = watch('accepted_chains');

  const subtotal = invoicesService.calculateSubtotal(lineItems);
  const total = invoicesService.calculateTotal(lineItems, tax, discount);

  const toggleArrayValue = (
    field: 'accepted_tokens' | 'accepted_chains',
    value: string,
    currentValues: string[]
  ) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setValue(field, newValues, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateInvoiceFormData) => {
    const input: any = {
      customer_email: data.customer_email,
      line_items: data.line_items,
      tax: data.tax,
      discount: data.discount,
      due_date: data.due_date,
      accepted_tokens: data.accepted_tokens,
      accepted_chains: data.accepted_chains,
      send_immediately: data.send_immediately,
    };

    // Only include optional fields if they have non-empty values
    if (data.description?.trim()) input.description = data.description.trim();
    if (data.customer_name?.trim()) input.customer_name = data.customer_name.trim();
    if (data.customer_address?.trim()) input.customer_address = data.customer_address.trim();
    if (data.notes?.trim()) input.notes = data.notes.trim();
    if (data.terms?.trim()) input.terms = data.terms.trim();

    console.log('Submitting invoice:', input); // Debug log
    await createMutation.mutateAsync(input);
    navigateTo('/invoices');
  };

  // Set default due date to 30 days from now
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 30);

  return (
    <DashboardLayout activePage="invoices">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigateTo('/invoices')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
            <p className="text-muted-foreground">Bill your customers with crypto payments</p>
          </div>
        </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Who is this invoice for?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_email">Customer Email *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  {...register('customer_email')}
                  placeholder="customer@example.com"
                />
                {errors.customer_email && (
                  <p className="text-sm text-red-500">{errors.customer_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  {...register('customer_name')}
                  placeholder="John Smith"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_address">Customer Address</Label>
              <Textarea
                id="customer_address"
                {...register('customer_address')}
                placeholder="123 Main St, City, State 12345"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Add items or services to invoice</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-5">
                    <Input
                      {...register(`line_items.${index}.description`)}
                      placeholder="Description"
                    />
                    {errors.line_items?.[index]?.description && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.line_items[index]?.description?.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      {...register(`line_items.${index}.quantity`, { valueAsNumber: true })}
                      placeholder="Qty"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`line_items.${index}.unit_price`, { valueAsNumber: true })}
                      placeholder="Unit Price"
                    />
                  </div>
                  <div className="col-span-1 text-right font-medium py-2">
                    ${((lineItems[index]?.quantity || 0) * (lineItems[index]?.unit_price || 0)).toFixed(2)}
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {errors.line_items && !Array.isArray(errors.line_items) && (
              <p className="text-sm text-red-500">{errors.line_items.message}</p>
            )}

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 max-w-md ml-auto">
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('tax', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('discount', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="text-right space-y-1 pt-2">
                <p className="text-sm text-muted-foreground">
                  Subtotal: {formatCurrency(subtotal, 'USD')}
                </p>
                {tax > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Tax: +{formatCurrency(tax, 'USD')}
                  </p>
                )}
                {discount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Discount: -{formatCurrency(discount, 'USD')}
                  </p>
                )}
                <p className="text-2xl font-bold">{formatCurrency(total, 'USD')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Options */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Options</CardTitle>
            <CardDescription>Configure accepted payment methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                {...register('due_date')}
                defaultValue={defaultDueDate.toISOString().split('T')[0]}
              />
              {errors.due_date && (
                <p className="text-sm text-red-500">{errors.due_date.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Accepted Tokens *</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TOKENS.map((token) => (
                  <div
                    key={token}
                    className={`px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                      acceptedTokens.includes(token)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleArrayValue('accepted_tokens', token, acceptedTokens)}
                  >
                    <span className="font-medium">{token}</span>
                  </div>
                ))}
              </div>
              {errors.accepted_tokens && (
                <p className="text-sm text-red-500">{errors.accepted_tokens.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Accepted Chains *</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CHAINS.map((chain) => (
                  <div
                    key={chain}
                    className={`px-4 py-2 rounded-lg border cursor-pointer transition-colors capitalize ${
                      acceptedChains.includes(chain)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleArrayValue('accepted_chains', chain, acceptedChains)}
                  >
                    <span className="font-medium">{chain}</span>
                  </div>
                ))}
              </div>
              {errors.accepted_chains && (
                <p className="text-sm text-red-500">{errors.accepted_chains.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes & Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Additional notes for customer"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Payment Terms</Label>
                <Textarea
                  id="terms"
                  {...register('terms')}
                  placeholder="Net 30, etc."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="send_immediately"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="send_immediately"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="send_immediately">Send invoice immediately after creation</Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigateTo('/invoices')}>
            Cancel
          </Button>
        </div>
      </form>
      </div>
    </DashboardLayout>
  );
}

export default CreateInvoiceForm;
