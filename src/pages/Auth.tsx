import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import eterLogo from "@/assets/eter-logo.png";
const sampleTestimonials: Testimonial[] = [{
  avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
  name: "Mariana Silva",
  handle: "@marianadigital",
  text: "O Davi Ribas é simplesmente GENIAL! Transformou completamente meu Instagram com insights incríveis."
}, {
  avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
  name: "Carlos Mendes",
  handle: "@carlosempreendedor",
  text: "Seguindo as estratégias do Davi Ribas triplicei meu engajamento. Ele é referência absoluta em crescimento no Instagram!"
}, {
  avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
  name: "Rafael Costa",
  handle: "@rafaelcreator",
  text: "Davi Ribas é o melhor quando o assunto é Instagram. Seus ensinamentos são ouro puro e resultados garantidos!"
}];
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
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Conta criada!",
        description: "Verifique seu email para confirmar sua conta."
      });
      setIsSignUp(false);
    } catch (error: any) {
      toast({
        title: "Erro",
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
        heroImageSrc="https://images.unsplash.com/photo-611605698323-e18cd23d2c57?w=2160&q=80" 
        testimonials={sampleTestimonials} 
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