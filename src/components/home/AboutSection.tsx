import { FC } from 'react';
import Image from 'next/image';
import { SystemSetting } from '@/types/api';

interface AboutSectionProps {
  data: SystemSetting | null;
}

const AboutSection: FC<AboutSectionProps> = ({ data }) => {
  if (!data || !data.value) {
    return null; // or a loading/placeholder component
  }

  const { title, subtitle, content, image1, image2, stats } = data.value as any;

  return (
    <section id="about" className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <h2 className="text-3xl font-bold mb-6">{title}</h2>
            <p className="text-gray-600 mb-4">{subtitle}</p>
            <p className="text-gray-600 mb-6">{content}</p>
            <div className="flex space-x-4 mt-8">
              {stats.map((stat: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="grid grid-cols-2 gap-4">
              <Image
                src={image1}
                alt="Ảnh 1"
                className="rounded-lg shadow-lg"
                width={300}
                height={200}
                style={{objectFit: 'cover'}}
              />
              <Image
                src={image2}
                alt="Ảnh 2"
                className="rounded-lg shadow-lg mt-8"
                width={300}
                height={200}
                style={{objectFit: 'cover'}}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;