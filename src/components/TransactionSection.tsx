/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Tag, ArrowLeft } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionSectionProps {
  transactions: Transaction[];
  onBack?: () => void;
}

export default function TransactionSection({ transactions, onBack }: TransactionSectionProps) {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw' | 'loan_repay'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatBDT = (amount: number) => {
    return `৳ ${amount.toLocaleString('bn-BD')}`;
  };

  const toBanglaDigits = (num: number | string) => {
    const banglaNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (x) => banglaNumbers[parseInt(x)]);
  };

  // Filter lists based on type and search query
  const filteredList = transactions.filter((tx) => {
    const matchesFilter = filter === 'all' ? true : tx.type === filter;
    const matchesSearch =
      tx.titleBangla.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#0a0a09] text-zinc-300 select-none overflow-y-auto no-scrollbar pb-6 font-sans">
      {/* Upper header with Back button */}
      <div className="bg-zinc-950 px-5 py-4 flex items-center gap-3 sticky top-0 border-b border-zinc-900 z-10 shadow-xs mb-4">
        {onBack && (
          <button
            onClick={onBack}
            id="btn-tx-back"
            className="p-1 px-1.5 rounded-lg bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h3 className="text-base font-bold font-serif italic text-white font-medium">লেনদেন ইতিহাস</h3>
          <p className="text-[10px] text-zinc-550 font-sans mt-0.5">আপনার সঞ্চয় জমা, উত্তোলন ও ঋণের কিস্তির হিসাব</p>
        </div>
      </div>

      <div className="px-5 flex flex-col flex-grow">
        {/* Dynamic Search inputs bars */}
      <div className="relative flex items-center mb-4">
        <Search className="absolute left-3.5 w-4 h-4 text-zinc-600" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="লেনদেন আইডি বা ধরণ খুজুন..."
          className="w-full bg-[#111113] border border-zinc-850/80 focus:border-[#c5a059]/40 rounded-xl py-2.5 pl-10 pr-4 text-xs font-sans text-white focus:outline-none transition-all shadow-3xs placeholder-zinc-650"
        />
      </div>

      {/* Screen 13 filter tabs */}
      <div className="bg-[#111113] p-1 rounded-xl border border-zinc-850/80 shadow-3xs flex gap-1 mb-4 font-sans">
        {[
          { id: 'all', label: 'সব' },
          { id: 'deposit', label: 'জমা' },
          { id: 'withdraw', label: 'উত্তোলন' },
          { id: 'loan_repay', label: 'ঋণ পেমেন্ট' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex-1 py-1.5 text-center text-xs font-extrabold rounded-lg transition-colors cursor-pointer ${filter === tab.id ? 'bg-[#c5a059] text-[#0a0a09]' : 'text-zinc-500 hover:text-zinc-350 hover:bg-zinc-900/40'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render Lists */}
      <div className="flex flex-col gap-2.5">
        {filteredList.length === 0 ? (
          <div className="bg-[#111113] p-8 rounded-2xl border border-zinc-850/85 text-center flex flex-col items-center">
            <Tag className="w-8 h-8 text-zinc-750 mb-2" />
            <p className="text-xs text-zinc-500 font-sans">কোনো লেনদেন রেকর্ড খুঁজে পাওয়া যায়নি।</p>
          </div>
        ) : (
          filteredList.map((tx) => {
            const isAddValue = tx.type === 'deposit' || tx.type === 'loan_disburse';
            return (
              <div
                key={tx.id}
                className="bg-[#111113] p-3.5 rounded-2xl border border-zinc-850/80 shadow-3xs flex items-center justify-between transition-transform duration-300 hover:translate-x-0.5 hover:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${isAddValue ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/25' : 'bg-rose-950/20 text-rose-450 border border-rose-900/25'}`}
                  >
                    {isAddValue ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <h5 className="text-[11.5px] font-bold text-zinc-200 font-sans">{tx.titleBangla}</h5>
                    <p className="text-[9.5px] text-zinc-500 font-sans mt-0.5">আইডি: {tx.id} • {toBanglaDigits(tx.date)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-xs font-bold font-sans ${isAddValue ? 'text-emerald-400' : 'text-rose-450'}`}>
                    {isAddValue ? '+' : '-'} {formatBDT(tx.amount)}
                  </p>
                  <span className="text-[7.5px] uppercase tracking-wider text-emerald-400 font-extrabold bg-emerald-950/40 border border-emerald-900/40 rounded-md px-1.5 py-0.5 mt-1 inline-block">
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </div>
  );
}
