import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: 'green' | 'purple' | 'orange' | 'blue' | 'emerald';
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
};

const colors = {
    green: {
        border: 'border-green-400',
        bg: 'bg-green-50',
        text: 'text-green-600',
        action: 'text-green-600 hover:text-green-800',
    },
    purple: {
        border: 'border-purple-400',
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        action: 'text-purple-600 hover:text-purple-800',
    },
    orange: {
        border: 'border-orange-400',
        bg: 'bg-orange-50',
        text: 'text-orange-500',
        action: 'text-orange-500 hover:text-orange-700',
    },
    blue: {
        border: 'border-blue-400',
        bg: 'bg-blue-50',
        text: 'text-blue-500',
        action: 'text-blue-500 hover:text-blue-700',
    },
    emerald: {
        border: 'border-emerald-400',
        bg: 'bg-emerald-50',
        text: 'text-emerald-500',
        action: 'text-emerald-600 hover:text-emerald-800',
    },
};

export default function StatCard({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
    actionLabel,
    onAction,
}: StatCardProps) {

    const style = colors[color];

    return (
        <div
            className={`
                bg-white rounded-xl shadow-sm border-l-4
                ${style.border}
                p-5 flex items-center gap-4
                hover:-translate-y-0.5 hover:shadow-md
                transition-all duration-200
            `}
        >
            <div className={`${style.bg} p-3 rounded-xl shrink-0`}>
                <Icon className={`w-6 h-6 ${style.text}`} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    {title}
                </p>

                <div className="flex items-center justify-between mt-1 gap-3">
                    <p className="text-3xl font-bold text-gray-800 tabular-nums">
                        {value}
                    </p>

                    {actionLabel && onAction && (
                        <button
                            onClick={onAction}
                            className={`text-xs transition-colors cursor-pointer whitespace-nowrap ${style.action}`}
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>

                {subtitle && (
                    <p className="text-xs text-gray-400 mt-1 truncate">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}