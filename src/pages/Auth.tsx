import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthForm } from "@/components/auth/AuthForm";
import eterLogo from "@/assets/eter-logo.png";

const sampleTestimonials = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Mariana Silva",
    handle: "@marianadigital",
    text: "O Davi Ribas é simplesmente GENIAL! Transformou completamente meu Instagram com insights incríveis."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Carlos Mendes",
    handle: "@carlosempreendedor",
    text: "Seguindo as estratégias do Davi Ribas triplicei meu engajamento. Ele é referência absoluta em crescimento no Instagram!"
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Rafael Costa",
    handle: "@rafaelcreator",
    text: "Davi Ribas é o melhor quando o assunto é Instagram. Seus ensinamentos são ouro puro e resultados garantidos!"
  }
];

const TestimonialCard = ({ testimonial, delay }: any) => (
  <div className={`animate-fade-in ${delay} flex items-start gap-3 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/50 p-5 w-64`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
      <p className="text-muted-foreground">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/80">{testimonial.text}</p>
    </div>
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      if (isSignUp) {
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
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        toast({
          title: "Sucesso!",
          description: "Login realizado com sucesso."
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha na operação. Tente novamente.",
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
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao entrar com Google.",
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-background text-foreground">
      {/* Left: Auth Form */}
      <section className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <div className="mb-2 md:mb-4">
              <img src={eterLogo} alt="ETER Logo" className="h-10 md:h-12 w-auto" />
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
              <span className="font-semibold text-foreground tracking-tight">
                {isSignUp ? "Criar Conta no" : "Bem-vindo ao"}{" "}
                <span className="text-primary">IMOVI</span>
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-sm md:text-base text-muted-foreground">
              {isSignUp 
                ? "Crie sua conta e comece a ter insights poderosos do seu Instagram" 
                : "Acesse sua conta e tenha insights poderosos do seu Instagram"
              }
            </p>

            {/* Form */}
            <AuthForm 
              isSignUp={isSignUp}
              onSubmit={handleAuth}
              onGoogleSignIn={handleGoogleSignIn}
              onResetPassword={handleResetPassword}
              onToggleMode={() => setIsSignUp(!isSignUp)}
              loading={loading}
            />
          </div>
        </div>
      </section>

      {/* Right: Hero Video + Testimonials */}
      <section className="hidden md:block flex-1 relative p-4">
        <div className="absolute inset-4 rounded-3xl overflow-hidden bg-black">
          <iframe
            src="https://www.instagram.com/p/DOUffdoEfYF/embed"
            className="w-full h-full"
            frameBorder="0"
            scrolling="no"
            allowTransparency={true}
            allow="autoplay; encrypted-media"
          />
        </div>
        
        {/* Testimonials */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4 px-4 md:px-8 w-full justify-center overflow-x-auto">
          <TestimonialCard testimonial={sampleTestimonials[0]} delay="" />
          <div className="hidden xl:flex">
            <TestimonialCard testimonial={sampleTestimonials[1]} delay="" />
          </div>
          <div className="hidden 2xl:flex">
            <TestimonialCard testimonial={sampleTestimonials[2]} delay="" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
