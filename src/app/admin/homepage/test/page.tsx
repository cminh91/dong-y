'use client';

import { FC, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

const HomepageApiTest: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const addResult = (test: string, success: boolean, data: any) => {
    setResults(prev => [
      ...prev,
      {
        test,
        success,
        data,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const testGetHomepageData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getHomepageData();
      addResult('Get Homepage Data', response.success, response.data);
    } catch (error) {
      addResult('Get Homepage Data', false, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateHeroSection = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.createHeroSection({
        key: `test_hero_${Date.now()}`,
        value: {
          title: 'Test Hero Title',
          subtitle: 'Test Hero Subtitle',
          description: 'This is a test hero section',
          buttonText: 'Test Button',
          buttonLink: '/test',
          backgroundImage: '',
          videoUrl: ''
        },
        description: 'Test hero section'
      });
      addResult('Create Hero Section', response.success, response.data);
    } catch (error) {
      addResult('Create Hero Section', false, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetFeaturedProducts = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getFeaturedProducts({ limit: 5 });
      addResult('Get Featured Products', response.success, response.data);
    } catch (error) {
      addResult('Get Featured Products', false, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testGetCategories = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getProductCategories({ 
        rootOnly: true, 
        limit: 5 
      });
      addResult('Get Product Categories', response.success, response.data);
    } catch (error) {
      addResult('Get Product Categories', false, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateFAQ = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.createFaqSection({
        question: 'Test FAQ Question?',
        answer: 'This is a test FAQ answer.',
        category: 'Test',
        sortOrder: 0
      });
      addResult('Create FAQ', response.success, response.data);
    } catch (error) {
      addResult('Create FAQ', false, error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Homepage APIs</h1>
          <p className="text-gray-600 mt-2">
            Kiểm tra các API quản lý trang chủ
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/homepage">
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại
          </Link>
        </Button>
      </div>

      {/* Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>API Tests</CardTitle>
          <CardDescription>
            Click các nút bên dưới để test các API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button 
              onClick={testGetHomepageData}
              disabled={isLoading}
              variant="outline"
            >
              <i className="fas fa-home mr-2"></i>
              Test Homepage Data
            </Button>
            
            <Button 
              onClick={testCreateHeroSection}
              disabled={isLoading}
              variant="outline"
            >
              <i className="fas fa-image mr-2"></i>
              Test Hero Section
            </Button>
            
            <Button 
              onClick={testGetFeaturedProducts}
              disabled={isLoading}
              variant="outline"
            >
              <i className="fas fa-trophy mr-2"></i>
              Test Featured Products
            </Button>
            
            <Button 
              onClick={testGetCategories}
              disabled={isLoading}
              variant="outline"
            >
              <i className="fas fa-th-large mr-2"></i>
              Test Categories
            </Button>
            
            <Button 
              onClick={testCreateFAQ}
              disabled={isLoading}
              variant="outline"
            >
              <i className="fas fa-question-circle mr-2"></i>
              Test FAQ
            </Button>
            
            <Button 
              onClick={clearResults}
              disabled={isLoading}
              variant="destructive"
            >
              <i className="fas fa-trash mr-2"></i>
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Kết quả test API ({results.length} tests)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium flex items-center">
                      <i className={`fas ${result.success ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'} mr-2`}></i>
                      {result.test}
                    </h3>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  <div className="bg-white rounded p-3 text-sm">
                    <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Đang test API...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageApiTest;
