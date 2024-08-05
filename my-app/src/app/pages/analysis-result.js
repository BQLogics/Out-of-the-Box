import { useRouter } from 'next/router';
import { Card, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

const AnalysisResult = () => {
  const router = useRouter();
  const { result } = router.query;

  if (!result) {
    return <p>No results to display.</p>;
  }

  const analysisResult = JSON.parse(result as string);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-teal-600 tracking-tight">
            Analysis Result
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Display analysis results */}
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
                        Growth Strategies
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
};

export default AnalysisResult;
