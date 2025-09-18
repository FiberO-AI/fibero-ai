import AdSense from '../components/AdSense';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">
              Fibero AI collects information you provide directly to us, such as when you create an account, 
              use our AI comparison services, or contact us for support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed">
              We use the information we collect to provide, maintain, and improve our AI model comparison services, 
              process transactions, and communicate with you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate security measures to protect your personal information against unauthorized 
              access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@fibero-ai.com
            </p>
          </section>
        </div>

        {/* Advertisement */}
        <div className="mt-8 flex justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-4">
            <AdSense 
              adSlot="1958348142" 
              adFormat="auto"
              style={{ display: 'block', minHeight: '250px', width: '100%', maxWidth: '336px' }}
              className="text-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
