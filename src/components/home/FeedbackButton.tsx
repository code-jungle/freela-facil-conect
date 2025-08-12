import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";

export const FeedbackButton = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!message || message.trim().length < 5) {
      toast({
        title: "Mensagem muito curta",
        description: "Por favor, escreva pelo menos 5 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.functions.invoke('send-feedback-email', {
        body: { name, email, message },
      });
      if (error) throw error;
      toast({ title: "Feedback enviado!", description: "Obrigado pela sua colaboração." });
      setOpen(false);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erro ao enviar", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gradient-primary text-white border-0 px-8">
          <Send className="w-5 h-5" /> Enviar Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar Feedback</DialogTitle>
          <DialogDescription>
            Compartilhe sua opinião para melhorarmos o Servix.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm" htmlFor="fb-name">Nome (opcional)</label>
            <Input id="fb-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm" htmlFor="fb-email">Email (opcional)</label>
            <Input id="fb-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm" htmlFor="fb-message">Mensagem</label>
            <Textarea id="fb-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escreva seu feedback..." rows={5} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={loading} className="gradient-primary text-white border-0">
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
