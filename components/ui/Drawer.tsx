'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    width?: 'sm' | 'md' | 'lg' | 'xl';
}

const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};

export default function Drawer({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    width = 'lg'
}: DrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Focus trap
    useEffect(() => {
        if (isOpen && drawerRef.current) {
            drawerRef.current.focus();
        }
    }, [isOpen]);

    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        } else {
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop with blur */}
            <div
                className={`
                    absolute inset-0 bg-slate-900/60 backdrop-blur-sm
                    ${isOpen ? 'animate-fade-in' : 'animate-fade-out'}
                `}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer Panel */}
            <div className="fixed inset-y-0 right-0 flex max-w-full">
                <div
                    ref={drawerRef}
                    tabIndex={-1}
                    className={`
                        w-screen ${widthClasses[width]} transform-gpu
                        ${isOpen ? 'animate-slide-in-right' : 'animate-slide-out-right'}
                    `}
                >
                    <div className="h-full flex flex-col bg-white dark:bg-slate-900 shadow-2xl">
                        {/* Header */}
                        <div className="relative px-6 py-5 border-b border-slate-200 dark:border-slate-800">
                            {/* Decorative gradient line */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500" />

                            <div className="flex items-start justify-between">
                                <div className="pr-8">
                                    {title && (
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {title}
                                        </h2>
                                    )}
                                    {subtitle && (
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="
                                        absolute top-4 right-4
                                        p-2 rounded-xl
                                        text-slate-400 hover:text-slate-600 dark:hover:text-slate-200
                                        hover:bg-slate-100 dark:hover:bg-slate-800
                                        transition-all duration-200
                                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                                    "
                                    aria-label="Close drawer"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

