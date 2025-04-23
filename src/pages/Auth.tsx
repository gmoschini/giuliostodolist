
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (isLogin: boolean) => {
    try {
      setIsLoading(true);
      const { error } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) throw error;

      if (!isLogin) {
        toast({
          title: "Account creato con successo",
          description: "Effettua il login per continuare"
        });
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold">ToDo App</h2>
          <p className="mt-2 text-gray-600">Accedi o registrati per continuare</p>
        </div>
        <div className="space-y-4">
          <div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Button
              className="w-full"
              onClick={() => handleAuth(true)}
              disabled={isLoading}
            >
              Accedi
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleAuth(false)}
              disabled={isLoading}
            >
              Registrati
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
