import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageCircle, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIChatWidgetProps {
  heatData?: any;
  className?: string;
}

export default function AIChatWidget({ heatData, className = "" }: AIChatWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');
  const { toast } = useToast();

  const sendQuickQuery = async (query: string) => {
    setIsLoading(true);
    setInput(query);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          heatData: heatData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      setLastResponse(data.response || data.fallbackResponse || 'AI response received');
      toast({
        title: "AI Analysis Complete",
        description: "Check the response in the chat widget",
        variant: "default"
      });
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      setLastResponse(`Error: ${error.message}`);
      toast({
        title: "AI Chat Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendQuickQuery(input.trim());
    }
  };

  if (!isExpanded) {
    return (
      <Card className={`${className} border-cone-red/20`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cone-red" />
              <span className="text-sm font-medium text-gray-900">AI Assistant</span>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                Active
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-6 w-6 p-0"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {[
              "Analyze chemistry",
              "Energy insights",
              "Process status"
            ].map((query) => (
              <Button
                key={query}
                variant="outline"
                size="sm"
                onClick={() => sendQuickQuery(query)}
                disabled={isLoading}
                className="text-xs h-7 justify-start text-gray-700 hover:text-cone-red"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                {query}
              </Button>
            ))}
          </div>

          {lastResponse && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700 border-l-2 border-cone-red">
              <div className="font-medium mb-1">Latest AI Response:</div>
              <div className="line-clamp-2">{lastResponse}</div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border-cone-red/20`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-cone-red" />
            AI Quick Chat
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-6 w-6 p-0"
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {lastResponse && (
          <div className="mb-3 p-3 bg-gray-50 rounded text-sm text-gray-700 border-l-2 border-cone-red max-h-24 overflow-y-auto">
            <div className="font-medium mb-1 text-xs text-gray-500">AI Response:</div>
            <div>{lastResponse}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about current heat, chemistry, energy, or process..."
            className="w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder-gray-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-1 bg-cone-red hover:bg-cone-red/90 text-white text-sm h-8"
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="w-3 h-3 mr-1" />
                  Ask AI
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInput('')}
              className="text-sm h-8"
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>
        </form>

        <div className="mt-3 grid grid-cols-2 gap-1">
          {[
            "Process recommendations",
            "Energy optimization",
            "Chemistry analysis",
            "Stage timeline insights"
          ].map((query) => (
            <Button
              key={query}
              variant="ghost"
              size="sm"
              onClick={() => setInput(query)}
              className="text-xs h-6 justify-start text-gray-600 hover:text-cone-red p-1"
            >
              {query}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}