import { FC } from 'react';
import { SystemSetting } from '@/types/api';

interface BenefitItemProps {
  icon: string;
  title: string;
  description: string;
}

const BenefitItem: FC<BenefitItemProps> = ({ icon, title, description }) => {
  return (
    <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-300">
      <i className={`fas ${icon} text-3xl text-green-600 w-10 text-center`}></i>
      <div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

interface BenefitsSectionProps {
  benefits: SystemSetting[];
}

const BenefitsSection: FC<BenefitsSectionProps> = ({ benefits }) => {
  if (!benefits || benefits.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Lợi Ích Của Y Học Cổ Truyền</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Đông y không chỉ điều trị triệu chứng mà còn cân bằng cơ thể, tăng cường sức đề kháng và phòng ngừa bệnh tật.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <BenefitItem key={benefit.id} {...(benefit.value as BenefitItemProps)} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;