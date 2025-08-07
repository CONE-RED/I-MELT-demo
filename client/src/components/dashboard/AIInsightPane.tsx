import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { Insight } from '@/types';
import { sendMessage } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusIndicator, SystemHealth } from '@/components/ui/status-indicator';
import { Zap, ArrowRight, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInsightPaneProps {
  insights: Insight[];
}

export default function AIInsightPane({ insights }: AIInsightPaneProps) {
  const dispatch = useDispatch();
  const { language, selectedTab } = useSelector((state: RootState) => state);
  const [chatInput, setChatInput] = useState('');
  
  const handleTabChange = (value: string) => {
    dispatch({ 
      type: 'SET_SELECTED_TAB', 
      payload: value as 'insights' | 'explain' | 'chat' 
    });
  };
  
  const handleAcknowledge = (insightId: string) => {
    // Mark insight as acknowledged and remove from list
    console.log('Acknowledged insight:', insightId);
    dispatch({ type: 'ACKNOWLEDGE_INSIGHT', payload: insightId });
    
    // For "apply" actions, clear the screen/reset view
    const insight = insights.find(i => i.id === insightId);
    if (insight && insight.type !== 'critical') {
      // Clear screen action - reset dashboard to clean state
      console.log('Applying action and clearing screen');
      dispatch({ type: 'CLEAR_SCREEN' });
    }
    
    sendMessage({
      type: 'acknowledge_insight',
      payload: { insightId }
    });
  };
  
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    
    sendMessage({
      type: 'chat_message',
      payload: { message: chatInput }
    });
    
    setChatInput('');
  };
  
  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleTimeString(
      language === 'en' ? 'en-US' : 'ru-RU',
      { hour: '2-digit', minute: '2-digit' }
    );
  };
  
  const labels = {
    en: {
      title: "AI Insights",
      insights: "Insights",
      explain: "Explain",
      chat: "Chat",
      acknowledge: "Acknowledge",
      apply: "Apply",
      chatPlaceholder: "Ask AI Assistant a question..."
    },
    ru: {
      title: "ИИ-аналитика",
      insights: "Аналитика",
      explain: "Объяснение",
      chat: "Чат",
      acknowledge: "Принять",
      apply: "Применить",
      chatPlaceholder: "Задайте вопрос ИИ-ассистенту..."
    }
  };
  
  const lang = language === 'en' ? 'en' : 'ru';
  
  return (
    <div className="dashboard-card h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Zap className="h-5 w-5 text-cone-red animate-pulse" />
        </div>
      </div>
      
      <Tabs 
        value={selectedTab} 
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mb-3 border-b border-cone-gray/20 w-full justify-start rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="insights" 
            className="px-3 py-2 text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-cone-red data-[state=active]:shadow-none rounded-none"
          >
            {labels[lang].insights}
          </TabsTrigger>
          <TabsTrigger 
            value="explain" 
            className="px-3 py-2 text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-cone-red data-[state=active]:shadow-none rounded-none"
          >
            {labels[lang].explain}
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="px-3 py-2 text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-cone-red data-[state=active]:shadow-none rounded-none"
          >
            {labels[lang].chat}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="flex-1 overflow-y-auto max-h-[300px] pr-1 space-y-4 m-0">
          {insights.map(insight => (
            <div 
              key={insight.id} 
              className={cn(
                "p-3 rounded bg-cone-gray/10",
                insight.type === 'critical' && !insight.acknowledged 
                  ? "border-l-2 border-cone-red" 
                  : ""
              )}
            >
              <div className={cn(
                "font-medium mb-1 flex items-center",
                insight.type === 'critical' && !insight.acknowledged && "triangle-accent"
              )}>
                {insight.title}
              </div>
              <p>{insight.message}</p>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-cone-gray">{formatTimestamp(insight.timestamp)}</span>
                {insight.actionable && (
                  <button 
                    className={cn(
                      "hover:text-cone-accent transition",
                      insight.type === 'critical' 
                        ? "text-cone-red" 
                        : "text-cone-gray/70 hover:text-cone-white"
                    )}
                    onClick={() => handleAcknowledge(insight.id)}
                  >
                    {insight.type === 'critical' 
                      ? labels[lang].acknowledge 
                      : labels[lang].apply}
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {insights.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-cone-gray">
              <Zap className="h-10 w-10 mb-2 text-cone-gray/30" />
              <p>No insights available yet</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="explain" className="flex-1 m-0">
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-cone-gray">
              <svg 
                className="w-32 h-32 mx-auto mb-4 text-cone-gray/20" 
                viewBox="0 0 100 100"
              >
                <g fill="currentColor">
                  <rect x="20" y="20" width="60" height="10" />
                  <rect x="20" y="40" width="40" height="10" />
                  <rect x="20" y="60" width="20" height="10" />
                  <polyline 
                    points="20,70 80,70" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none"
                  />
                </g>
              </svg>
              <p>SHAP explanations will appear here</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="chat" className="flex-1 m-0 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="p-3 text-center text-cone-gray">
              <p>Ask the AI assistant about your heat or furnace operations</p>
            </div>
          </div>
          
          <div className="relative">
            <Input
              type="text"
              placeholder={labels[lang].chatPlaceholder}
              className="w-full rounded bg-cone-gray/20 border border-cone-gray/30 px-3 py-2 text-sm focus:outline-none focus-visible:border-cone-red"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
            />
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cone-gray hover:text-cone-white hover:bg-transparent"
              onClick={handleSendChat}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
