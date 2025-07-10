"use client";

import { FC, useState, useEffect } from 'react';
import Image from 'next/image';
import { SystemSetting } from '@/types/api';

interface HeroSectionProps {
  data: SystemSetting | null;
}

const HeroSection: FC<HeroSectionProps> = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  //console.log('HeroSection received data:', data);

  if (!data || !data.value || !Array.isArray(data.value) || data.value.length === 0) {
    //console.log('HeroSection: No valid data, returning null');
    return (
      <section className="relative py-16 md:py-24 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-500">
            Chưa có dữ liệu Hero Section
          </h1>
          <p className="text-gray-400">
            Vui lòng thêm dữ liệu trong trang quản trị
          </p>
        </div>
      </section>
    );
  }

  const heroData = data.value as any[];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === heroData.length - 1 ? 0 : prevIndex + 1
        );
        setIsVisible(true);
      }, 300); // thời gian fade out
    }, 3000);

    return () => clearInterval(interval);
  }, [heroData.length]);

  const item = heroData[currentIndex];

  return (
    <section className="relative py-16 md:py-24">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className={`md:w-1/2 mb-10 md:mb-0 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {item.name}
          </h1>
          <p className="text-red-600 text-lg font-bold mb-8">
            {item.description}
          </p>
          <p className="text-blue-600 text-lg mb-8">
          <strong>LƯU Ý:</strong> Sản phẩm được sản xuất từ các loại dược liệu thiên 
nhiên đạt chuẩn.
          </p>
          <div className="flex space-x-4 mb-6">
            <a href="#products" className="btn-primary">Khám phá sản phẩm</a>
            <a href="#contact" className="btn-secondary">Tư vấn miễn phí</a>
          </div>
        </div>
        <div className={`md:w-1/2 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="relative">
            <Image
              src={item.image}
              alt={item.name}
              className="rounded-lg shadow-xl w-full"
              width={600}
              height={400}
              style={{ height: "auto" }}
            />
           
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;