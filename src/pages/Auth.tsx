import { SignInPage } from "@/components/ui/sign-in";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import eterLogo from "@/assets/eter-logo.png";
const Auth = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();

    // Listen for auth state changes (email confirmation, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' && session) {
        toast({
          title: "Login realizado!",
          description: "Redirecionando para o dashboard..."
        });
        navigate("/dashboard");
      }
      
      if (event === 'USER_UPDATED') {
        toast({
          title: "Email confirmado!",
          description: "Sua conta foi ativada com sucesso."
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast({
        title: "Success!",
        description: "You've been signed in successfully."
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive"
      });
    }
  };
  const handleResetPassword = () => {
    toast({
      title: "Redefinir Senha",
      description: "Funcionalidade de redefinição de senha em breve!"
    });
  };
  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      // Get current origin for redirect
      const redirectUrl = window.location.origin;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            email: email
          }
        }
      });
      
      if (error) throw error;
      
      // Check if email confirmation is disabled (auto-confirm)
      if (data?.user && data?.session) {
        toast({
          title: "Conta criada!",
          description: "Login realizado com sucesso."
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Verifique seu email",
          description: "Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta.",
          duration: 8000
        });
        setIsSignUp(false);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Falha ao criar conta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateAccount = () => {
    setIsSignUp(true);
  };
  return <div className="bg-background text-foreground">
      <SignInPage 
        logoSrc={eterLogo} 
        title={<span className="font-semibold text-foreground tracking-tight">
          {isSignUp ? "Criar Conta no" : "Bem-vindo ao"} <span className="text-primary">IMOV</span>
        </span>} 
        description={isSignUp 
          ? "Crie sua conta e comece a ter insights poderosos do seu Instagram" 
          : "Acesse sua conta e tenha insights poderosos do seu Instagram"
        }
        heroImageSrc="https://www.instagram.com/reel/C_m7nRGxfGl/embed"
        onSignIn={isSignUp ? handleSignUp : handleSignIn}
        onGoogleSignIn={handleGoogleSignIn} 
        onResetPassword={handleResetPassword} 
        onCreateAccount={handleCreateAccount}
        isSignUp={isSignUp}
        onSwitchToSignIn={() => setIsSignUp(false)}
      />
    </div>;
};
export default Auth;