import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Check, Layers, ChevronDown, FolderTree } from 'lucide-react';
import { AssetClassification } from '../../types';
import { RAW_TAXONOMY, INITIAL_STRUCTURES_DATA } from '../../data/assetTaxonomyData';

interface SearchableTaxonomyPickerProps {
  classificationsList?: AssetClassification[];
  mode: 'category' | 'subcategory' | 'type';
  selectedId: string;
  onSelect: (item: { id: string; name: string; parentId?: string; parentName?: string } | null) => void;
  filterParentId?: string;
  error?: boolean;
  placeholder?: string;
}

export const SearchableTaxonomyPicker: React.FC<SearchableTaxonomyPickerProps> = ({
  classificationsList = [],
  mode,
  selectedId,
  onSelect,
  filterParentId,
  error = false,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
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

  // Compute all available items for the current mode
  const allItems = useMemo(() => {
    const activeClassList = (classificationsList && classificationsList.length > 0)
      ? classificationsList
      : INITIAL_STRUCTURES_DATA;

    let list: Array<{ id: string; name: string; parentId?: string; parentName?: string; path?: string }> = [];

    if (mode === 'category') {
      const fromClass = activeClassList.filter(
        (c) => (c.level === 'Category' || !c.parentId || c.id?.startsWith('cat-')) && c.isActive !== false
      );
      if (fromClass.length > 0) {
        list = fromClass.map((c) => ({
          id: c.id,
          name: c.name,
          path: c.name,
        }));
      } else {
        list = (RAW_TAXONOMY || []).map((cat, idx) => ({
          id: `cat-${idx + 1}`,
          name: cat.name,
          path: cat.name,
        }));
      }
    } else if (mode === 'subcategory') {
      const fromClass = activeClassList.filter(
        (c) =>
          (c.level === 'Subcategory' ||
            (c.parentId && c.parentId.startsWith('cat-') && !c.isLeaf) ||
            c.id?.startsWith('sub-')) &&
          c.isActive !== false
      );
      if (fromClass.length > 0) {
        list = fromClass.map((c) => ({
          id: c.id,
          name: c.name,
          parentId: c.parentId,
          parentName: c.parentName,
          path: c.path || `${c.parentName || 'دسته'} > ${c.name}`,
        }));
      } else {
        (RAW_TAXONOMY || []).forEach((cat, catIdx) => {
          (cat.subcategories || []).forEach((sub, subIdx) => {
            list.push({
              id: `sub-${catIdx + 1}-${subIdx + 1}`,
              name: sub.name,
              parentId: `cat-${catIdx + 1}`,
              parentName: cat.name,
              path: `${cat.name} > ${sub.name}`,
            });
          });
        });
      }

      if (filterParentId) {
        list = list.filter((item) => item.parentId === filterParentId);
      }
    } else if (mode === 'type') {
      const fromClass = activeClassList.filter(
        (c) =>
          (c.level === 'Type' ||
            c.isLeaf ||
            (c.parentId && c.parentId.startsWith('sub-')) ||
            c.id?.startsWith('type-')) &&
          c.isActive !== false
      );
      if (fromClass.length > 0) {
        list = fromClass.map((c) => ({
          id: c.id,
          name: c.name,
          parentId: c.parentId,
          parentName: c.parentName,
          path: c.path || `${c.parentName || 'زیردسته'} > ${c.name}`,
        }));
      } else {
        (RAW_TAXONOMY || []).forEach((cat, catIdx) => {
          (cat.subcategories || []).forEach((sub, subIdx) => {
            (sub.types || []).forEach((typ, typIdx) => {
              list.push({
                id: `type-${catIdx + 1}-${subIdx + 1}-${typIdx + 1}`,
                name: typ,
                parentId: `sub-${catIdx + 1}-${subIdx + 1}`,
                parentName: sub.name,
                path: `${cat.name} > ${sub.name} > ${typ}`,
              });
            });
          });
        });
      }

      if (filterParentId) {
        list = list.filter((item) => item.parentId === filterParentId);
      }
    }

    return list;
  }, [classificationsList, mode, filterParentId]);

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return (
      allItems.find(
        (it) =>
          it.id === selectedId ||
          it.name.toLowerCase() === selectedId.toLowerCase() ||
          it.name === selectedId
      ) || null
    );
  }, [allItems, selectedId]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return allItems;
    }
    const q = searchQuery.toLowerCase().trim();
    return allItems.filter((it) => {
      return (
        it.name.toLowerCase().includes(q) ||
        (it.path && it.path.toLowerCase().includes(q)) ||
        (it.parentName && it.parentName.toLowerCase().includes(q))
      );
    });
  }, [allItems, searchQuery]);

  const defaultPlaceholder =
    placeholder ||
    (mode === 'category'
      ? 'انتخاب یا جستجوی دسته کل...'
      : mode === 'subcategory'
      ? 'انتخاب یا جستجوی زیردسته...'
      : 'انتخاب یا جستجوی نوع تجهیز (Type)...');

  return (
    <div ref={containerRef} className="relative w-full space-y-1 text-right dir-rtl">
      {/* Selected Item View / Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border bg-white cursor-pointer transition-all ${
          error
            ? 'border-rose-400 ring-2 ring-rose-100 bg-rose-50/20'
            : 'border-slate-300 hover:border-indigo-400 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FolderTree className="w-4 h-4 text-indigo-600 shrink-0" />
          {selectedItem ? (
            <div className="min-w-0">
              <span className="text-xs font-black text-slate-800 truncate block">
                {selectedItem.name}
              </span>
              {selectedItem.path && selectedItem.path !== selectedItem.name && (
                <span className="text-[10px] text-slate-400 truncate block">
                  {selectedItem.path}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-medium truncate">
              {defaultPlaceholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedItem && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
              }}
              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-rose-500 rounded-md cursor-pointer"
              title="پاک کردن"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-100 max-h-72 flex flex-col">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`جستجو در بین ${allItems.length} مورد...`}
              className="w-full pl-8 pr-9 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
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

          {/* List of items */}
          <div className="overflow-y-auto flex-1 space-y-1 divide-y divide-slate-100 max-h-48 pr-0.5">
            {filteredItems.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                موردی یافت نشد.
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected =
                  selectedItem?.id === item.id || selectedItem?.name === item.name;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{item.name}</div>
                      {item.path && item.path !== item.name && (
                        <div className="text-[10px] text-slate-400 truncate">{item.path}</div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
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
