import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/LoadingScreen";
import afriLogo from "/images/afrithrive-logo.png";

const missionImage1 = "/images/mission-image-1.jpg";
const missionImage2 = "/images/mission-image-2.jpg";
const missionImage3 = "/images/mission-image-3.jpg";

// Mission-focused images:
// 1. African students in educational setting
// 2. Professional development and mentorship
// 3. International collaboration and opportunities
const SLIDES = [missionImage1, missionImage2, missionImage3];
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animStart, setAnimStart] = useState(false);
  const [isGrowPhase, setIsGrowPhase] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [canStartAnimation, setCanStartAnimation] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const { login, isLoading } = useAuth();

  const images = SLIDES;

  // Preload images and check when at least one is loaded
  useEffect(() => {
    let loadedCount = 0;

    const checkImageLoad = () => {
      loadedCount++;
      if (loadedCount >= 1 && !imagesLoaded) {
        setImagesLoaded(true);
        setTimeout(() => setCanStartAnimation(true), 100);
      }
    };

    images.forEach(src => {
      const img = new Image();
      img.onload = checkImageLoad;
      img.onerror = checkImageLoad;
      img.src = src;
    });
  }, [images, imagesLoaded]);

  // Only start slideshow after images are loaded
  useEffect(() => {
    if (!canStartAnimation) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      setIsGrowPhase((prev) => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length, canStartAnimation]);

  // Restart the animation on each slide change
  useEffect(() => {
    if (!canStartAnimation) return;
    setAnimStart(false);
    const id = requestAnimationFrame(() => setAnimStart(true));
    return () => cancelAnimationFrame(id);
  }, [currentImageIndex, canStartAnimation]);

  const nextIndex = (currentImageIndex + 1) % images.length;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await login({ username: username.trim(), password });
    } catch (error: unknown) {
      console.error('Login failed:', error);

      let errorMessage = "Login failed. Please check your credentials and try again.";

      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setError(errorMessage);
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex relative overflow-hidden">
      {/* Left Side - Animated Background with Geometric Patterns (70% width) */}
      <div
        className="hidden md:flex lg:flex lg:w-[70%] md:w-[60%] relative overflow-hidden"
        style={{ backgroundColor: '#fff' }}
      >
        {/* Background Images with Continuous Growing Animation */}
        {images.map((image, index) => {
          const isActive = index === currentImageIndex;
          const isNext = index === nextIndex;

          const startScale = isGrowPhase ? 1 : 1.15;
          const endScale = isGrowPhase ? 1.15 : 1;
          const nextStartScale = !isGrowPhase ? 1 : 1.15;

          const scale = isActive
            ? (animStart ? endScale : startScale)
            : (isNext ? nextStartScale : 1);

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                transform: `scale(${scale})`,
                transition: 'transform 5000ms linear',
                willChange: 'transform',
                transformOrigin: 'center center'
              }}
            />
          );
        })}

        {/* Geometric Triangle Pattern - Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute border-2"
                style={{
                  width: `${120 + i * 40}px`,
                  height: `${120 + i * 40}px`,
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 2}deg)`,
                  borderColor: '#ff8b19',
                  opacity: 0.6 - (i * 0.04),
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Geometric Pattern - Top Right */}
        <div className="absolute top-0 right-0">
          <div className="relative">
            {[...Array(8)].map((_, i) => (
              <div
                key={`tr-${i}`}
                className="absolute border-2"
                style={{
                  width: `${80 + i * 30}px`,
                  height: `${80 + i * 30}px`,
                  top: `${-40 - i * 15}px`,
                  right: `${-40 - i * 15}px`,
                  transform: `rotate(45deg)`,
                  borderColor: '#ff8b19',
                  opacity: 0.4 - (i * 0.04),
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Logo positioned in top-left */}
        <div className="absolute top-8 left-16 z-20">
          <img src={afriLogo} alt="Afrithrive" className="w-32 opacity-100 drop-shadow-2xl" />
        </div>

        {/* Tagline positioned in bottom-left */}
        <div className="absolute bottom-8 left-16 z-20">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-[#2e328c] drop-shadow-lg mb-2">
              Empowering <span className="text-[#ff8b19]">East African</span> Opportunities
            </h2>
            <p className="text-black drop-shadow-md">Study abroad programs and career pathways</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (30% width) */}
      <div className="w-full lg:w-[30%] md:w-[40%] flex flex-col relative justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${missionImage3})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2f318f]/95 via-[#2f318f]/90 to-[#ff8b19]/90 backdrop-blur-sm" />

        {/* Animated Circles */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#ff8b19]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative px-8 py-12 w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="mb-8 md:hidden flex justify-center">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <img src={afriLogo} alt="Afrithrive" className="w-24" />
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 animate-fade-in">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-block bg-white/10 backdrop-blur-md rounded-full p-4 mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-white/70">Sign in to continue your journey</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-500/20 border-2 border-red-400/50 backdrop-blur-sm animate-shake">
                  <AlertCircle className="h-4 w-4 text-white" />
                  <AlertDescription className="text-sm font-medium text-white">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Username Input */}
              <div className="space-y-2">
                <label className="block text-white/90 text-sm font-semibold ml-1">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl blur-sm group-focus-within:blur-md transition-all" />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70 z-10 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError("");
                    }}
                    className="relative w-full h-12 bg-white/10 backdrop-blur-md border-2 border-white/30 pl-12 pr-4 text-white text-base placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 rounded-xl z-10"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-white/90 text-sm font-semibold ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl blur-sm group-focus-within:blur-md transition-all" />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70 z-10 group-focus-within:text-white transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className="relative w-full h-12 bg-white/10 backdrop-blur-md border-2 border-white/30 pl-12 pr-12 text-white text-base placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all duration-300 rounded-xl z-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-white/80 hover:text-white text-sm transition-colors font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="relative w-full h-13 bg-white hover:bg-white/95 text-[#2f318f] font-bold shadow-2xl hover:shadow-white/20 transition-all duration-300 group rounded-xl overflow-hidden mt-6"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="mr-2 w-5 h-5 border-2 border-[#2f318f]/30 border-t-[#2f318f] rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Sign in
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            {/* Copyright Notice */}
            <div className="text-center pt-6 mt-6 border-t border-white/10">
              <p className="text-xs text-white/50">
                © 2025 Afrithrive. Empowering Opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Screen */}
      {showLoading && <LoadingScreen onComplete={() => setShowLoading(false)} />}
    </div>
  );
};

export default Login;

