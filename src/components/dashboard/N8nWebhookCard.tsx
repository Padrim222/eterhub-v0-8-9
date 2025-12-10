import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Webhook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const N8nWebhookCard = () => {
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    getUserId();
  }, []);

  const webhookUrl = `https://gpomjdrjueixrmqzoyvg.supabase.co/functions/v1/receive-instagram-metrics`;

  const examplePayload = {
    user_id: userId || 'YOUR_USER_ID',
    posts: [
      {
        url: 'https://www.instagram.com/p/EXAMPLE/',
        thumbnail_url: 'https://example.com/thumb.jpg',
        type: 'reel',
        views: 15000,
        likes: 1200,
        comments: 85,
        shares: 45,
        saves: 320,
        engagement_rate: 11.5,
        published_at: '2024-01-15T10:30:00Z'
      }
    ],
    instagram_stats: {
      followers: 25000,
      following: 350,
      posts_count: 156
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copiado!',
      description: 'URL do webhook copiada para a área de transferência',
    });
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Webhook className="w-5 h-5 text-primary" />
          <CardTitle>Integração n8n + Reportei</CardTitle>
        </div>
        <CardDescription>
          Configure seu fluxo n8n para enviar métricas do Instagram automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">URL do Webhook</Label>
          <div className="flex gap-2">
            <Input
              id="webhook-url"
              value={webhookUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(webhookUrl)}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use esta URL no seu fluxo n8n como destino do webhook
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-id">Seu User ID</Label>
          <div className="flex gap-2">
            <Input
              id="user-id"
              value={userId}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(userId)}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Inclua este ID no payload do webhook como "user_id"
          </p>
        </div>

        <div className="space-y-2">
          <Label>Exemplo de Payload</Label>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(examplePayload, null, 2)}
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(JSON.stringify(examplePayload, null, 2))}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure seu nó HTTP no n8n para enviar dados neste formato
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Como configurar no n8n:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
            <li>No seu fluxo n8n, adicione um nó HTTP Request</li>
            <li>Configure o método como POST</li>
            <li>Cole a URL do webhook acima</li>
            <li>No body, inclua os dados no formato do exemplo</li>
            <li>Certifique-se de incluir seu user_id no payload</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};