import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, MoreHorizontal, Check } from 'lucide-react';

export interface ResponsiveToolbarItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ElementType;
  badge?: string | number | null;
  badgeColor?: string;
  hidden?: boolean;
}

interface ResponsiveToolbarProps<T extends string = string> {
  items: ResponsiveToolbarItem<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  /** Custom active tab class if not default blue */
  activeClassName?: string;
  /** Custom inactive tab class */
  inactiveClassName?: string;
  /** Prefix element e.g. label or icon */
  prefix?: React.ReactNode;
  /** Container class */
  className?: string;
  id?: string;
}

export function ResponsiveToolbar<T extends string = string>({
  items,
  activeId,
  onSelect,
  activeClassName = 'bg-blue-600 text-white shadow-sm',
  inactiveClassName = 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900',
  prefix,
  className = '',
  id = 'responsive-toolbar',
}: ResponsiveToolbarProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const visibleItems = items.filter((item) => !item.hidden);

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollWidth, clientWidth, scrollLeft } = el;
    const isScrollable = scrollWidth > clientWidth + 4;

    if (!isScrollable) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    // In RTL, scrollLeft can be 0 at rightmost, and negative or positive depending on browser engine.
    // Standard modern browsers with dir="rtl":
    // scrollLeft is 0 at initial right, and scrolls negative to left (up to -(scrollWidth - clientWidth))
    // Or in some WebKit versions, scrollLeft is 0 to (scrollWidth - clientWidth).
    const maxScroll = scrollWidth - clientWidth;
    const absScroll = Math.abs(scrollLeft);

    // If absScroll is near 0, we are at the right edge (start in RTL)
    // If absScroll is near maxScroll, we are at the left edge (end in RTL)
    const atRightEdge = absScroll <= 5;
    const atLeftEdge = absScroll >= maxScroll - 5;

    // In RTL:
    // "Right" is the start -> can scroll right if not at right edge
    // "Left" is the end -> can scroll left if not at left edge
    setCanScrollRight(!atRightEdge);
    setCanScrollLeft(!atLeftEdge);
  }, []);

  useEffect(() => {
    checkScrollability();
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      checkScrollability();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollability);

    // Also use ResizeObserver for container resizing
    const resizeObserver = new ResizeObserver(() => {
      checkScrollability();
    });
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollability);
      resizeObserver.disconnect();
    };
  }, [checkScrollability, visibleItems.length]);

  // Scroll active item into view smoothly on initial render or when activeId changes
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const activeBtn = el.querySelector(`[data-tab-id="${activeId}"]`) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeId]);

  // Scroll handlers
  const scrollInDirection = (direction: 'right' | 'left') => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollAmount = 240;
    // In RTL:
    // scrolling right moves towards 0 (or + if scrollLeft is negative)
    // scrolling left moves away from 0 towards max scroll
    const isNegativeRtl = el.scrollLeft <= 0;
    
    if (direction === 'right') {
      if (isNegativeRtl) {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (isNegativeRtl) {
        el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Convert vertical mouse wheel into horizontal scroll on toolbar
  const handleWheel = (e: React.WheelEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
      el.scrollLeft += e.deltaY;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  const activeItem = visibleItems.find((item) => item.id === activeId);

  return (
    <div
      id={id}
      className={`relative flex items-center bg-slate-100 border-b border-slate-200/90 px-3 sm:px-4 py-2 shrink-0 select-none ${className}`}
      dir="rtl"
    >
      {prefix && <div className="shrink-0 pl-2">{prefix}</div>}

      {/* Right Scroll Arrow (Scroll to Start in RTL) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollInDirection('right')}
          className="shrink-0 w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200/90 flex items-center justify-center transition-all z-10 mr-1 cursor-pointer active:scale-95"
          title="مشاهده گزینه‌های قبلی"
          aria-label="گزینه‌های قبلی"
        >
          <ChevronRight className="w-4 h-4 text-slate-700" />
        </button>
      )}

      {/* Right Edge Fade Indicator */}
      {canScrollRight && (
        <div className="absolute right-3 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 to-transparent pointer-events-none z-[5]" />
      )}

      {/* Scrollable Tabs Track */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex-1 flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5 scroll-smooth scrollbar-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeId;
          return (
            <button
              type="button"
              key={item.id}
              data-tab-id={item.id}
              onClick={() => onSelect(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.98] ${
                isActive ? activeClassName : inactiveClassName
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none shrink-0 ${
                    item.badgeColor ||
                    (isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Left Edge Fade Indicator */}
      {canScrollLeft && (
        <div className="absolute left-12 sm:left-14 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-100 to-transparent pointer-events-none z-[5]" />
      )}

      {/* Left Scroll Arrow (Scroll to End in RTL) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollInDirection('left')}
          className="shrink-0 w-8 h-8 rounded-xl bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200/90 flex items-center justify-center transition-all z-10 ml-1 cursor-pointer active:scale-95"
          title="مشاهده گزینه‌های بعدی"
          aria-label="گزینه‌های بعدی"
        >
          <ChevronLeft className="w-4 h-4 text-slate-700" />
        </button>
      )}

      {/* Quick Jump / All Items Dropdown Menu */}
      <div ref={moreMenuRef} className="relative shrink-0 mr-1 z-20">
        <button
          type="button"
          onClick={() => setIsMoreMenuOpen((prev) => !prev)}
          className={`h-8 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isMoreMenuOpen
              ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs'
          }`}
          title="فهرست کامل بخش‌ها"
          aria-expanded={isMoreMenuOpen}
        >
          <MoreHorizontal className="w-4 h-4 shrink-0" />
          <span className="hidden md:inline text-[11px]">همه بخش‌ها</span>
        </button>

        {isMoreMenuOpen && (
          <div
            className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-right dir-rtl"
            role="menu"
          >
            <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
              <span>انتقال سریع به بخش</span>
              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                {visibleItems.length} بخش
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1 py-0.5">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeId;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      onSelect(item.id);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between text-right cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-extrabold border border-blue-200/60'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {Icon && (
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-blue-600' : 'text-slate-500'
                          }`}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge !== undefined && item.badge !== null && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                            item.badgeColor ||
                            (isActive
                              ? 'bg-blue-200/80 text-blue-800'
                              : 'bg-slate-100 text-slate-600')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
