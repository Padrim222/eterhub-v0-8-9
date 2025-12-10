import { SignInPage, PasswordStrength, PasswordRequirements } from "@/components/ui/sign-in";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import eterLogo from "@/assets/eter-logo.png";

const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { level: 0, label: '', color: 'bg-muted', textColor: 'text-muted-foreground' };
  
  const hasMinLength = password.length >= 6;
  const hasGoodLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [hasMinLength, hasGoodLength, hasUppercase && hasLowercase, hasNumbers, hasSpecial].filter(Boolean).length;
  
  if (score <= 1) return { level: 1, label: 'Muito fraca', color: 'bg-red-500', textColor: 'text-red-500' };
  if (score === 2) return { level: 2, label: 'Fraca', color: 'bg-orange-500', textColor: 'text-orange-500' };
  if (score === 3) return { level: 3, label: 'Média', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
  return { level: 4, label: 'Forte', color: 'bg-green-500', textColor: 'text-green-500' };
};

const calculatePasswordRequirements = (password: string): PasswordRequirements => ({
  minLength: password.length >= 6,
  hasUppercase: /[A-Z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [password, setPassword] = useState('');

  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);
  const passwordRequirements = useMemo(() => calculatePasswordRequirements(password), [password]);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/home");
      }
    };
    checkUser();

    // Listen for auth state changes (email confirmation, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      if (event === 'SIGNED_IN' && session) {
        toast({
          title: "Login realizado!",
          description: "Redirecionando..."
        });
        navigate("/home");
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
    const passwordValue = formData.get("password") as string;

    if (!email || !passwordValue) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: passwordValue
      });
      if (error) throw error;
      toast({
        title: "Login realizado!",
        description: "Você foi autenticado com sucesso."
      });
      navigate("/home");
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Falha ao fazer login. Tente novamente.";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Conta não ativada. Verifique seu email para confirmar sua conta.";
      } else if (error.message?.includes("User not found")) {
        errorMessage = "Conta não encontrada. Verifique o email ou crie uma nova conta.";
      }
      
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/home`
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

  const handleFacebookSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/home`,
          scopes: 'email,public_profile'
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao entrar com Facebook",
        description: error.message || "Falha ao fazer login com Facebook.",
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
    const passwordValue = formData.get("password") as string;

    // Validação básica
    if (!email || !passwordValue) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    if (passwordValue.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: passwordValue,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            email: email.trim()
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
        navigate("/home");
      } else if (data?.user && !data?.session) {
        // User created but needs email confirmation
        toast({
          title: "Verifique seu email",
          description: "Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta.",
          duration: 8000
        });
        setIsSignUp(false);
        setPassword('');
      } else {
        // Fallback - show generic success
        toast({
          title: "Conta criada!",
          description: "Você pode fazer login agora."
        });
        setIsSignUp(false);
        setPassword('');
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = "Falha ao criar conta. Tente novamente.";
      
      if (error.message?.includes("User already registered")) {
        errorMessage = "Este email já está cadastrado. Tente fazer login ou use outro email.";
      } else if (error.message?.includes("Password should be at least")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.message?.includes("Unable to validate email")) {
        errorMessage = "Email inválido. Verifique o formato do email.";
      } else if (error.message?.includes("Signup is disabled")) {
        errorMessage = "Cadastro temporariamente desabilitado. Tente novamente mais tarde.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    setIsSignUp(true);
    setPassword('');
  };

  const handleSwitchToSignIn = () => {
    setIsSignUp(false);
    setPassword('');
  };

  return (
    <div className="bg-background text-foreground">
      <SignInPage 
        logoSrc={eterLogo} 
        title={
          <span className="font-semibold text-foreground tracking-tight">
            {isSignUp ? "Criar Conta no" : "Bem-vindo ao"} <span className="text-primary">Seu Movimento.</span>
          </span>
        } 
        description={isSignUp ? "Crie sua conta e comece a ter insights poderosos do seu Instagram" : "Acesse sua conta e tenha insights poderosos do seu Instagram"} 
        heroImageSrc="https://www.instagram.com/p/DOUffdoEfYF/embed" 
        onSignIn={isSignUp ? handleSignUp : handleSignIn} 
        onGoogleSignIn={handleGoogleSignIn} 
        onFacebookSignIn={handleFacebookSignIn} 
        onResetPassword={handleResetPassword} 
        onCreateAccount={handleCreateAccount} 
        isSignUp={isSignUp} 
        onSwitchToSignIn={handleSwitchToSignIn}
        passwordStrength={passwordStrength}
        passwordRequirements={passwordRequirements}
        onPasswordChange={setPassword}
      />
    </div>
  );
};

export default Auth;
