import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  logoSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  isSignUp?: boolean;
  onSwitchToSignIn?: () => void;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-primary/70 focus-within:bg-primary/10">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-fade-in ${delay} flex items-start gap-3 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/50 p-5 w-64`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
      <p className="text-muted-foreground">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/80">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Bem-vindo</span>,
  description = "Acesse sua conta e continue sua jornada conosco",
  heroImageSrc,
  logoSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  isSignUp = false,
  onSwitchToSignIn,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full">
      {/* Left column: sign-in form - Mobile optimized */}
      <section className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-4 sm:gap-6">
            {logoSrc && (
              <div className="mb-2 sm:mb-2 md:mb-4">
                <img src={logoSrc} alt="Logo" className="h-8 sm:h-10 md:h-12 w-auto" />
              </div>
            )}
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">{title}</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">{description}</p>

            <form className="space-y-3 sm:space-y-4 md:space-y-5" onSubmit={onSignIn}>
              <div>
                <label className="text-xs sm:text-sm font-medium text-muted-foreground">Endereço de Email</label>
                <GlassInputWrapper>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Digite seu endereço de email" 
                    className="w-full bg-transparent text-xs sm:text-sm p-3 sm:p-4 rounded-2xl focus:outline-none" 
                    required
                  />
                </GlassInputWrapper>
              </div>

              <div>
                <label className="text-xs md:text-sm font-medium text-muted-foreground">Senha</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Digite sua senha" 
                      className="w-full bg-transparent text-xs sm:text-sm p-3 sm:p-4 pr-10 sm:pr-12 rounded-2xl focus:outline-none" 
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute inset-y-0 right-2 sm:right-3 flex items-center touch-target"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              {!isSignUp && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm">
                  <label className="flex items-center gap-2 cursor-pointer touch-target">
                    <input type="checkbox" name="rememberMe" className="h-4 w-4 rounded border-border" />
                    <span className="text-foreground/90">Manter-me conectado</span>
                  </label>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} 
                    className="hover:underline text-primary transition-colors whitespace-nowrap touch-target inline-block"
                  >
                    Redefinir senha
                  </a>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full min-h-[44px] sm:min-h-[48px] rounded-2xl bg-primary py-2.5 sm:py-3 md:py-4 text-sm sm:text-base font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
              >
                {isSignUp ? "Criar Conta" : "Entrar"}
              </button>
            </form>

            <div className="relative flex items-center justify-center my-4 sm:my-5">
              <span className="w-full border-t border-border"></span>
              <span className="px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground bg-background absolute">Ou continue com</span>
            </div>

            <button 
              onClick={onGoogleSignIn} 
              className="w-full min-h-[44px] sm:min-h-[48px] flex items-center justify-center gap-2 sm:gap-3 border border-border rounded-2xl py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base hover:bg-secondary active:scale-[0.98] transition-all"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            {isSignUp ? (
              <p className="text-center text-xs md:text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); onSwitchToSignIn?.(); }} 
                  className="text-primary hover:underline transition-colors"
                >
                  Fazer Login
                </a>
              </p>
            ) : (
              <p className="text-center text-xs md:text-sm text-muted-foreground">
                Novo em nossa plataforma?{' '}
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }} 
                  className="text-primary hover:underline transition-colors"
                >
                  Criar Conta
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Right column: Instagram Reels embed - Hidden on mobile */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div className="absolute inset-4 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background shadow-2xl">
            <iframe
              src={heroImageSrc}
              className="w-full h-full"
              frameBorder="0"
              scrolling="no"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            ></iframe>
          </div>
        </section>
      )}
    </div>
  );
};