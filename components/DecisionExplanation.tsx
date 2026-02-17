"use client";

import { motion, AnimatePresence } from "framer-motion";

interface DecisionExplanationProps {
    debug: {
        mode: string;
        poolSize: number;
        appliedBias?: number;
        decisionTightness: number;
        specificReason?: string;
    };
    isVisible: boolean;
    onClose: () => void;
}

export default function DecisionExplanation({ debug, isVisible, onClose }: DecisionExplanationProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-4 bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 text-sm overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-3">
                        <h4 className="text-brand-green font-bold uppercase tracking-wider text-xs">Selection Insights</h4>
                        <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">Reason</p>
                            <p className="text-gray-200 font-medium">{debug.specificReason || "Natural Weighting"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">Pool Size</p>
                            <p className="text-gray-200 font-medium">{debug.poolSize} candidates</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">Adventurousness</p>
                            <p className="text-gray-200 font-medium">
                                {(100 - (debug.decisionTightness * 100)).toFixed(0)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">Selection Mode</p>
                            <p className="text-gray-200 font-medium">{debug.mode}</p>
                        </div>
                    </div>

                    {debug.appliedBias !== undefined && debug.appliedBias !== 0 && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                            <p className="text-gray-500 text-[10px] uppercase mb-1">Bias Influence</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${debug.appliedBias > 0 ? 'bg-brand-green' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min(Math.abs(debug.appliedBias) * 2, 100)}%` }}
                                    />
                                </div>
                                <span className={`text-[10px] font-mono ${debug.appliedBias > 0 ? 'text-brand-green' : 'text-red-400'}`}>
                                    {debug.appliedBias > 0 ? '+' : ''}{debug.appliedBias.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
