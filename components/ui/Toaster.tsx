"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
    return (
        <SonnerToaster
            position="top-right"
            richColors
            closeButton
            theme="light" // Force light theme or dynamic if needed, but 'system' is default
            toastOptions={{
                style: {
                    background: 'white',
                    color: 'black',
                    border: '1px solid #E2E8F0',
                },
                className: 'class-toast',
            }}
        />
    );
}
