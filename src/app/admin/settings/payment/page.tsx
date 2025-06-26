'use client';

import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import ImageUpload from '@/components/admin/ImageUpload';
import { Switch } from "@/components/ui/switch";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  // Bank transfer fields
  bankName: z.string().min(1, 'Vui lòng nhập tên ngân hàng'),
  accountNumber: z.string().min(1, 'Vui lòng nhập số tài khoản'),
  accountHolder: z.string().min(1, 'Vui lòng nhập tên chủ tài khoản'),
  branch: z.string().optional(),
  notes: z.string().optional(),
  qrImage: z.array(z.string()).optional(),
  // MoMo fields
  momoEnabled: z.boolean().default(false),
  momoPhoneNumber: z.string().optional(),
  momoAccountName: z.string().optional(),
  momoQrImage: z.array(z.string()).optional(),
});

type PaymentSettingsForm = z.infer<typeof formSchema>;

export default function PaymentSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PaymentSettingsForm>({
    defaultValues: {
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      branch: '',
      notes: '',
      qrImage: [],
      // MoMo default values
      momoEnabled: false,
      momoPhoneNumber: '',
      momoAccountName: '',
      momoQrImage: []
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/settings/payment');
        const data = await response.json();
        
        if (data.success && data.data) {
          form.reset(data.data);
        } else {
          form.reset({
            bankName: '',
            accountNumber: '',
            accountHolder: '',
            branch: '',
            notes: '',
            qrImage: [],
            momoEnabled: false,
            momoPhoneNumber: '',
            momoAccountName: '',
            momoQrImage: []
          });
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
        toast.error('Lỗi khi tải thông tin thanh toán');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [form]);

  async function onSubmit(values: PaymentSettingsForm) {
    try {
      // Validate required fields
      if (!values.bankName.trim() || !values.accountNumber.trim() || !values.accountHolder.trim()) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      setIsLoading(true);

      // Format data
      const formattedValues = {
        ...values,
        bankName: values.bankName.trim(),
        accountNumber: values.accountNumber.trim().replace(/\s+/g, ''),
        accountHolder: values.accountHolder.trim().toUpperCase(),
        branch: values.branch?.trim() || '',
        notes: values.notes?.trim() || '',
        qrImage: values.qrImage || [],
        momoPhoneNumber: values.momoPhoneNumber?.trim() || '',
        momoAccountName: values.momoAccountName?.trim() || '',
        momoQrImage: values.momoQrImage || []
      };

      const response = await fetch('/api/admin/settings/payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedValues),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Đã cập nhật thông tin thanh toán thành công');
        form.reset(data.data);
      } else {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating payment settings:', error);
      toast.error('Lỗi khi cập nhật thông tin thanh toán');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt thanh toán</CardTitle>
          <CardDescription>
            Thiết lập thông tin tài khoản ngân hàng để khách hàng có thể chuyển khoản
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên ngân hàng</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Vietcombank, BIDV, ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tài khoản</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số tài khoản" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountHolder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên chủ tài khoản</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên chủ tài khoản" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chi nhánh</FormLabel>
                    <FormControl>
                      <Input placeholder="Chi nhánh ngân hàng (nếu có)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qrImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã QR chuyển khoản</FormLabel>
                    <FormControl>
                      <div className="border rounded-lg p-4">
                        <ImageUpload
                          images={field.value || []}
                          onImagesChange={(images) => field.onChange(images)}
                          maxImages={1}
                          folder="payment-qr"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ghi chú thêm về thanh toán (nếu có)" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* MoMo Settings */}
              <div className="space-y-6 pt-6 border-t">
                <h3 className="font-semibold">Cài đặt thanh toán MoMo</h3>
                
                <FormField
                  control={form.control}
                  name="momoEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Cho phép thanh toán MoMo</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Bật/tắt tính năng thanh toán qua MoMo
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("momoEnabled") && (
                  <>
                    <FormField
                      control={form.control}
                      name="momoPhoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại MoMo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập số điện thoại đăng ký MoMo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="momoAccountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tên tài khoản MoMo</FormLabel>
                          <FormControl>
                            <Input placeholder="Tên chủ tài khoản MoMo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="momoQrImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã QR MoMo</FormLabel>
                          <FormControl>
                            <div className="border rounded-lg p-4">
                              <ImageUpload
                                images={field.value || []}
                                onImagesChange={(images) => field.onChange(images)}
                                maxImages={1}
                                folder="momo-qr"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
