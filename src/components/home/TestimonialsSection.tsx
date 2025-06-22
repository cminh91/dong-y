import { FC } from 'react';
import Image from 'next/image';
import { SystemSetting } from '@/types/api';

interface TestimonialProps {
  name: string;
  position: string;
  company: string;
  avatar: string;
  testimonial: string;
  rating: number;
}

const TestimonialCard: FC<TestimonialProps> = ({ name, position, company, avatar, testimonial, rating }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center mb-4">
        <Image src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover mr-4" width={48} height={48} />
        <div>
          <h4 className="font-bold">{name}</h4>
          <p className="text-gray-600 text-sm">{position} - {company}</p>
        </div>
      </div>
      <div className="flex text-yellow-400 mb-3">
        {[...Array(5)].map((_, i) => (
          <i key={i} className={`fas fa-star ${i < rating ? '' : 'text-gray-300'}`}></i>
        ))}
      </div>
      <p className="text-gray-600">{`"${testimonial}"`}</p>
    </div>
  );
};

interface TestimonialsSectionProps {
  data: SystemSetting[];
}

const TestimonialsSection: FC<TestimonialsSectionProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null; // Or some placeholder
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Khách Hàng Nói Gì</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Những trải nghiệm thực tế từ khách hàng đã sử dụng sản phẩm của chúng tôi.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((testimonialItem) => (
            <TestimonialCard key={testimonialItem.id} {...(testimonialItem.value as any)} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;