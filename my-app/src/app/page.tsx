"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';

const DynamicBarChart = dynamic(() => import('@/components/DynamicBarChart'), { ssr: false });

export default function Home() {
  const [startupIdea, setStartupIdea] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const statusEndRef = useRef<HTMLDivElement | null>(null);

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
      const formData = { startup_idea: startupIdea, country, city };
      try {
        const response = await fetch('http://localhost:8000/analyze_idea', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
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
          VentureAssist <span className="text-gray-900">.ai</span>
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
            <div>
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
            </div>
          )}

          {analysisResult && (
            <>
              {analysisResult.scope_of_business &&   analysisResult.scope_of_business.length > 0 &&(
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
              )}

              {analysisResult.market_research &&  analysisResult.market_research.length > 0 && (
                <section>
                  <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl">
                    <CardContent className="p-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-teal-500" />
                        Market Research
                      </h2>
                      <p className="text-gray-700 text-lg leading-relaxed">{analysisResult.market_research}</p>
                      {analysisResult.graph_plot_market_research?.map((chart, index) => (
        <DynamicBarChart
          key={index}
          chartData={chart}
          title={chart.title}
          description={`Chart type: ${chart.chart_type}`}
        />
      ))}
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
              )}

          {analysisResult.legal_requirements && analysisResult.legal_requirements.length > 0  &&(
            <section>
              <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                    <Activity className="w-8 h-8 mr-3 text-teal-500" />
                    Legal Requirements
                  </h2>
                  <div className="space-y-6">
                    {analysisResult.legal_requirements.map((item, index) => (
                      <div key={index} className="space-y-4">
                        {Object.keys(item).map((key, i) => (
                          <div key={i}>
                            <h3 className="text-xl font-semibold text-gray-900">{key.replace(/_/g, ' ').toUpperCase()}</h3>
                            <p className="text-gray-700 text-lg leading-relaxed">{item[key]}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

{analysisResult.finance && analysisResult.finance.length > 0 && (
  <section>
    {analysisResult.finance.map((item, index) => {
      // Check if the item contains financial estimates or technology tools
      if (item.total_investment_needed || item.time_frame) {
        return (
          <Card key={index} className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="w-8 h-8 mr-3 text-teal-500" />
                Financial Estimates
              </h2>
              {item.total_investment_needed && (
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Total Investment Needed</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{item.total_investment_needed}</p>
                </div>
              )}
              {item.time_frame && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Time Frame</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">{item.time_frame}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      }

      if (item.technology_tools_required) {
        return (
          <Card key={index} className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl mb-8">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="w-8 h-8 mr-3 text-teal-500" />
                Technology Tools Required
              </h2>
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="p-4 text-left text-gray-900">Technology/Tool</th>
                    <th className="p-4 text-left text-gray-900">Purpose and Importance</th>
                  </tr>
                </thead>
                <tbody>
                  {item.technology_tools_required.map((tool, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="p-4 text-gray-700">{tool["technology/tool"]}</td>
                      <td className="p-4 text-gray-700">{tool["purpose and importance"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      }

      return null; // Ensure to return null if no relevant data is found
    })}
  </section>
)}


              {analysisResult.growth_scaling && analysisResult.growth_scaling.length > 0 && (
                <section>
                  <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl">
                    <CardContent className="p-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-teal-500" />
                        Growth Strategies
                      </h2>
                      <p className="text-gray-700 text-lg leading-relaxed">{analysisResult.growth_scaling}</p>
                      {/* {analysisResult.graph_plot_growth_strategies?.map((chart, index) => (
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
              )}
            {analysisResult.financial_aid_guidance && analysisResult.financial_aid_guidance.length > 0 && (
              <section>
                <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl mb-8">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                      <Activity className="w-8 h-8 mr-3 text-teal-500" />
                      Financial Aid Guidance
                    </h2>
                    <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="p-4 text-left text-gray-900">Scheme</th>
                          <th className="p-4 text-left text-gray-900">Summary</th>
                          <th className="p-4 text-left text-gray-900">Type</th>
                          <th className="p-4 text-left text-gray-900">Application Process</th>
                          <th className="p-4 text-left text-gray-900">Eligibility Criteria</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResult.financial_aid_guidance.map((aid, index) => (
                          <tr key={index} className="border-b border-gray-200">
                            <td className="p-4 text-gray-700">{aid.scheme}</td>
                            <td className="p-4 text-gray-700">{aid.summary}</td>
                            <td className="p-4 text-gray-700">{aid.type}</td>
                            <td className="p-4 text-gray-700">{aid["application process"]}</td>
                            <td className="p-4 text-gray-700">{aid["eligibility criteria"]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </section>
            )}
            {analysisResult.market_entry_strategies && analysisResult.market_entry_strategies.length > 0 && (
                <section>
                  <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl">
                    <CardContent className="p-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-teal-500" />
                        Market Entry Strategies
                      </h2>
                      <p className="text-gray-700 text-lg leading-relaxed">{analysisResult.market_entry_strategies}</p>
                      {/* {analysisResult.graph_plot_growth_strategies?.map((chart, index) => (
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
              )}

{analysisResult.competitive_analysis && analysisResult.competitive_analysis.length > 0 && (
  <section>
    <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl mb-8">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <Activity className="w-8 h-8 mr-3 text-teal-500" />
          Competitive Analysis
        </h2>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="p-4 text-left text-gray-900">Business</th>
              <th className="p-4 text-left text-gray-900">Strength</th>
              <th className="p-4 text-left text-gray-900">Weakness</th>
              <th className="p-4 text-left text-gray-900">Market Positioning</th>
            </tr>
          </thead>
          <tbody>
            {analysisResult.competitive_analysis.map((competitor, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-4 text-gray-700">{competitor.business}</td>
                <td className="p-4 text-gray-700">{competitor.strength}</td>
                <td className="p-4 text-gray-700">{competitor.weakness}</td>
                <td className="p-4 text-gray-700">{competitor.market_positioning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  </section>
)}
{analysisResult.customer_personas && analysisResult.customer_personas.length > 0 && (
  <section>
    <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl mb-8">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <Activity className="w-8 h-8 mr-3 text-teal-500" />
          Customer Personas
        </h2>
        {analysisResult.customer_personas.map((persona, index) => (
          <div key={index} className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{persona.persona_name}</h3>
            <div className="mb-4">
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Demographics</h4>
              <ul className="list-disc pl-5">
                <li><strong>Age Range:</strong> {persona.demographics.age_range}</li>
                <li><strong>Gender:</strong> {persona.demographics.gender}</li>
                <li><strong>Income Level:</strong> {persona.demographics.income_level}</li>
                <li><strong>Education Level:</strong> {persona.demographics.education_level}</li>
              </ul>
            </div>
            <div className="mb-4">
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Behaviors</h4>
              <ul className="list-disc pl-5">
                {persona.behaviors.map((behavior, idx) => (
                  <li key={idx}>{behavior}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Pain Points</h4>
              <ul className="list-disc pl-5">
                {persona.pain_points.map((painPoint, idx) => (
                  <li key={idx}>{painPoint}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </section>
)}





              {analysisResult.swot_analysis && (
                <section>
                  <Card className="overflow-hidden shadow-lg bg-teal-100 border-teal-300 border-2 rounded-xl">
                    <CardContent className="p-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-teal-500" />
                        SWOT Analysis
                      </h2>
                     
                      <p className="text-gray-700 text-lg leading-relaxed">{analysisResult.swot_analysis}</p>
      
    
                    </CardContent>
                  </Card>
                </section>
              )}

              
            </>
          )}
        </div>
      </main>
    </div>
  );
}
