"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TUTORIAL_STEPS, TutorialStep } from './tutorialData';
import Logo from '@/components/Logo';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, X, RotateCcw, CheckCircle } from 'lucide-react';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TutorialOverlayProps {
  onClose?: () => void;
  initialStep?: number;
  onStepChange?: (stepIndex: number) => void;
}

export default function TutorialOverlay({ onClose, initialStep = 0, onStepChange }: TutorialOverlayProps = {}) {
  // Step 0: Welcome Screen; Steps 1..6: Active Steps; Step 7: Completion Screen
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(initialStep);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const totalSteps = TUTORIAL_STEPS.length;
  const activeStep: TutorialStep | undefined = TUTORIAL_STEPS[currentStepIndex - 1];

  const updateTargetRect = useCallback(() => {
    if (!activeStep || !activeStep.targetId) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(`[data-tutorial="${activeStep.targetId}"]`);
    if (el && el instanceof HTMLElement) {
      const rect = el.getBoundingClientRect();
      // Verify element is rendered & has non-zero size
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        return;
      }
    }
    // Fallback if target element is missing/hidden
    setTargetRect(null);
  }, [activeStep]);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStepIndex);
    }
    updateTargetRect();

    const handleResizeOrScroll = () => {
      updateTargetRect();
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [currentStepIndex, updateTargetRect, onStepChange]);

  const handleNext = () => {
    if (currentStepIndex < totalSteps) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Move to completion screen
      setCurrentStepIndex(totalSteps + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 1) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (onClose) {
      onClose();
    } else {
      setCurrentStepIndex(totalSteps + 1);
    }
  };

  const handleReplay = () => {
    setCurrentStepIndex(initialStep > 0 ? initialStep : 1);
  };

  // ── 1. WELCOME SCREEN (Step 0) ──────────────────────────────────────────
  if (currentStepIndex === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <Card className="max-w-lg w-full p-8 text-center border border-[#d4af37]/40 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
          <div className="flex flex-col items-center">
            <Logo size="md" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-extrabold text-[#d4af37] mt-4 font-mono">
              Modern Mint Strategy Co.
            </span>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white mt-2">
              Commander Tutorial
            </h1>
            <div className="w-16 h-1 bg-[#d4af37] my-4 rounded-full"></div>
            
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Welcome to Modern Mint. Let's learn how to play the game step by step.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Button onClick={() => setCurrentStepIndex(1)} size="md" className="flex-1">
                Start Tutorial
              </Button>
              {onClose ? (
                <Button onClick={onClose} variant="secondary" size="md" className="flex-1">
                  Return to Game
                </Button>
              ) : (
                <Link href="/menu" className="flex-1">
                  <Button variant="secondary" size="md" fullWidth>
                    Skip to Menu
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── 2. COMPLETION SCREEN (Step totalSteps + 1) ─────────────────────────
  if (currentStepIndex > totalSteps) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
        <Card className="max-w-md w-full p-8 text-center border border-[#FFE885]/50 shadow-[0_0_60px_rgba(255,232,133,0.3)]">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFE885] via-[#d4af37] to-[#8a6818] flex items-center justify-center text-black mb-4 shadow-lg animate-bounce">
              <CheckCircle size={36} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-wider text-white mb-1">
              Tutorial Completed!
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-bold mb-4 font-mono">
              Academy Certification Unlocked
            </span>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              You have completed the Modern Mint beginner tutorial! In a real game, players finish their Phase 1 decisions and use LOCK THE DEAL only when they are ready to end the fundraising phase. Do not press it during this tutorial. Close the tutorial when you are ready to play normally.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <Button onClick={handleReplay} size="md" fullWidth className="flex items-center justify-center gap-2">
                <RotateCcw size={16} /> Replay Tutorial
              </Button>
              {onClose ? (
                <Button onClick={onClose} variant="secondary" size="md" fullWidth>
                  Return to Game
                </Button>
              ) : (
                <Link href="/menu" className="w-full">
                  <Button variant="secondary" size="md" fullWidth>
                    Return to Main Menu
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ── 3. INTERACTIVE STEPS (Steps 1..25) ─────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto overflow-hidden">
      
      {/* Target Highlight Box (Golden Glow Spotlight with Cutout Mask) */}
      {targetRect ? (
        <div
          className="fixed z-[101] rounded-xl border-2 border-[#FFE885] pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212,175,55,0.8), inset 0 0 10px rgba(212,175,55,0.4)',
          }}
        />
      ) : (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-[2px] transition-opacity duration-300" />
      )}

      {/* Instruction Box Panel */}
      <div className="fixed inset-0 z-[102] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
          <Card className="p-6 border border-[#d4af37]/60 shadow-[0_10px_40px_rgba(0,0,0,0.9)] bg-black/95">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#FFE885] border border-[#d4af37]/40 font-mono">
                  {activeStep?.chapterTitle || `Chapter ${activeStep?.chapterNumber || 1}`}
                </span>
                {activeStep?.rulebookPage && (
                  <span className="text-[9px] font-bold text-[#d4af37] bg-white/5 px-2 py-0.5 rounded border border-[#d4af37]/30 font-mono">
                    {activeStep.rulebookPage}
                  </span>
                )}
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors text-xs flex items-center gap-1 uppercase tracking-wider font-bold"
              >
                Skip <X size={14} />
              </button>
            </div>

            <div className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider mb-2 font-mono">
              Step {currentStepIndex} of {totalSteps}
            </div>

            <h3 className="text-lg font-black uppercase tracking-wide text-white mb-2">
              {activeStep?.title}
            </h3>

            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              {activeStep?.description}
            </p>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-br from-[#FFE885] via-[#d4af37] to-[#8a6818] text-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
              >
                {currentStepIndex === totalSteps ? 'Finish' : 'Next'} <ChevronRight size={16} />
              </button>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
}
