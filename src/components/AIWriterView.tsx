import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  HelpCircle,
  FileText,
  DollarSign,
  Undo2,
  Facebook,
  Chrome,
  Video,
  Home,
  Instagram,
  Plus,
  Heart,
  MessageCircle,
  Send,
  Share2,
  MoreHorizontal,
  Globe,
  MapPin,
  Star,
  Phone,
  ThumbsUp,
  Bookmark,
  Award,
  Eye
} from 'lucide-react';

export default function AIWriterView() {
  const [beds, setBeds] = useState('3');
  const [baths, setBaths] = useState('2.5');
  const [sqft, setSqft] = useState('2200');
  const [price, setPrice] = useState('350000');
  const [address, setAddress] = useState('742 Evergreen Terrace');
  const [style, setStyle] = useState('Single Family Residence');
  const [customNotes, setCustomNotes] = useState('');
  const [tone, setTone] = useState('Luxury & High-end');
  const [audience, setAudience] = useState('Growing Families');
  const [newFeatureText, setNewFeatureText] = useState('');
  const [previewMode, setPreviewMode] = useState<'visual' | 'plain'>('visual');

  // Default features list that can be toggled
  const defaultFeatures = [
    { name: 'Granite Countertops', selected: true },
    { name: 'Hardwood Floors', selected: true },
    { name: 'Stainless Steel Appliances', selected: false },
    { name: 'Fireplace', selected: true },
    { name: 'Open Concept Layout', selected: false },
    { name: 'Private Patio', selected: false },
    { name: 'Swimming Pool', selected: false },
    { name: 'Mountain Views', selected: false },
    { name: 'Finished Basement', selected: false },
    { name: 'Smart Home Systems', selected: false }
  ];

  const [features, setFeatures] = useState(defaultFeatures);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [generatedPack, setGeneratedPack] = useState<{
    mls?: string;
    tiktok?: string;
    facebook?: string;
    instagram?: string;
    google?: string;
  }>({});
  const [activeOutputTab, setActiveOutputTab] = useState<'mls' | 'tiktok' | 'facebook' | 'instagram' | 'google'>('mls');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const toggleFeature = (index: number) => {
    const updated = [...features];
    updated[index].selected = !updated[index].selected;
    setFeatures(updated);
  };

  const handleAddCustomFeature = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    
    // Check if it already exists
    if (features.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewFeatureText('');
      return;
    }

    setFeatures([...features, { name: trimmed, selected: true }]);
    setNewFeatureText('');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg('');
    setGeneratedText('');
    setGeneratedPack({});

    const selectedFeatures = features
      .filter(f => f.selected)
      .map(f => f.name);

    try {
      const response = await fetch('/api/write-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          beds,
          baths,
          sqft,
          price,
          address,
          style,
          features: selectedFeatures,
          customNotes,
          tone,
          audience
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.pack) {
          setGeneratedPack(data.pack);
          setGeneratedText(data.pack.mls || data.listing);
        } else {
          setGeneratedPack({ mls: data.listing });
          setGeneratedText(data.listing);
        }
      } else {
        setErrorMsg(data.error || 'The generation failed. Please verify that your GEMINI_API_KEY is configured in your project Secrets panel.');
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg('A network error occurred. Please verify that the development server is running and that your GEMINI_API_KEY is active.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = generatedPack[activeOutputTab] || generatedText;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setBeds('3');
    setBaths('2.5');
    setSqft('2200');
    setPrice('350000');
    setAddress('742 Evergreen Terrace');
    setStyle('Single Family Residence');
    setCustomNotes('');
    setTone('Luxury & High-end');
    setAudience('Growing Families');
    setNewFeatureText('');
    setFeatures(defaultFeatures);
    setGeneratedText('');
    setGeneratedPack({});
    setActiveOutputTab('mls');
    setErrorMsg('');
  };

  const renderVisualMockup = (tab: 'mls' | 'tiktok' | 'facebook' | 'instagram' | 'google', text: string) => {
    if (!text) return null;

    const formatCurrency = (val: string) => {
      const num = parseInt(val) || 0;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(num);
    };

    const renderHashtags = (rawText: string) => {
      const words = rawText.split(/\s+/);
      const hashtags = words.filter(w => w.startsWith('#'));
      if (hashtags.length === 0) {
        return ['#DreamHome', '#RealEstate', '#HouseTour', '#PropertyListing'].map((tag, i) => (
          <span key={i} className="text-sky-400 hover:underline mr-2 cursor-pointer font-medium text-xs">{tag}</span>
        ));
      }
      return hashtags.map((tag, i) => (
        <span key={i} className="text-sky-400 hover:underline mr-2 cursor-pointer font-medium text-xs">{tag}</span>
      ));
    };

    switch (tab) {
      case 'instagram':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-slate-100 max-w-sm mx-auto shadow-2xl animate-fade-in text-left">
            <div className="flex items-center justify-between p-3.5 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-[10px] text-white border border-slate-900">
                    JV
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>jordan_vance_broker</span>
                    <Award className="h-3.5 w-3.5 text-blue-400 fill-blue-400 shrink-0" />
                  </div>
                  <div className="text-[9px] text-slate-400 flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5 text-slate-500 shrink-0" />
                    <span>{address || '742 Evergreen Terrace'}</span>
                  </div>
                </div>
              </div>
              <button type="button" className="text-slate-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="relative aspect-square bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 flex flex-col justify-between p-6 overflow-hidden border-b border-slate-800">
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl"></div>

              <div className="flex justify-between items-start z-10 w-full">
                <span className="text-[10px] font-bold bg-emerald-500/90 text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  JUST LISTED
                </span>
                <span className="text-[10px] font-extrabold bg-slate-950/80 backdrop-blur-md text-white px-3 py-1 rounded-full border border-slate-700/50 shadow">
                  {style || 'Home'}
                </span>
              </div>

              <div className="my-auto text-center z-10 space-y-2">
                <div className="inline-flex p-3 bg-emerald-500/15 rounded-2xl border border-emerald-500/30 text-emerald-400 shadow-inner">
                  <Home className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-white">{formatCurrency(price)}</p>
                  <p className="text-[10px] text-slate-400 tracking-wider font-mono uppercase mt-0.5">{address}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-950/60 backdrop-blur-md p-3 rounded-xl border border-slate-800/80 z-10">
                <div className="text-center">
                  <p className="text-[10px] font-mono text-slate-400">BEDS</p>
                  <p className="text-xs font-bold text-white mt-0.5">{beds}</p>
                </div>
                <div className="text-center border-x border-slate-800/80">
                  <p className="text-[10px] font-mono text-slate-400">BATHS</p>
                  <p className="text-xs font-bold text-white mt-0.5">{baths}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-mono text-slate-400">SQFT</p>
                  <p className="text-xs font-bold text-white mt-0.5">{parseInt(sqft).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button type="button" className="text-slate-200 hover:text-rose-500 transition-colors">
                    <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
                  </button>
                  <button type="button" className="text-slate-200 hover:text-blue-400 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <button type="button" className="text-slate-200 hover:text-emerald-400 transition-colors">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
                <button type="button" className="text-slate-200 hover:text-amber-400 transition-colors">
                  <Bookmark className="h-5 w-5" />
                </button>
              </div>

              <div className="text-xs font-bold text-slate-200">
                142 likes
              </div>

              <div className="text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-wrap max-h-[140px] overflow-y-auto scrollbar-thin">
                <span className="font-bold text-white mr-1.5">jordan_vance_broker</span>
                {text.replace(/#\w+/g, '')}
              </div>

              <div className="flex flex-wrap pt-1 border-t border-slate-800/60">
                {renderHashtags(text)}
              </div>
            </div>
          </div>
        );

      case 'tiktok':
        return (
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-slate-100 max-w-sm mx-auto shadow-2xl relative h-[420px] flex flex-col justify-between text-left animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 opacity-90 z-0"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl z-0"></div>
            <div className="absolute bottom-16 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl z-0"></div>

            <div className="z-10 w-full flex items-center justify-center space-x-4 py-3 text-xs font-semibold text-slate-400 border-b border-white/5 bg-slate-950/20">
              <span className="hover:text-white cursor-pointer">Following</span>
              <span className="text-white border-b-2 border-white pb-1 font-bold cursor-pointer">For You</span>
            </div>

            <div className="flex-1 z-10 flex relative p-4 items-end">
              <div className="flex-1 space-y-2.5 max-w-[80%]">
                <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl backdrop-blur-md shadow-lg">
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Opening Video Hook</div>
                  <div className="text-xs font-bold text-white leading-tight mt-0.5">
                    {text.match(/"([^"]+)"/) ? text.match(/"([^"]+)"/)?.[0] : `🚨 Tour this ${price ? formatCurrency(price) : ''} Dream Home!`}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>@jordan_vance</span>
                    <span className="bg-cyan-500 text-[8px] px-1 py-0.5 rounded text-white font-bold scale-90">LIVE</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                    {text}
                  </p>
                  <div className="text-[9px] text-slate-400 font-medium flex items-center gap-1 font-mono">
                    <span className="animate-pulse text-emerald-400">🎵</span>
                    <span>Original Audio - @jordan_vance</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4 ml-auto pb-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white flex items-center justify-center font-bold text-xs text-cyan-400">
                    JV
                  </div>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-rose-500 rounded-full text-[8px] font-extrabold text-white flex items-center justify-center border border-slate-950">
                    +
                  </span>
                </div>

                <button type="button" className="flex flex-col items-center group">
                  <div className="p-1.5 bg-slate-900/65 backdrop-blur-md rounded-full border border-white/5 text-slate-300 group-hover:text-rose-500 transition-colors">
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  </div>
                  <span className="text-[9px] text-slate-300 font-bold mt-1">4.8K</span>
                </button>

                <button type="button" className="flex flex-col items-center group">
                  <div className="p-1.5 bg-slate-900/65 backdrop-blur-md rounded-full border border-white/5 text-slate-300 group-hover:text-blue-400 transition-colors">
                    <MessageCircle className="h-4 w-4 fill-white/10" />
                  </div>
                  <span className="text-[9px] text-slate-300 font-bold mt-1">312</span>
                </button>

                <button type="button" className="flex flex-col items-center group">
                  <div className="p-1.5 bg-slate-900/65 backdrop-blur-md rounded-full border border-white/5 text-slate-300 group-hover:text-emerald-400 transition-colors">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] text-slate-300 font-bold mt-1">186</span>
                </button>
              </div>
            </div>

            <div className="h-1 w-full bg-slate-800 z-10">
              <div className="h-full w-2/3 bg-emerald-500"></div>
            </div>
          </div>
        );

      case 'facebook':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 max-w-sm mx-auto shadow-2xl animate-fade-in text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-extrabold text-white text-xs">
                  JV
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>Jordan Vance Realty</span>
                    <span className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-white scale-75">
                      ✓
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                    <span>1h</span>
                    <span>•</span>
                    <Globe className="h-3 w-3 text-slate-500 shrink-0" />
                  </div>
                </div>
              </div>
              <button type="button" className="text-slate-400 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed font-normal whitespace-pre-wrap max-h-[140px] overflow-y-auto scrollbar-thin">
              {text}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              <div className="h-24 bg-gradient-to-r from-emerald-950 to-indigo-950 flex items-center justify-center text-emerald-400 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent)]"></div>
                <Home className="h-8 w-8 relative z-10 opacity-75" />
              </div>
              <div className="p-3 bg-slate-950/80 border-t border-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{style || 'Premium Residence'}</p>
                  <p className="text-xs font-bold text-white mt-0.5 truncate">{address}</p>
                </div>
                <button type="button" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white rounded-lg shadow cursor-pointer">
                  Learn More
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5">
              <div className="flex items-center space-x-1.5">
                <span className="flex items-center justify-center h-4 w-4 rounded-full bg-blue-500 text-white font-bold scale-90">👍</span>
                <span className="flex items-center justify-center h-4 w-4 rounded-full bg-rose-500 text-white font-bold scale-90">❤️</span>
                <span>258 Likes</span>
              </div>
              <div>
                <span>46 Comments • 18 Shares</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 border-t border-slate-850 pt-2.5">
              <button type="button" className="py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Like</span>
              </button>
              <button type="button" className="py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Comment</span>
              </button>
              <button type="button" className="py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        );

      case 'google':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 max-w-sm mx-auto shadow-2xl animate-fade-in text-left space-y-4">
            <div className="flex items-start space-x-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-extrabold text-blue-400 shrink-0 text-sm">
                G
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>ApexEstate Realty - Jordan Vance</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">(114 reviews)</span>
                </div>
                <p className="text-[10px] text-slate-400">Google Business Profile Post</p>
              </div>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed font-normal whitespace-pre-wrap max-h-[140px] overflow-y-auto scrollbar-thin">
              {text}
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
              <MapPin className="h-5 w-5 text-blue-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-white">LOCATION DETAILS</p>
                <p className="text-[11px] text-slate-400 truncate">{address || '742 Evergreen Terrace'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button type="button" className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer">
                <Phone className="h-3.5 w-3.5" />
                <span>Call to Schedule Tour</span>
              </button>
            </div>
          </div>
        );

      case 'mls':
      default:
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-slate-100 max-w-sm mx-auto shadow-2xl animate-fade-in text-left">
            <div className="bg-gradient-to-r from-indigo-950 to-slate-900 p-4 border-b border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded">
                  MLS ACTIVE CO-BROKE
                </span>
                <span className="text-[10px] font-bold text-slate-400">ID: MLS-{Date.now().toString().slice(-6)}</span>
              </div>
              <h4 className="text-sm font-extrabold text-white mt-1.5 tracking-tight">{style || 'Premium Property'}</h4>
              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5 mt-0.5">
                <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                <span>{address}</span>
              </p>
            </div>

            <div className="grid grid-cols-4 gap-1 p-3 bg-slate-950/40 border-b border-slate-850 text-center">
              <div>
                <p className="text-[9px] font-mono text-slate-500 uppercase">Beds</p>
                <p className="text-xs font-extrabold text-white mt-0.5">{beds}</p>
              </div>
              <div className="border-l border-slate-800">
                <p className="text-[9px] font-mono text-slate-500 uppercase">Baths</p>
                <p className="text-xs font-extrabold text-white mt-0.5">{baths}</p>
              </div>
              <div className="border-l border-slate-800">
                <p className="text-[9px] font-mono text-slate-500 uppercase">Sq Ft</p>
                <p className="text-xs font-extrabold text-white mt-0.5">{parseInt(sqft).toLocaleString()}</p>
              </div>
              <div className="border-l border-slate-800">
                <p className="text-[9px] font-mono text-slate-500 uppercase">Ask Price</p>
                <p className="text-xs font-extrabold text-emerald-400 mt-0.5">{formatCurrency(price)}</p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Headline & Paragraph Description</p>
                <div className="text-xs text-slate-200 leading-relaxed font-normal whitespace-pre-wrap max-h-[140px] overflow-y-auto scrollbar-thin p-3 bg-slate-950 rounded-xl border border-slate-850">
                  {text}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Featured Amenities</p>
                <div className="flex flex-wrap gap-1">
                  {features.filter(f => f.selected).map((f, i) => (
                    <span key={i} className="text-[9px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div id="ai-writer-view" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-indigo-500 shrink-0" />
            <span>AI listing Copywriter</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Leverage Gemini 3.5 Flash to automatically compose beautiful MLS listing descriptions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Form Panel (Left) */}
        <form onSubmit={handleGenerate} className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">Property Input Specifications</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Street Address</label>
              <input
                type="text"
                required
                id="writer-input-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="742 Evergreen Terrace"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Style/Type</label>
              <input
                type="text"
                required
                id="writer-input-style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g. Colonial House, Modern Condo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Market Price ($)</label>
              <input
                type="number"
                required
                id="writer-input-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="350000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Square Footage</label>
              <input
                type="number"
                required
                id="writer-input-sqft"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                placeholder="2200"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bedrooms</label>
              <input
                type="number"
                required
                id="writer-input-beds"
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                placeholder="3"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bathrooms</label>
              <input
                type="number"
                step="0.5"
                required
                id="writer-input-baths"
                value={baths}
                onChange={(e) => setBaths(e.target.value)}
                placeholder="2.5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Copywriting Tone Style</label>
              <select
                id="writer-input-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="Luxury & High-end">Luxury & High-end</option>
                <option value="Warm & Friendly">Warm & Friendly</option>
                <option value="Professional & Informative">Professional & Informative</option>
                <option value="Enthusiastic & Energetic">Enthusiastic & Energetic</option>
                <option value="Cozy & Welcoming">Cozy & Welcoming</option>
                <option value="Modern & Tech-forward">Modern & Tech-forward</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Target Audience Segment</label>
              <select
                id="writer-input-audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="Growing Families">Growing Families</option>
                <option value="First-Time Homebuyers">First-Time Homebuyers</option>
                <option value="Luxury/Premium Seekers">Luxury/Premium Seekers</option>
                <option value="Real Estate Investors">Real Estate Investors</option>
                <option value="Retirees & Downsizers">Retirees & Downsizers</option>
                <option value="Young Professionals">Young Professionals</option>
              </select>
            </div>
          </div>

          {/* Amenity Feature Chips */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Amenity Highlight Chips</label>
              <span className="text-[10px] text-slate-400">Click to toggle highlights</span>
            </div>
            <div className="flex flex-wrap gap-2 border border-slate-100 p-3.5 bg-slate-50/50 rounded-xl">
              {features.map((feature, idx) => (
                <button
                  type="button"
                  key={feature.name}
                  onClick={() => toggleFeature(idx)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                    feature.selected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{feature.name}</span>
                  {feature.selected && <Check className="h-3 w-3 shrink-0" />}
                </button>
              ))}
            </div>

            {/* Quick Add Custom Feature Input */}
            <div className="flex gap-2 max-w-md pt-1">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                placeholder="Add other custom feature (e.g. Solar Panels, Chef's Pantry)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomFeature(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="px-3.5 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Custom specifications */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Custom Directives / Tone Notes</label>
            <textarea
              id="writer-input-notes"
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Mention the mature maple trees, the walking distance to downtown, or write in an extremely luxurious, premium tone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Fields</span>
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              id="btn-generate-listing"
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Composing Pack...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Content Pack</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Dynamic Preview Panel (Right) */}
        <div className="lg:col-span-2 space-y-4">
          <div id="listing-output-panel" className="bg-indigo-950 text-white rounded-2xl p-6 min-h-[500px] flex flex-col justify-between shadow-xl">
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-indigo-900 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-500 rounded text-white shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight">Gemini Content Pack</h4>
                  <p className="text-[10px] text-indigo-300">Multi-channel marketing copies</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {Object.keys(generatedPack).length > 0 && (
                  <div className="flex items-center bg-indigo-900/50 p-0.5 rounded-lg border border-indigo-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('visual')}
                      title="Show stylized visual feed mockup"
                      className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center space-x-1 ${
                        previewMode === 'visual'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-indigo-300 hover:text-white'
                      }`}
                    >
                      <Eye className="h-3 w-3" />
                      <span>Mockup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('plain')}
                      title="Show plain copyable text"
                      className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center space-x-1 ${
                        previewMode === 'plain'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-indigo-300 hover:text-white'
                      }`}
                    >
                      <FileText className="h-3 w-3" />
                      <span>Text</span>
                    </button>
                  </div>
                )}
                <span className="text-[9px] font-bold bg-indigo-800 text-indigo-200 px-2.5 py-1.5 rounded-md uppercase tracking-widest shrink-0">Flash 3.5</span>
              </div>
            </div>

            {/* Platform Selection Tabs */}
            {Object.keys(generatedPack).length > 0 && (
              <div className="grid grid-cols-5 gap-1 bg-indigo-950/65 p-1 rounded-xl mt-3.5 border border-indigo-900">
                <button
                  type="button"
                  onClick={() => setActiveOutputTab('mls')}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 border border-transparent cursor-pointer ${
                    activeOutputTab === 'mls'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-indigo-300 hover:text-white hover:bg-indigo-900/40'
                  }`}
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>MLS Listing</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOutputTab('tiktok')}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 border border-transparent cursor-pointer ${
                    activeOutputTab === 'tiktok'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-indigo-300 hover:text-white hover:bg-indigo-900/40'
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>TikTok</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOutputTab('instagram')}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 border border-transparent cursor-pointer ${
                    activeOutputTab === 'instagram'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-indigo-300 hover:text-white hover:bg-indigo-900/40'
                  }`}
                >
                  <Instagram className="h-3.5 w-3.5" />
                  <span>Instagram</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOutputTab('facebook')}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 border border-transparent cursor-pointer ${
                    activeOutputTab === 'facebook'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-indigo-300 hover:text-white hover:bg-indigo-900/40'
                  }`}
                >
                  <Facebook className="h-3.5 w-3.5" />
                  <span>Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOutputTab('google')}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 border border-transparent cursor-pointer ${
                    activeOutputTab === 'google'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-indigo-300 hover:text-white hover:bg-indigo-900/40'
                  }`}
                >
                  <Chrome className="h-3.5 w-3.5" />
                  <span>Google</span>
                </button>
              </div>
            )}

            {/* Content body */}
            <div className="flex-1 py-5 overflow-y-auto max-h-[420px] scrollbar-thin">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 py-16 text-indigo-200">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
                  <p className="text-sm font-medium">Gemini is synthesizing content pack...</p>
                  <p className="text-[10px] text-indigo-400 text-center">Drafting SEO descriptions, TikTok hooks, visual cues, and social updates</p>
                </div>
              ) : Object.keys(generatedPack).length > 0 ? (
                previewMode === 'visual' ? (
                  <div className="animate-fade-in py-1">
                    {renderVisualMockup(activeOutputTab, generatedPack[activeOutputTab])}
                  </div>
                ) : (
                  <div id="ai-response-text" className="text-sm text-slate-100 font-normal leading-relaxed whitespace-pre-wrap animate-fade-in bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/40 max-h-[320px] overflow-y-auto scrollbar-thin">
                    {generatedPack[activeOutputTab]}
                  </div>
                )
              ) : generatedText ? (
                <div id="ai-response-text" className="text-sm text-slate-100 font-normal leading-relaxed whitespace-pre-wrap bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/40 max-h-[320px] overflow-y-auto scrollbar-thin">
                  {generatedText}
                </div>
              ) : errorMsg ? (
                <div className="p-4 bg-rose-950/40 border border-rose-900 rounded-xl space-y-2">
                  <h5 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Generation Blocked</span>
                  </h5>
                  <p className="text-xs text-rose-200 leading-relaxed">
                    {errorMsg}
                  </p>
                  <p className="text-[10px] text-rose-400">
                    Verify that your local server environment has the GEMINI_API_KEY set up correctly.
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-3 py-16 text-indigo-200/50 text-center">
                  <FileText className="h-12 w-12 text-indigo-800" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-200">No output synthesized yet</p>
                    <p className="text-xs text-indigo-400 max-w-[240px] mx-auto mt-1">
                      Configure property specifications and click "Generate Content Pack" to produce beautiful descriptions and social copy!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Copy button */}
            <div className="pt-4 border-t border-indigo-900 flex items-center justify-between">
              <span className="text-[10px] text-indigo-400">
                {Object.keys(generatedPack).length > 0 ? `Viewing: ${activeOutputTab.toUpperCase()} template` : 'Fully customizable copy'}
              </span>

              {(Object.keys(generatedPack).length > 0 || generatedText) && (
                <button
                  type="button"
                  id="btn-copy-listing"
                  onClick={handleCopy}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-2 transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-4.5 w-4.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4.5 w-4.5" />
                      <span>Copy {activeOutputTab.toUpperCase()} Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Quick guide card */}
          <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start space-x-2.5">
            <Sparkles className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-800">SEO Optimizations Active:</span> The engine structures lists using standard real estate formats, incorporating natural search keywords (e.g., beds, baths, sqft, and neighborhood descriptions) to maximize listing search relevance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
