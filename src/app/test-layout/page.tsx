export default function TestLayoutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Test Layout Page
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Layout Features Test</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Header Features:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Dynamic product categories menu</li>
                <li>✅ Dynamic blog categories menu</li>
                <li>✅ User authentication status</li>
                <li>✅ Shopping cart integration</li>
                <li>✅ Mobile responsive menu</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Footer Features:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✅ Dynamic product categories links</li>
                <li>✅ Contact information from API</li>
                <li>✅ Company information</li>
                <li>✅ Social media links</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">API Integration:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>✅ /api/product-categories-new - Product categories</li>
                <li>✅ /api/post-categories - Blog categories</li>
                <li>✅ /api/contact-sections - Contact information</li>
                <li>✅ Caching for performance (5 minutes)</li>
                <li>✅ Error handling and fallbacks</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> This page is used to test the layout components. 
              Check the header and footer to see if they're loading data from the APIs correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
