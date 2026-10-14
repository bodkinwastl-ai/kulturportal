"use client"

import React from "react";

// Test data for breaking UI components
const worstCaseTestData = {
  sources: [
    {
      id: "break-1",
      name: "Aleksandra Wiśniewska-Kowalczyk's International Festival of Contemporary Avant-Garde Jazz & Experimental Music",
      url: "https://bartholomew.fitzgerald.northwind-industries-holdings.example.com/events/festival",
      active: true,
      regions: ["Wien", "Niederösterreich", "Oberösterreich", "Salzburg", "Steiermark"],
      categories: ["Jazz", "Klassik", "Zeitgenössisch", "Experimentell", "Avant-Garde"],
      priority: 1,
      notes: "Extremely long notes that describe every detail about this cultural venue including its history dating back to 1847 when it was founded by the Austro-Hungarian Empire and has been continuously operating except during both World Wars."
    },
    {
      id: "break-2", 
      name: "Jo",
      url: "https://a.at",
      active: false,
      regions: [],
      categories: [],
      priority: 3,
      notes: ""
    },
    {
      id: "break-3",
      name: "🎭🎪🎨🎵🎸🥁🎤🎼🎹🎺",
      url: "https://unicode-test.example.com/🎭🎪",
      active: true,
      regions: ["한국", "日本", "中国"],
      categories: ["🎵", "🎭", "🎪"],
      priority: 1,
      notes: "Unicode and emoji testing"
    }
  ]
};

// Break UI Testing Component
const BreakUITest = () => {
  const [selectedData, setSelectedData] = React.useState('demo');
  const [currentTestData, setCurrentTestData] = React.useState<any>(null);

  const dataOptions = [
    { key: 'demo', label: 'Demo Data' },
    { key: 'worst', label: 'Worst Case' },
    { key: 'empty', label: 'Empty' },
    { key: 'single', label: 'Single Item' }
  ];

  const handleDataChange = (dataKey: string) => {
    setSelectedData(dataKey);
    
    let testData = null;
    switch(dataKey) {
      case 'worst':
        testData = worstCaseTestData;
        break;
      case 'empty':
        testData = { sources: [] };
        break;
      case 'single':
        testData = { sources: [worstCaseTestData.sources[0]] };
        break;
    }
    
    setCurrentTestData(testData);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Break-UI Testing Lab</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <h2 className="font-semibold text-red-900 mb-2">⚠️ Testing Worst-Case Scenarios</h2>
          <p className="text-sm text-red-800">
            This page tests UI components with extreme data to identify breaking points.
            Switch between data sets below and observe layout issues.
          </p>
        </div>

        {/* Data Toggle */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h3 className="font-semibold mb-4">Test Data Selection:</h3>
          <div className="flex gap-2 mb-4">
            {dataOptions.map(option => (
              <button
                key={option.key}
                onClick={() => handleDataChange(option.key)}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedData === option.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {currentTestData && (
            <div className="bg-gray-50 rounded p-4">
              <h4 className="font-medium mb-2">Current Test Data Preview:</h4>
              <pre className="text-xs overflow-x-auto bg-white p-2 rounded border">
                {JSON.stringify(currentTestData, null, 2).slice(0, 800)}...
              </pre>
            </div>
          )}
        </div>

        {/* Testing Results */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-green-700 mb-4">✅ What Should Hold Up</h3>
            <ul className="space-y-2 text-sm">
              <li>• Cards maintain consistent height</li>
              <li>• Text truncates with ellipsis when too long</li>
              <li>• Action buttons stay accessible</li>
              <li>• Grid layout doesn't break</li>
              <li>• Unicode characters render correctly</li>
            </ul>
          </div>
          
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-red-700 mb-4">🚨 Expected Break Points</h3>
            <ul className="space-y-2 text-sm">
              <li>• Very long source names overflow containers</li>
              <li>• Long URLs don't break properly</li>
              <li>• Empty arrays show awkward spacing</li>
              <li>• Single character names look odd</li>
              <li>• Priority badges with extreme values</li>
              <li>• Extremely long notes break cards</li>
            </ul>
          </div>
        </div>

        {/* Component Testing Area */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Component Testing</h3>
          
          {/* Simulate source cards with test data */}
          {currentTestData?.sources ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentTestData.sources.map((source: any) => (
                <div key={source.id} className="bg-white border border-slate-300 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm leading-5 text-slate-900">
                      {source.name}
                    </h4>
                    <span className={`ml-2 px-2 py-1 text-xs rounded flex-shrink-0 ${
                      source.active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {source.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-600 mb-2 break-all">
                    {source.url}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {source.regions.map((region: string, idx: number) => (
                      <span key={idx} className="px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {region}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {source.categories.map((cat: string, idx: number) => (
                      <span key={idx} className="px-1 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-slate-500 mb-2">
                    Priorität: {source.priority}
                  </div>
                  
                  {source.notes && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                      {source.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">Select test data above to see components with extreme values</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreakUITest;