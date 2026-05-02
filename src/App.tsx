import { useState } from 'react';
import { 
  Calculator, 
  Trash2, 
  LogOut, 
  Coins,
  History,
  Languages,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  RefreshCw,
  Copy,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryItem {
  id: string;
  type: string;
  weight: string;
  ouncePrice: string;
  commission: string;
  laborPerGram: string;
  profit: string;
  karat: string;
  money: string;
  price: number;
  operation: 'SELL' | 'BUY';
  time: string;
  icon: string;
  metal: 'GOLD' | 'SILVER';
  unit: 'CURRENCY' | 'WEIGHT';
  pricingMode: 'RETAIL' | 'WHOLESALE';
}

interface PriceResponse {
  price: number;
}

export default function App() {
  const [pricingMode, setPricingMode] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [metal, setMetal] = useState<'GOLD' | 'SILVER'>('GOLD');
  const [operation, setOperation] = useState<'SELL' | 'BUY'>('SELL');
  const [itemType, setItemType] = useState('Custom');
  const [karat, setKarat] = useState('21');
  const [ouncePrice, setOuncePrice] = useState('');
  const [weight, setWeight] = useState('');
  const [money, setMoney] = useState('');
  const [commission, setCommission] = useState('');
  const [laborPerGram, setLaborPerGram] = useState('');
  const [profit, setProfit] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [resultUnit, setResultUnit] = useState<'CURRENCY' | 'WEIGHT'>('CURRENCY');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  // Translations
  const t = {
    title: lang === 'ar' ? 'حاسبة الذهب والفضة' : 'Gold & Silver Calc',
    itemType: lang === 'ar' ? 'نوع القطعة' : 'Item Type',
    karat: lang === 'ar' ? 'العيار' : 'Karat',
    ouncePrice: lang === 'ar' ? 'سعر الأونصة' : 'Ounce Price',
    weight: lang === 'ar' ? 'الوزن (غ)' : 'Weight (g)',
    commission: lang === 'ar' ? 'العمولة' : 'Commission',
    laborPerGram: lang === 'ar' ? 'اجور المشغول' : 'Labor/Gram',
    labor: lang === 'ar' ? 'اجور القطعة' : 'Piece Labor',
    calculate: lang === 'ar' ? 'احسب النتيجة' : 'Calculate Result',
    clear: lang === 'ar' ? 'مسح الخانات' : 'Clear Form',
    history: lang === 'ar' ? 'سجل العمليات (اضغط للمراجعة)' : 'History (Click to reload)',
    clearHistory: lang === 'ar' ? 'مسح السجل' : 'Clear History',
    gold: lang === 'ar' ? 'ذهب' : 'Gold',
    silver: lang === 'ar' ? 'فضة' : 'Silver',
    sell: lang === 'ar' ? 'مبيع' : 'Sell',
    buy: lang === 'ar' ? 'شراء' : 'Buy',
    retail: lang === 'ar' ? 'مفرق' : 'Retail',
    wholesale: lang === 'ar' ? 'جملة' : 'Wholesale',
    money: lang === 'ar' ? 'المبلغ' : 'Money',
    currency: '$',
    gram: lang === 'ar' ? 'غ' : 'g',
    refresh: lang === 'ar' ? 'تحديث' : 'Refresh',
    copied: lang === 'ar' ? 'تم النسخ!' : 'Copied!',
    copyResult: lang === 'ar' ? 'نسخ' : 'Copy',
    shareWhatsApp: lang === 'ar' ? 'واتساب' : 'WhatsApp',
  };

  const getFineness = (k: string, isSell: boolean) => {
    // User specific rules for Sell/Buy fineness (decimal values)
    if (k === '21') return isSell ? 0.875 : 0.865;
    if (k === '22') return isSell ? 0.915 : 0.905;
    if (k === '18') return isSell ? 0.750 : 0.740;
    
    const predefined: Record<string, number> = {
      '24': 1.0,
      '999': 0.999,
      '925': 0.925,
      '800': 0.800,
    };
    
    if (predefined[k]) return predefined[k];
    
    const val = parseFloat(k);
    if (isNaN(val)) return metal === 'GOLD' ? 0.875 : 0.925;
    
    // If it's a value like 875, convert to 0.875
    return val > 1.5 ? val / 1000 : val;
  };

  const handleCalculate = () => {
    const o = parseFloat(ouncePrice) || 0;
    const w = parseFloat(weight) || 0;
    const c = parseFloat(commission) || 0;
    const lpG = parseFloat(laborPerGram) || 0;
    const lpP = parseFloat(profit) || 0;
    const m = parseFloat(money) || 0;
    const isSell = operation === 'SELL';

    let finalPrice = 0;
    let unit: 'CURRENCY' | 'WEIGHT' = 'CURRENCY';

    if (pricingMode === 'RETAIL') {
      // Logic based strictly on the Spreadsheet image provided
      switch (itemType) {
        case 'Lira':
          finalPrice = ((o + c) * 32 * 875 / 995 / 1000 * 8) + (lpG * 8) + lpP;
          break;
        case 'Half Lira':
          finalPrice = ((o + c) * 32 * 875 / 995 / 1000 * 4) + (lpG * 4) + lpP;
          break;
        case 'Quarter Lira':
          finalPrice = ((o + c) * 32 * 875 / 995 / 1000 * 2) + (lpG * 2) + lpP;
          break;
        case 'Remleh':
          if (isSell) {
            finalPrice = (o + c) * 32 * w + (lpG * w) + lpP;
          } else {
            finalPrice = (o - c) * 31.99 * w;
          }
          break;
        case 'Swiss Ounce':
          finalPrice = isSell ? (o + c + (lpG * 31.1) + lpP) : (o - c);
          break;
        case 'Silver Lira':
          finalPrice = ((o + c) * 32.15 * 8 / 1000) + (lpG * 8) + lpP;
          break;
        case 'Silver Ounce':
          finalPrice = (o + c + (lpG * 31.1) + lpP);
          break;
        case 'Kasser 21':
          if (isSell) {
            finalPrice = (o + c) * 32 * 0.875 * w / 1000 + (lpG * w) + lpP;
          } else {
            finalPrice = (o - c) * 31.99 * 0.865 * w / 1000;
          }
          break;
        case 'Kasser 18':
          if (isSell) {
            finalPrice = (o + c) * 32 * 0.75 * w / 1000 + (lpG * w) + lpP;
          } else {
            finalPrice = (o - c) * 31.99 * 0.74 * w / 1000;
          }
          break;
        case 'Exchange Kasser 21':
          finalPrice = w * 865 / 1000;
          unit = 'WEIGHT';
          break;
        case 'Exchange Kasser 18':
          finalPrice = w * 740 / 1000;
          unit = 'WEIGHT';
          break;
        case 'Exchange Sabika':
          finalPrice = w * 1000 / 995;
          unit = 'WEIGHT';
          break;
        case 'Exchange Cost':
          finalPrice = w * 995 * 0.05;
          unit = 'CURRENCY';
          break;
        case 'Exchange Lira':
          finalPrice = w * 875 / 995;
          unit = 'WEIGHT';
          break;
        case 'Weight from Money':
          finalPrice = (m / 32 * 1000) / (o + c);
          unit = 'WEIGHT';
          break;
        default:
          const fineness = getFineness(karat, isSell);
          if (isSell) {
            finalPrice = ((o + c) * 31.99 * fineness * w / 1000) + (lpG * w) + lpP;
          } else {
            finalPrice = ((o - c) * 31.99 * fineness * w / 1000);
          }
      }
    } else {
      // WHOLESALE Mode (keep or implement different logic)
      const fineness = getFineness(karat, isSell);
      if (isSell) {
        finalPrice = ((o + c) * 31.99 * fineness * w / 1000) + (lpG * w) + lpP;
      } else {
        finalPrice = ((o - c) * 31.99 * fineness * w / 1000);
      }
    }

    const roundedPrice = unit === 'CURRENCY' ? Math.round(finalPrice) : Number(finalPrice.toFixed(2));
    setResult(roundedPrice);
    setResultUnit(unit);

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: itemType,
      weight: weight,
      ouncePrice: ouncePrice,
      commission: commission,
      laborPerGram: laborPerGram,
      profit: profit,
      karat: karat,
      money: money,
      price: roundedPrice,
      operation: operation,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: operation === 'SELL' ? '📤' : '📥',
      metal: metal,
      unit: unit,
      pricingMode: pricingMode
    };

    setHistory(prev => [newItem, ...prev].slice(0, 10));
  };

  const clearForm = () => {
    setWeight('');
    setCommission('');
    setLaborPerGram('');
    setProfit('');
    setMoney('');
    setResult(null);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setPricingMode(item.pricingMode);
    setMetal(item.metal);
    setOperation(item.operation);
    setItemType(item.type);
    setKarat(item.karat);
    setOuncePrice(item.ouncePrice);
    setWeight(item.weight);
    setCommission(item.commission);
    setLaborPerGram(item.laborPerGram);
    setProfit(item.profit);
    setMoney(item.money || '');
    setResult(item.price);
    setResultUnit(item.unit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getShareText = () => {
    if (result === null) return '';
    const modeText = pricingMode === 'RETAIL' ? t.retail : t.wholesale;
    const metalText = metal === 'GOLD' ? t.gold : t.silver;
    const typeLabel = lang === 'ar' ? (
      itemType === 'Custom' ? 'مخصص' : 
      itemType === 'Lira' ? 'ليرة' : 
      itemType === 'Half Lira' ? 'نصف ليرة' : 
      itemType === 'Quarter Lira' ? 'ربع ليرة' : 
      itemType === 'Remleh' ? 'رملي' :
      itemType === 'Swiss Ounce' ? 'أونصة سويسري' :
      itemType === 'Silver Lira' ? 'ليرة فضة' :
      itemType === 'Silver Ounce' ? 'أونصة فضة' :
      itemType === 'Kasser 21' ? 'كسر 21' :
      itemType === 'Kasser 18' ? 'كسر 18' :
      itemType === 'Weight from Money' ? 'مبيع (من مبلغ)' : itemType
    ) : itemType;

    return `*${t.title}* (${modeText})
--------------------------
*${lang === 'ar' ? 'الصنف' : 'Item'}:* ${metalText} - ${typeLabel}
*${lang === 'ar' ? 'الوزن' : 'Weight'}:* ${weight}${t.gram}
*${lang === 'ar' ? 'العملية' : 'Operation'}:* ${operation === 'SELL' ? t.sell : t.buy}
--------------------------
*${lang === 'ar' ? 'النتيجة' : 'Result'}:* ${result.toLocaleString()} ${resultUnit === 'CURRENCY' ? t.currency : t.gram}`;
  };

  const copyToClipboard = () => {
    const text = getShareText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = getShareText();
    if (!text) return;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const fetchPrice = async () => {
    setIsFetching(true);
    try {
      const metalCode = metal === 'GOLD' ? 'XAU' : 'XAG';
      const response = await fetch(`https://www.goldapi.io/api/${metalCode}/USD`, {
        headers: {
          'x-access-token': 'goldapi-dcaesmfqjq4dh-io',
          'Content-Type': 'application/json'
        }
      });
      const data: PriceResponse = await response.json();
      if (data && data.price) {
        setOuncePrice(data.price.toString());
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const itemPresets = {
    'Custom': { weight: '', karat: '21' },
    'Lira': { weight: '8', karat: '21' },
    'Half Lira': { weight: '4', karat: '21' },
    'Quarter Lira': { weight: '2', karat: '21' },
    'Remleh': { weight: '', karat: '24' },
    'Swiss Ounce': { weight: '31.10', karat: '24' },
    'Silver Lira': { weight: '8', karat: '999' },
    'Silver Ounce': { weight: '31.10', karat: '999' },
    'Kasser 21': { weight: '', karat: '21' },
    'Kasser 18': { weight: '', karat: '18' },
    'Exchange Kasser 21': { weight: '', karat: '21' },
    'Exchange Kasser 18': { weight: '', karat: '18' },
    'Exchange Sabika': { weight: '', karat: '24' },
    'Exchange Cost': { weight: '', karat: '24' },
    'Exchange Lira': { weight: '', karat: '21' },
    'Weight from Money': { weight: '', karat: '21' },
  } as Record<string, { weight: string, karat: string }>;

  const goldKarats = ['24', '22', '21', '18'];
  const silverKarats = ['999', '925', '800'];
  const currentKarats = metal === 'GOLD' ? goldKarats : silverKarats;

  const handleMetalChange = (m: 'GOLD' | 'SILVER') => {
    setMetal(m);
    setKarat(m === 'GOLD' ? '21' : '925');
  };

  const handleItemTypeChange = (val: string) => {
    setItemType(val);
    if (itemPresets[val]) {
      setWeight(itemPresets[val].weight);
      setKarat(itemPresets[val].karat);
    }
  };

  const isRtl = lang === 'ar';

  return (
    <div className={`min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-amber-200 transition-colors duration-500 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-neutral-200 z-50">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${metal === 'GOLD' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-neutral-600 shadow-neutral-600/20'} text-white shadow-lg`}>
              <Coins size={20} />
            </div>
            <h1 className="text-lg font-bold tracking-tight">{t.title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-600 flex items-center gap-1 text-sm font-medium"
            >
              <Languages size={18} />
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Pricing Mode Toggle */}
        <div className="bg-white p-1 rounded-2xl border border-neutral-200 flex shadow-sm max-w-xs mx-auto">
          <button 
            onClick={() => setPricingMode('RETAIL')}
            className={`flex-1 py-1.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${pricingMode === 'RETAIL' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            {t.retail}
          </button>
          <button 
            onClick={() => setPricingMode('WHOLESALE')}
            className={`flex-1 py-1.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${pricingMode === 'WHOLESALE' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            {t.wholesale}
          </button>
        </div>

        {/* Type Selectors */}
        <div className="grid grid-cols-2 gap-4">
          {/* Metal Toggle */}
          <div className="bg-white p-1 rounded-2xl border border-neutral-200 flex shadow-sm">
            <button 
              onClick={() => handleMetalChange('GOLD')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${metal === 'GOLD' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-neutral-500 hover:bg-neutral-50'}`}
            >
              {metal === 'GOLD' && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              {t.gold}
            </button>
            <button 
              onClick={() => handleMetalChange('SILVER')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${metal === 'SILVER' ? 'bg-neutral-600 text-white shadow-md shadow-neutral-600/20' : 'text-neutral-500 hover:bg-neutral-50'}`}
            >
              {metal === 'SILVER' && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              {t.silver}
            </button>
          </div>

          {/* Operation Toggle */}
          <div className="bg-white p-1 rounded-2xl border border-neutral-200 flex shadow-sm">
            <button 
              onClick={() => setOperation('SELL')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${operation === 'SELL' ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20' : 'text-neutral-500 hover:bg-neutral-50'}`}
            >
              {operation === 'SELL' ? <ArrowUpRight size={16} /> : null}
              {t.sell}
            </button>
            <button 
              onClick={() => setOperation('BUY')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${operation === 'BUY' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-neutral-500 hover:bg-neutral-50'}`}
            >
              {operation === 'BUY' ? <ArrowDownLeft size={16} /> : null}
              {t.buy}
            </button>
          </div>
        </div>

        {/* Form */}
        <section className="bg-white rounded-3xl border border-neutral-200 shadow-xl shadow-neutral-200/50 overflow-hidden">
          <div className={`h-1.5 w-full transition-colors duration-500 ${operation === 'SELL' ? 'bg-orange-600' : 'bg-emerald-600'}`} />
          
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Item Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">{t.itemType}</label>
                <div className="relative group">
                  <select 
                    value={itemType}
                    onChange={(e) => handleItemTypeChange(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none transition-all group-hover:bg-white"
                  >
                    {Object.keys(itemPresets).map(p => (
                      <option key={p} value={p}>
                        {lang === 'ar' ? (
                          p === 'Custom' ? 'مخصص' : 
                          p === 'Lira' ? 'ليرة' : 
                          p === 'Half Lira' ? 'نصف ليرة' : 
                          p === 'Quarter Lira' ? 'ربع ليرة' : 
                          p === 'Remleh' ? 'رملي' :
                          p === 'Swiss Ounce' ? 'أونصة سويسري' :
                          p === 'Silver Lira' ? 'ليرة فضة' :
                          p === 'Silver Ounce' ? 'أونصة فضة' :
                          p === 'Kasser 21' ? 'كسر 21' :
                          p === 'Kasser 18' ? 'كسر 18' :
                          p === 'Exchange Kasser 21' ? 'تبديل كسر 21' :
                          p === 'Exchange Kasser 18' ? 'تبديل كسر 18' :
                          p === 'Exchange Sabika' ? 'تبديل سبيكة' :
                          p === 'Exchange Cost' ? 'أجور تبديل' :
                          p === 'Exchange Lira' ? 'تبديل ليرة' : 'مبيع (من مبلغ)'
                        ) : p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none group-focus-within:rotate-180 transition-transform" size={16} />
                </div>
              </div>

              {/* Karat */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">{t.karat}</label>
                <div className="flex flex-wrap gap-2">
                  {currentKarats.map(k => (
                    <button
                      key={k}
                      onClick={() => setKarat(k)}
                      className={`flex-1 min-w-[60px] py-3 rounded-xl text-sm font-bold border transition-all ${karat === k ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'}`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ounce Price */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1 flex justify-between">
                  {t.ouncePrice}
                  <button 
                    onClick={fetchPrice}
                    className="text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                    disabled={isFetching}
                  >
                    <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
                    {t.refresh}
                  </button>
                </label>
                <input 
                  type="number"
                  value={ouncePrice}
                  onChange={(e) => setOuncePrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">{t.weight}</label>
                <input 
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
                />
              </div>

              {/* Commission */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">{t.commission}</label>
                <input 
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
                />
              </div>

              {/* Labor per Gram */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">{t.laborPerGram}</label>
                <input 
                  type="number"
                  value={laborPerGram}
                  onChange={(e) => setLaborPerGram(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
                />
              </div>

              {/* Piece Labor */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">{t.labor}</label>
                <input 
                  type="number"
                  value={profit}
                  onChange={(e) => setProfit(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
                />
              </div>

              {/* Money (المبلغ) */}
              {itemType === 'Weight from Money' && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">{t.money}</label>
                  <input 
                    type="number"
                    value={money}
                    onChange={(e) => setMoney(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono"
                  />
                </div>
              )}
            </div>

            {/* Calculate & Clear Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={handleCalculate}
                className={`flex-[3] py-4 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${operation === 'SELL' ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'}`}
              >
                <Calculator size={22} />
                {t.calculate}
              </button>
              <button 
                onClick={clearForm}
                className="flex-1 py-4 rounded-2xl font-bold bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-all flex items-center justify-center"
                title={t.clear}
              >
                <Trash2 size={22} />
              </button>
            </div>

            {/* Result Display */}
            <AnimatePresence mode="wait">
              {result !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="pt-6 text-center border-t border-neutral-100 space-y-4"
                >
                  <div>
                    <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{lang === 'ar' ? 'النتيجة النهائية' : 'Final Result'}</span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className={`text-5xl font-black ${operation === 'SELL' ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-2xl font-bold text-neutral-300">
                        {resultUnit === 'CURRENCY' ? t.currency : t.gram}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={copyToClipboard}
                      className="flex-1 max-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-2xl text-xs font-bold transition-all active:scale-95"
                    >
                      {showCopied ? <RefreshCw size={14} className="animate-spin text-emerald-500" /> : <Copy size={14} />}
                      {showCopied ? t.copied : t.copyResult}
                    </button>
                    <button 
                      onClick={shareWhatsApp}
                      className="flex-1 max-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      <Share2 size={14} />
                      {t.shareWhatsApp}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* History Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-neutral-900">
              <History size={18} className="text-amber-500" />
              <h2 className="font-bold">{t.history}</h2>
            </div>
            {history.length > 0 && (
              <button 
                onClick={() => setHistory([])}
                className="text-xs font-bold text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                <Trash2 size={12} />
                {t.clearHistory}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="bg-white/50 border-2 border-dashed border-neutral-200 rounded-3xl py-12 text-center">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <History className="text-neutral-300" size={24} />
                </div>
                <p className="text-sm text-neutral-400 font-medium">{lang === 'ar' ? 'لا توجد سجلات بعد' : 'No records yet'}</p>
              </div>
            ) : (
              <AnimatePresence>
                {history.map((item) => (
                  <motion.button 
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full bg-white border border-neutral-200 p-4 rounded-3xl shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-between group text-start active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${item.operation === 'SELL' ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-100' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black uppercase tracking-widest ${item.operation === 'SELL' ? 'text-orange-600' : 'text-emerald-600'}`}>
                            {item.operation === 'SELL' ? (lang === 'ar' ? 'مبيع' : 'SELL') : (lang === 'ar' ? 'شراء' : 'BUY')}
                          </span>
                          <span className="text-neutral-300">•</span>
                          <span className="text-xs font-bold text-neutral-400">{item.time}</span>
                        </div>
                        <p className="font-bold text-neutral-700 leading-tight">
                          {lang === 'ar' ? (
                            item.type === 'Custom' ? 'مخصص' : 
                            item.type === 'Lira' ? 'ليرة' : 
                            item.type === 'Half Lira' ? 'نصف ليرة' : 
                            item.type === 'Quarter Lira' ? 'ربع ليرة' : 
                            item.type === 'Remleh' ? 'رملي' :
                            item.type === 'Swiss Ounce' ? 'أونصة سويسري' :
                            item.type === 'Silver Lira' ? 'ليرة فضة' :
                            item.type === 'Silver Ounce' ? 'أونصة فضة' :
                            item.type === 'Kasser 21' ? 'كسر 21' :
                            item.type === 'Kasser 18' ? 'كسر 18' :
                            item.type === 'Exchange Kasser 21' ? 'تبديل كسر 21' :
                            item.type === 'Exchange Kasser 18' ? 'تبديل كسر 18' :
                            item.type === 'Exchange Sabika' ? 'تبديل سبيكة' :
                            item.type === 'Exchange Cost' ? 'أجور تبديل' :
                            item.type === 'Exchange Lira' ? 'تبديل ليرة' : 
                            item.type === 'Weight from Money' ? 'مبيع (من مبلغ)' : item.type
                          ) : item.type} | {item.weight}{t.gram}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-lg font-black text-neutral-900">
                          {item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm font-bold text-neutral-400">
                          {item.unit === 'CURRENCY' ? t.currency : t.gram}
                        </span>
                      </div>
                      <div className={`text-[10px] items-center gap-1 justify-end flex font-bold ${item.metal === 'GOLD' ? 'text-amber-500' : 'text-neutral-500'}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item.metal === 'GOLD' ? t.gold : t.silver}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>

      <footer className="py-8 text-center border-t border-neutral-100 bg-white">
        <p className="text-xs font-bold text-neutral-300 uppercase tracking-[0.2em]">{t.title} © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
