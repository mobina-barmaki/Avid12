import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Check, Stethoscope, Building2, Tag, ChevronDown } from 'lucide-react';
import { EquipmentItem } from '../../types';

interface SearchableEquipmentPickerProps {
  equipmentList?: EquipmentItem[];
  selectedEquipmentId: string;
  onSelectEquipment: (equipment: EquipmentItem | null) => void;
  error?: boolean;
}

export const SearchableEquipmentPicker: React.FC<SearchableEquipmentPickerProps> = ({
  equipmentList = [],
  selectedEquipmentId,
  onSelectEquipment,
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const safeEquipmentList = equipmentList || [];

  const selectedEquipment = useMemo(() => {
    return safeEquipmentList.find((eq) => eq && eq.id === selectedEquipmentId) || null;
  }, [safeEquipmentList, selectedEquipmentId]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredEquipment = useMemo(() => {
    if (!searchQuery.trim()) {
      return safeEquipmentList;
    }
    const q = searchQuery.toLowerCase().trim();
    return safeEquipmentList.filter((eq) => {
      if (!eq) return false;
      return (
        eq.faName?.toLowerCase().includes(q) ||
        eq.enName?.toLowerCase().includes(q) ||
        eq.code?.toLowerCase().includes(q) ||
        eq.department?.toLowerCase().includes(q) ||
        eq.brand?.toLowerCase().includes(q) ||
        eq.model?.toLowerCase().includes(q) ||
        eq.serialNumber?.toLowerCase().includes(q) ||
        eq.type?.toLowerCase().includes(q) ||
        eq.category?.toLowerCase().includes(q) ||
        eq.subcategory?.toLowerCase().includes(q)
      );
    });
  }, [safeEquipmentList, searchQuery]);

  return (
    <div ref={containerRef} className="relative w-full space-y-1 text-right dir-rtl">
      {/* Selected Equipment Card View */}
      {selectedEquipment ? (
        <div
          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
            error
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-100'
              : 'bg-indigo-50/70 border-indigo-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-900">
                  {selectedEquipment.code}
                </span>
                <span className="text-xs font-black text-slate-900 truncate">
                  {selectedEquipment.faName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  {selectedEquipment.department}
                </span>
                {(selectedEquipment.brand || selectedEquipment.model) && (
                  <span>
                    • {selectedEquipment.brand} {selectedEquipment.model}
                  </span>
                )}
                {selectedEquipment.type && (
                  <span className="text-indigo-700 bg-white/80 px-1.5 py-0.2 rounded border border-indigo-100 font-medium">
                    {selectedEquipment.type}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 mr-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setSearchQuery('');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
            >
              تغییر انتخاب
            </button>
            <button
              type="button"
              onClick={() => onSelectEquipment(null)}
              className="p-1.5 rounded-xl hover:bg-rose-100 text-rose-500 transition-colors cursor-pointer"
              title="حذف انتخاب"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty / Dropdown Trigger Box */
        <div
          onClick={() => setIsOpen(true)}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border bg-white cursor-pointer transition-all ${
            error
              ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20'
              : 'border-slate-300 hover:border-sky-400 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Search className="w-4 h-4 text-sky-600 shrink-0" />
            <span>برای جستجو و انتخاب تجهیز کلیک کنید (نام، پلاک اموال، بخش، برند)...</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      )}

      {/* Floating Searchable Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-100 max-h-80 flex flex-col">
          {/* Live Search Input Bar */}
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی سریع تجهیز (مثال: ونتیلاتور، ICU، Dräger، 1001)..."
              className="w-full pl-8 pr-9 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results Summary Counter */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
            <span>تعداد نتایج: {filteredEquipment.length} تجهیز</span>
            {searchQuery && <span>فیلتر فعال</span>}
          </div>

          {/* Results List */}
          <div className="overflow-y-auto flex-1 space-y-1 divide-y divide-slate-100 max-h-56 pr-0.5">
            {filteredEquipment.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 space-y-1">
                <p className="font-bold text-slate-600">تجهیزی مطابق با عبارت جستجو یافت نشد.</p>
                <p className="text-[11px]">کد پلاک اموال یا عنوان تجهیز دیگری را امتحان فرمایید.</p>
              </div>
            ) : (
              filteredEquipment.map((eq) => {
                const isSelected = eq.id === selectedEquipmentId;
                return (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => {
                      onSelectEquipment(eq);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {eq.code}
                        </span>
                        <span className="font-bold text-slate-900 truncate">{eq.faName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                        <span>بخش: <strong className="text-slate-700">{eq.department}</strong></span>
                        {(eq.brand || eq.model) && (
                          <span>| {eq.brand} {eq.model}</span>
                        )}
                        {eq.type && (
                          <span className="text-indigo-600 font-medium">({eq.type})</span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
