'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const contactSectionSchema = z.object({
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  email: z.string().email('Email không hợp lệ'),
  mapUrl: z.string().optional(),
  workingHours: z.string().optional(),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

type ContactSectionFormValues = z.infer<typeof contactSectionSchema>;

export default function ContactSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [mapPreview, setMapPreview] = useState('');

  const form = useForm<ContactSectionFormValues>({
    defaultValues: {
      address: '',
      phone: '',
      email: '',
      mapUrl: '',
      workingHours: '',
      facebookUrl: '',
      twitterUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      linkedinUrl: '',
    },
  });

  useEffect(() => {
    const fetchContactSection = async () => {
      try {
        const response = await fetch('/api/admin/contact-sections');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            form.reset(data);
          }
        }
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchContactSection();
  }, [form]);

  const onSubmit = async (data: ContactSectionFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/contact-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Cập nhật thành công!');
      } else {
        toast.error('Lỗi khi cập nhật.');
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div>Đang tải...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cài đặt trang liên hệ</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workingHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giờ làm việc</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Thứ 2 - Chủ nhật: 8:00 - 20:00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mapUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    URL Bản đồ
                    <span className="text-xs text-gray-500 font-normal">(Mã nhúng iframe)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Dán mã nhúng iframe từ Google Maps vào đây"
                      className="min-h-[120px]"
                      onChange={(e) => {
                        field.onChange(e);
                        setMapPreview(e.target.value);
                      }}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 mt-1">
                    <p>Hướng dẫn:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Mở Google Maps và tìm địa chỉ của bạn</li>
                      <li>Nhấn vào nút "Chia sẻ" → "Nhúng bản đồ"</li>
                      <li>Sao chép mã HTML và dán vào đây</li>
                    </ol>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Map Preview */}
            {mapPreview && (
              <Card className="mt-4 border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <i className="fas fa-map-marked-alt text-blue-600"></i>
                    Xem trước bản đồ
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div
                      className="w-full h-64"
                      dangerouslySetInnerHTML={{ __html: mapPreview }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Đây là cách bản đồ sẽ hiển thị trên trang liên hệ công cộng.
                  </p>
                </CardContent>
              </Card>
            )}
            <FormField
              control={form.control}
              name="facebookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="twitterUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instagramUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="youtubeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Youtube URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
