import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
    onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
    const [curtainOpen, setCurtainOpen] = useState(false);

    useEffect(() => {
        const images = [
            '/images/38d68c95-79bc-49f0-9284-d801b425ccf4.png',
            '/images/6a95e55f025ba7a609e845bdadab78db.jpeg',
            '/images/ee4ba61f4a10245e4e25d7f864fc8c9e.jpeg',
            '/images/account_card.png',
            '/images/login_bottom_mobile.jpg',
            '/images/favicon.png'
        ];

        images.forEach((src) => {
            const img = new Image();
            img.src = src;
        });

        const timer = setTimeout(() => {
            setCurtainOpen(true);
            setTimeout(onComplete, 4000); // Wait for curtain animation to complete
        }, 4000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-500 ${curtainOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
            {/* Left Curtain */}
            <div className={`curtain-left ${curtainOpen ? 'curtain-open-left' : ''}`}>
                <div className="absolute inset-0 bg-[#2f318f]">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-y-0 right-0 w-32 opacity-10">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="h-12 border-r-4 border-white/40"
                                style={{ marginTop: `${i * 3}rem` }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Curtain */}
            <div className={`curtain-right ${curtainOpen ? 'curtain-open-right' : ''}`}>
                <div className="absolute inset-0 bg-[#2f318f]">
                    {/* Decorative Pattern */}
                    <div className="absolute inset-y-0 left-0 w-32 opacity-10">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="h-12 border-l-4 border-white/40"
                                style={{ marginTop: `${i * 3}rem` }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Center Content (on top of curtains) */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${curtainOpen ? 'opacity-0' : 'opacity-100'}`}>
                <div className="text-center z-10">
                    {/* Logo with Rings */}
                    <div className="relative mb-8">
                        {/* Outer rotating rings */}
                        <div className="absolute inset-0 w-32 h-32 mx-auto">
                            <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-spin-slow"></div>
                            <div className="absolute inset-2 border-4 border-[hsl(var(--accent))]/40 rounded-full animate-spin-reverse"></div>
                            <div className="absolute inset-4 border-4 border-white/30 rounded-full animate-pulse-gold"></div>
                        </div>

                        {/* Logo */}
                        <div className="relative w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md">
                            <img src="/images/favicon.png" alt="Afrithrive Logo" className="w-20 h-20 animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                    </div>

                    {/* Text with typing effect */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 animate-slide-up tracking-tight">
                        AfriThrive Global Service Ltd
                    </h1>
                    <div className="overflow-hidden">
                        <p className="text-white/80 text-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            Connecting East Africa to global opportunities
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8 w-64 mx-auto">
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full animate-progress"></div>
                        </div>
                    </div>
                </div>

                {/* Floating Particles */}
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="particle-glow"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 15}s`,
                            animationDuration: `${15 + Math.random() * 10}s`,
                            width: `${4 + Math.random() * 8}px`,
                            height: `${4 + Math.random() * 8}px`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

