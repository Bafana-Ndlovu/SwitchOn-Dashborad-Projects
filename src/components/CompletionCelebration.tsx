import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface CompletionCelebrationProps {
    trigger: boolean;
    projectId: string;
}

export function CompletionCelebration({
    trigger,
    projectId,
}: CompletionCelebrationProps) {
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() =>{
        if (!trigger) return;
        
        const key = `celebrated-${projectId}`;

        if (sessionStorage.getItem(key)) return;

        sessionStorage.setItem(key, "true");

        confetti({
            particleCount:180,
            spread: 90,
            origin: { y: 0.6 },

        });

        setShowMessage(true);

        const timer = setTimeout(() => {
            setShowMessage(false);
            
        }, 4000);

        return () => clearTimeout(timer);
    }, [trigger, projectId]);

    if (!showMessage) return null;

    return (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-center shadow-sm dark:border-green-700 dark:bg-green-900/20">
            <h3 className="text-lg font-bold text-green-700 dark:text-green-300">
                🎉 Project Completed!
            </h3>

            <p className="mt-2 text-sm text-green-700 dark:text-green-200">
                Congratulations! Every task for this project has been completed.

            </p>

        </div>
    );
}