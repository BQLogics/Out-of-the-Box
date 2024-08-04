'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Input} from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Activity, ListChecks } from 'lucide-react';
import dynamic from 'next/dynamic';

const DynamicBarChart = dynamic(() => import('@/components/DynamicBarChart'), { ssr: false });
const DynamicAreaChart = dynamic(() => import('@/components/DynamicAreaChart'), { ssr: false });

export default function Home() {
  const [startupIdea, setStartupIdea] = useState('');
  const [country, setCountry] = useState('');
  const [city,setCity]= useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessages, setStatusMessages] = useState([]);
  const ws = useRef(null);
  const statusEndRef = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/ws');
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status) {
        setStatusMessages((prev) => [...prev, data.status]);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    statusEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [statusMessages]);

  const handleAnalyze = async () => {
    if (startupIdea && country && city) {
      setIsLoading(true);
      setStatusMessages([]);
      setAnalysisResult(null);
      const formData = { startup_idea:startupIdea, country ,city};
      try {
        const response = await fetch('http://localhost:8000/analyze_idea', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAnalysisResult(data);
        setStatusMessages(['Analysis completed successfully']);
      } catch (error) {
        console.error('Error analyzing input:', error);
        setStatusMessages(['Error analyzing input']);
      } finally {
        setIsLoading(false);
      }
    } else {
      setStatusMessages(['Please fill in all fields']);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-teal-600 tracking-tight">
            BizStart<span className="text-gray-900"> AI</span>
          </h1>
          <p className="text-gray-500 text-lg">Your comprehensive startup guide</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <section>
            <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Analyze Your Startup Idea</h2>
                <div className="space-y-6">
                  <div>
                    <Input
                      placeholder="Enter your startup idea"
                      value={startupIdea}
                      onChange={(e) => setStartupIdea(e.target.value)}
                      className="w-full border-teal-300"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      type="text"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full border-teal-300"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border-teal-300"
                    />
                  </div>
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={isLoading}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-lg font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze'
                    )}
                  </Button>
                </div>
                {statusMessages.length > 0 && (
                  <div className="mt-4">
                    {statusMessages.map((message, index) => (
                      <p key={index} className="text-sm font-medium text-teal-600">{message}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {statusMessages.length > 0 && (
            <section>
              <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-8 h-8 mr-3 text-teal-500" />
                    Analysis Progress
                  </h2>
                  <div className="bg-teal-50 p-6 rounded-lg h-64 overflow-y-auto">
                    {statusMessages.map((message, index) => (
                      <div key={index} className="mb-3 text-sm text-gray-700 flex items-start">
                        <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 mr-3"></div>
                        {message}
                      </div>
                    ))}
                    <div ref={statusEndRef} />
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {analysisResult && (
            <>
              <section>
                <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                      <Activity className="w-8 h-8 mr-3 text-teal-500" />
                      Scope of Business
                    </h2>
                    <p className="text-gray-700 text-lg leading-relaxed">{analysisResult.scope_of_business}</p>
                  </CardContent>
                </Card>
              </section>

              <section>
                <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                      <Activity className="w-8 h-8 mr-3 text-teal-500" />
                      Market Research
                    </h2>
                    <p className="text-gray-700 text-lg leading-relaxed">{analysisResult.market_research}</p>
                    {/* {analysisResult.graph_plot_market_research?.map((chart, index) => (
                      <div key={index} className="mt-8">
                        {chart.chart_type === 'bar' && (
                          <DynamicBarChart data={chart.data} title={chart.title} />
                        )}
                        {chart.chart_type === 'pie' && (
                          <DynamicAreaChart data={chart.data} title={chart.title} />
                        )}
                      </div>
                    ))} */}
                  </CardContent>
                </Card>
              </section>

              <section>
                <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                      <Activity className="w-8 h-8 mr-3 text-teal-500" />
                      Legal Requirements
                    </h2>
                    <ul className="space-y-4">
                      {analysisResult.legal_requirements.map((req, index) => (
                        <li key={index}>
                          <h3 className="text-xl font-semibold text-teal-600 mb-2">Tax</h3>
                          <p className="text-gray-700">{req.tax}</p>
                          <h3 className="text-xl font-semibold text-teal-600 mt-4 mb-2">Legal Compliance</h3>
                          <p className="text-gray-700">{req.legal_compliance}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <section>
                <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                      <ListChecks className="w-8 h-8 mr-3 text-teal-500" />
                      Financial Estimates & Growth Strategies
                    </h2>
                    <p className="text-gray-700 text-lg leading-relaxed">{analysisResult.financial_estimates}</p>
                    <p className="text-gray-700 text-lg leading-relaxed mt-4">{analysisResult.growth_strategies}</p>
                  </CardContent>
                </Card>
              </section>

              <section>
                <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                      <ListChecks className="w-8 h-8 mr-3 text-teal-500" />
                      Financial Aid Guidance
                    </h2>
                    <p className="text-gray-700 text-lg leading-relaxed">{analysisResult.financial_aid_guidance}</p>
                  </CardContent>
                </Card>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
