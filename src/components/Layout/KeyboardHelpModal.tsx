'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Keyboard } from 'lucide-react';

interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardHelpModal({ isOpen, onClose }: KeyboardHelpModalProps) {
  const shortcuts = [
    { key: '↑ / ↓', desc: 'Navigate up and down rows in the stock screener grid' },
    { key: 'Enter', desc: 'Select focused stock and open real-time technical chart' },
    { key: 'Space', desc: 'Add / remove focused stock from your Watchlist' },
    { key: 'Home / End', desc: 'Jump instantly to first / last stock in universe' },
    { key: 'PageUp / PageDn', desc: 'Scroll viewport by one page (15 rows)' },
    { key: 'Ctrl + K  or  /', desc: 'Open Command Palette & instant symbol search' },
    { key: 'F', desc: 'Toggle Filter Panel sidebar (collapse/expand)' },
    { key: 'C', desc: 'Toggle Technical Chart split pane' },
    { key: '?', desc: 'Open this Keyboard Shortcuts cheat sheet' },
    { key: 'Esc', desc: 'Close any active modal, palette, or menu' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts Cheat Sheet"
      description="EquityPulse Bloomberg-style keyboard-first navigation"
      maxWidth="lg"
    >
      <div className="space-y-2">
        {shortcuts.map((s) => (
          <div
            key={s.key}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
          >
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              {s.desc}
            </span>
            <kbd className="px-2 py-1 text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-xs">
              {s.key}
            </kbd>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-[11px] text-gray-400">
          Tip: Traders use keyboard shortcuts to scan thousands of stocks without touching the mouse.
        </p>
      </div>
    </Modal>
  );
}
