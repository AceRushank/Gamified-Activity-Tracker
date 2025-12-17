import React, { useState, useEffect } from 'react';
import { 
  Zap, Check, CheckCircle, Calendar, Settings, 
  Plus, Trash2, User, Award, LogOut, Edit2, 
  Smile, Battery, Clock, Save, Flame,
  LayoutDashboard, ListTodo, Activity, Camera,
  ChevronLeft, ChevronRight, Trophy, TrendingUp,
  Sparkles, Lock, Eye, Snowflake, ShoppingBag, Heart,
  Menu, X, Bell
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot
} from "firebase/firestore";

// --- 1. CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyClk8kB2ujMsIvGzLZ1zVzXcwJKP6ksu2I",
  authDomain: "wedolist-product.firebaseapp.com",
  projectId: "wedolist-product",
  storageBucket: "wedolist-product.firebasestorage.app",
  messagingSenderId: "261250027032",
  appId: "1:261250027032:web:102e59a01207f4e6437d6d",
  measurementId: "G-4ZY3PM6FGJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- 2. CONSTANTS ---
const APP_NAME = "Gamified Habit Tracker";
const DB_VERSION = 'wedolist_prod_final_v2'; 
const APP_COLLECTION_ID = "wedolist_prod";

// Simplified Collection Names
const COLLECTIONS = {
  USERS: `${DB_VERSION}_users`,
  LOGS: `${DB_VERSION}_logs`,
  HABITS: `${DB_VERSION}_habits`
};

const PRODUCT_USERS = [
  { 
    uid: 'user_rushu', 
    name: 'RUSHU', 
    avatar: '🐶', 
    color: 'blue', 
    defaultGoal: 'MAX STATS', 
    pin: '2006' 
  },
  { 
    uid: 'user_vedu', 
    name: 'VEDU', 
    avatar: '🐱', 
    color: 'pink', 
    defaultGoal: 'LEVEL UP DAILY', 
    pin: '2005' 
  }
];

const PRESET_HABITS = [
  { title: "WAKE UP EARLY", category: "HEALTH", exp: 50 },
  { title: "DRINK WATER", category: "HEALTH", exp: 20 },
  { title: "WORKOUT", category: "HEALTH", exp: 100 },
  { title: "READ 10 PAGES", category: "MIND", exp: 60 },
  { title: "MEDITATE", category: "MIND", exp: 40 },
  { title: "JOURNAL", category: "MIND", exp: 40 },
  { title: "CLEAN ROOM", category: "ENV", exp: 50 },
  { title: "NO SUGAR", category: "HEALTH", exp: 80 },
  { title: "STUDY 1H", category: "WORK", exp: 100 },
  { title: "CODE 1H", category: "WORK", exp: 100 },
];

// --- Theme & Aesthetics ---
const THEME = {
  bg: "bg-[#111111]", 
  sidebar: "bg-[#1A1A1A]",
  card: "bg-[#222222]",
  cardHover: "hover:bg-[#2A2A2A] transition-colors duration-200",
  textMain: "text-[#EAEAEA]",
  textMuted: "text-[#888888]",
  border: "border-[#333333]",
  // Typography
  fontMono: "font-mono", 
  fontSmallCaps: "uppercase text-[10px] font-bold tracking-[0.2em] text-[#888888]",
  
  // Flat Colors
  colors: {
    pink: "text-[#FF4081]",
    blue: "text-[#00E5FF]",
    yellow: "text-[#FFD740]",
    green: "text-[#00E676]",
    gray: "text-[#888888]"
  }
};

const getTodayString = () => {
  const d = new Date();
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
};

const getFormattedDate = () => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options).toUpperCase();
};

// Level Logic
const MAX_LEVEL = 500;
const calculateLevel = (exp) => {
    const lvl = Math.floor(Math.sqrt(exp / 100)) + 1; // Progressive curve
    return Math.min(lvl, MAX_LEVEL);
};
const calculateNextLevelExp = (level) => {
    if(level >= MAX_LEVEL) return Infinity;
    return 100 * Math.pow(level, 2);
};

// --- Components ---

const Toast = ({ message, show }) => {
    if (!show) return null;
    return (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-white text-black px-6 py-3 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 border-2 border-[#111]">
                <CheckCircle size={16} className="text-emerald-600" />
                {message}
            </div>
        </div>
    );
};

const Avatar = ({ emoji, size = "md", className = "" }) => {
    const sizeClasses = {
        sm: "w-8 h-8 text-lg",
        md: "w-12 h-12 text-3xl",
        lg: "w-20 h-20 text-5xl",
        xl: "w-32 h-32 text-8xl"
    };
    return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-[#2A2A2A] border-2 border-[#333] flex items-center justify-center p-1 ${className}`}>
             <span className="leading-none select-none filter drop-shadow-md">{emoji}</span>
        </div>
    );
};

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`${THEME.card} rounded-none border ${THEME.border} p-5 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = "", disabled = false, variant = 'primary' }) => {
  const styles = variant === 'primary' 
    ? "bg-white text-black hover:bg-[#CCCCCC]" 
    : "bg-[#333333] text-white hover:bg-[#444444]";
    
  return (
    <button onClick={onClick} disabled={disabled} className={`px-5 py-3 font-mono text-xs uppercase tracking-widest font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 rounded-none border border-transparent ${styles} ${className}`}>
      {children}
    </button>
  );
};

const ProgressBar = ({ current, max, color = "#FFFFFF" }) => {
  const percentage = max === Infinity ? 100 : Math.min(100, Math.max(0, (current / max) * 100));
  return (
    <div className="h-2 w-full bg-[#1A1A1A] overflow-hidden border border-[#333333]">
      <div 
        className="h-full transition-all duration-500 ease-out" 
        style={{ width: `${percentage}%`, backgroundColor: color }} 
      />
    </div>
  );
};

// --- Sections ---

const Login = ({ onLogin, existingUsers }) => {
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEnter = async () => {
    if(selected) {
        if (pin === selected.pin) {
            setIsLoading(true);
            await onLogin(selected); 
            setIsLoading(false);
        } else {
            alert("INCORRECT PIN");
        }
    }
  };

  return (
    <div className={`min-h-screen ${THEME.bg} flex items-center justify-center p-6 font-mono`}>
      <div className="w-full max-w-md space-y-12">
        <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">System Login</h1>
            <p className={THEME.fontSmallCaps}>Identify User</p>
        </div>

        {!selected ? (
            <div className="grid grid-cols-2 gap-4">
                {PRODUCT_USERS.map(u => (
                    <button 
                        key={u.uid}
                        onClick={() => setSelected(u)}
                        className={`group ${THEME.card} p-8 border ${THEME.border} hover:border-white transition-all flex flex-col items-center gap-6`}
                    >
                        <Avatar emoji={u.avatar} size="xl" className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold text-white uppercase tracking-widest">{u.name}</span>
                    </button>
                ))}
            </div>
        ) : (
            <Card className="animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col items-center mb-8">
                    <Avatar emoji={selected.avatar} size="xl" className="mb-4 shadow-xl" />
                    <h2 className="text-lg font-bold text-white uppercase tracking-widest">{selected.name}</h2>
                </div>
                <input 
                    type="password" 
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    autoFocus
                    onChange={e => setPin(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleEnter()}
                    placeholder="PIN"
                    className="w-full bg-[#111111] py-4 text-center text-white text-xl tracking-[0.5em] font-mono border border-[#333333] focus:border-white outline-none mb-6 placeholder-[#444]"
                />
                <div className="flex gap-4">
                    <Button onClick={() => setSelected(null)} variant="secondary" className="flex-1">BACK</Button>
                    <Button onClick={handleEnter} className="flex-[2]" disabled={isLoading}>
                        {isLoading ? "LOADING..." : "ACCESS"}
                    </Button>
                </div>
            </Card>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ users, currentUser, setView }) => { 
  const partner = users.find(u => u.uid !== currentUser.uid);
  const myLevel = calculateLevel(currentUser.points || 0);
  const nextLevelExp = calculateNextLevelExp(myLevel);
  const currentLevelBaseExp = calculateNextLevelExp(myLevel - 1);
  const levelProgressExp = (currentUser.points || 0) - (myLevel === 1 ? 0 : currentLevelBaseExp);
  const levelTotalExp = nextLevelExp - (myLevel === 1 ? 0 : currentLevelBaseExp);

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-[#333] pb-4">
          <div>
              <p className={THEME.fontSmallCaps}>{getFormattedDate()}</p>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Dashboard</h1>
          </div>
          <div className="text-right">
              <p className={THEME.fontSmallCaps}>STATUS</p>
              <p className="text-xs font-mono text-emerald-500">ONLINE</p>
          </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card className="flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-4">
                     <Avatar emoji={currentUser.avatar} size="md" />
                     <div>
                        <p className={THEME.fontSmallCaps}>LEVEL {myLevel}</p>
                        <h1 className="text-3xl font-bold text-white uppercase tracking-widest font-mono">{currentUser.name}</h1>
                     </div>
                </div>
                <div className="text-right">
                    <p className={THEME.fontSmallCaps}>TOTAL EXP</p>
                    <p className="text-2xl font-mono text-white">{currentUser.points || 0}</p>
                </div>
            </div>
            <div className="z-10">
                <div className="flex justify-between text-[10px] text-[#888] mb-2 font-mono uppercase">
                    <span>Progress to Lvl {myLevel + 1}</span>
                    <span>{Math.floor(levelTotalExp - levelProgressExp)} XP REQ</span>
                </div>
                <ProgressBar current={levelProgressExp} max={levelTotalExp} color="#FFFFFF" />
            </div>
            <div className="absolute right-[-10px] bottom-[-10px] opacity-5 pointer-events-none">
                <Trophy size={120} />
            </div>
         </Card>

         <Card className="flex items-center justify-center flex-col relative overflow-hidden">
            <div className="text-center z-10">
                <p className={THEME.fontSmallCaps}>ACTIVE STREAK</p>
                <div className="flex items-center gap-3 justify-center my-4">
                    <Flame size={40} className="text-white" />
                    <span className="text-6xl font-bold text-white font-mono">{currentUser.streak || 0}</span>
                </div>
                <p className="text-xs text-[#888] font-mono uppercase">MULTIPLIER ACTIVE</p>
            </div>
         </Card>
      </div>

      {/* Partner Stats */}
      <Card className="flex items-center gap-6 bg-[#1A1A1A]">
          {partner ? (
            <>
              <Avatar emoji={partner.avatar} size="md" className="grayscale" />
              <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-white uppercase tracking-widest">{partner.name} <span className="text-[#666] ml-2">LVL {calculateLevel(partner.points || 0)}</span></span>
                      <span className="text-xs text-[#666] font-mono">{partner.points} XP</span>
                  </div>
                  <ProgressBar current={partner.points % 100} max={100} color="#666666" />
              </div>
            </>
          ) : (
            <div className="w-full text-center text-[#666] text-xs uppercase tracking-widest">CONNECTING TO PLAYER 2...</div>
          )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => setView('calendar')} 
            className="bg-[#222] p-6 border border-[#333] text-center cursor-pointer hover:bg-[#2A2A2A] transition-colors group"
          >
              <Calendar className="mx-auto mb-3 text-[#666] group-hover:text-white transition-colors" size={28} />
              <span className={THEME.fontSmallCaps}>VIEW LOGS</span>
          </div>
          <div 
            onClick={() => setView('daily')} 
            className="bg-[#222] p-6 border border-[#333] text-center cursor-pointer hover:bg-[#2A2A2A] transition-colors group"
          >
              <Zap className="mx-auto mb-3 text-[#666] group-hover:text-white transition-colors" size={28} />
              <span className={THEME.fontSmallCaps}>NEW QUEST</span>
          </div>
      </div>
    </div>
  );
};

const DailyLog = ({ currentUser, myLog, updateLog }) => {
  const [log, setLog] = useState({ tasks: [], mood: 'NEUTRAL', energy: 50, hours: 0, note: '' });
  const [newTask, setNewTask] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (myLog) setLog(prev => ({...prev, ...myLog})); }, [myLog]);

  const save = async () => {
    setIsSaving(true);
    await updateLog(log);
    setIsSaving(false);
  };
  
  const addTask = () => { if(newTask) { setLog(p => ({...p, tasks: [...p.tasks, {id: Date.now(), text: newTask, completed: false}]})); setNewTask(""); }};
  const toggleTask = (id) => setLog(p => ({...p, tasks: p.tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t)}));
  const deleteTask = (id) => setLog(p => ({...p, tasks: p.tasks.filter(t => t.id !== id)}));

  const moods = ['PEAK', 'GOOD', 'OKAY', 'LOW'];

  return (
    <div className="pb-24 max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-2">
       <div className="flex justify-between items-center border-b border-[#333] pb-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-widest">Daily Log</h2>
          <Button onClick={save} className="px-6 py-2 text-[10px]" disabled={isSaving}>{isSaving ? "SAVING..." : "SYNC DATA"}</Button>
       </div>

       <div className="space-y-4">
          <div className="flex justify-between items-end">
              <p className={THEME.fontSmallCaps}>QUESTS</p>
              <p className="text-[10px] text-[#666] font-mono">+20 XP EACH</p>
          </div>
          
          <div className="flex gap-0">
             <input 
                value={newTask} 
                onChange={e => setNewTask(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="INPUT QUEST..." 
                className="flex-1 bg-[#111] p-4 text-white border border-[#333] outline-none text-sm font-mono placeholder-[#444]"
             />
             <button onClick={addTask} className="bg-white text-black px-4 font-bold hover:bg-[#ddd]"><Plus size={18}/></button>
          </div>
          
          <div className="space-y-2">
             {log.tasks.map(t => (
                <div key={t.id} className={`flex items-center justify-between p-4 border transition-all ${t.completed ? 'bg-[#1A1A1A] border-[#333] opacity-50' : 'bg-[#222] border-[#333] hover:border-[#555]'}`}>
                   <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleTask(t.id)}>
                      <div className={`w-4 h-4 border flex items-center justify-center ${t.completed ? 'bg-white border-white' : 'border-[#666]'}`}>
                         {t.completed && <Check size={12} className="text-black" />}
                      </div>
                      <span className={`text-sm font-mono uppercase ${t.completed ? 'line-through text-[#666]' : 'text-white'}`}>{t.text}</span>
                   </div>
                   <button onClick={() => deleteTask(t.id)} className="text-[#444] hover:text-white p-2"><Trash2 size={14}/></button>
                </div>
             ))}
             {log.tasks.length === 0 && <div className="text-center border border-dashed border-[#333] p-8 text-[#444] text-xs font-mono uppercase">NO ACTIVE QUESTS</div>}
          </div>
       </div>

       <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
             <p className={THEME.fontSmallCaps}>SYSTEM STATUS (MOOD)</p>
             <div className="grid grid-cols-2 gap-2">
                {moods.map(m => (
                   <button 
                      key={m} 
                      onClick={() => setLog(p => ({...p, mood: m}))}
                      className={`py-3 text-[10px] font-bold border transition-all ${log.mood === m ? 'bg-white text-black border-white' : 'bg-[#111] text-[#666] border-[#333] hover:border-[#555]'}`}
                   >
                      {m}
                   </button>
                ))}
             </div>
          </div>
          <div className="space-y-3">
             <p className={THEME.fontSmallCaps}>METRICS</p>
             <div className="bg-[#222] border border-[#333] p-4 space-y-4">
                <div>
                   <div className="flex justify-between text-[10px] text-[#888] mb-2 font-mono"><span>ENERGY</span><span>{log.energy}%</span></div>
                   <input type="range" value={log.energy} onChange={e => setLog(p => ({...p, energy: parseInt(e.target.value)}))} className="w-full h-1 bg-[#111] appearance-none cursor-pointer accent-white"/>
                </div>
                <div>
                   <div className="flex justify-between text-[10px] text-[#888] mb-2 font-mono"><span>HOURS</span><span>{log.hours}H</span></div>
                   <div className="flex items-center gap-1">
                      <button onClick={() => setLog(p => ({...p, hours: Math.max(0, p.hours - 0.5)}))} className="bg-[#111] flex-1 py-1 border border-[#333] text-white hover:bg-[#333]">-</button>
                      <button onClick={() => setLog(p => ({...p, hours: p.hours + 0.5}))} className="bg-[#111] flex-1 py-1 border border-[#333] text-white hover:bg-[#333]">+</button>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <div className="space-y-3">
          <p className={THEME.fontSmallCaps}>CAPTAIN'S LOG</p>
          <textarea 
             value={log.note} 
             onChange={e => setLog(p => ({...p, note: e.target.value}))} 
             placeholder="ENTER LOG..." 
             className="w-full bg-[#111] p-4 text-white border border-[#333] outline-none h-32 resize-none text-xs font-mono placeholder-[#444] uppercase"
          />
       </div>
    </div>
  );
};

const HabitTracker = ({ habits, toggleHabit, createHabit, deleteHabit, seedHabits }) => {
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', category: 'HEALTH', exp: 10 });
  const today = getTodayString();

  return (
    <div className="pb-24 max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-[#333] pb-4">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest">Habit Grid</h2>
            <Button onClick={() => setShowForm(!showForm)} variant="secondary" className="px-4 py-2 text-[10px]">
                {showForm ? 'CLOSE' : 'NEW PROTOCOL'}
            </Button>
        </div>

        {habits.length === 0 && (
            <div className="text-center py-20 border border-dashed border-[#333]">
                <p className="text-[#666] mb-6 font-mono text-xs uppercase">No active protocols detected.</p>
                <Button onClick={seedHabits} className="mx-auto">INITIALIZE DEFAULT PROTOCOLS</Button>
            </div>
        )}

        {showForm && (
            <Card className="animate-in slide-in-from-top-2 bg-[#1A1A1A]">
                <input 
                    placeholder="PROTOCOL NAME" 
                    value={newHabit.title} 
                    onChange={e => setNewHabit({...newHabit, title: e.target.value.toUpperCase()})}
                    className="w-full bg-[#111] p-4 text-white border border-[#333] mb-4 outline-none font-mono text-sm placeholder-[#444]"
                />
                <div className="flex gap-4">
                    <input 
                        type="number"
                        placeholder="XP" 
                        value={newHabit.exp} 
                        onChange={e => setNewHabit({...newHabit, exp: parseInt(e.target.value)})}
                        className="w-24 bg-[#111] p-4 text-white border border-[#333] outline-none text-center font-mono text-sm"
                    />
                    <Button onClick={() => { if(newHabit.title){ createHabit(newHabit); setShowForm(false); }}} className="flex-1">INITIALIZE</Button>
                </div>
            </Card>
        )}

        {/* Button Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {habits.map(h => {
                const isDone = h.lastCompleted === today;
                return (
                    <button 
                        key={h.id}
                        onClick={() => toggleHabit(h)}
                        className={`relative p-5 border transition-all duration-100 active:scale-[0.98] flex flex-col justify-between h-32 text-left group
                            ${isDone 
                                ? 'bg-[#EAEAEA] border-[#EAEAEA]' 
                                : 'bg-[#1A1A1A] border-[#333] hover:border-[#666]'
                            }`}
                    >
                        <div className="w-full flex justify-between items-start">
                            <span className={`text-[9px] font-bold font-mono px-2 py-1 ${isDone ? 'bg-black text-white' : 'bg-[#2A2A2A] text-[#888]'}`}>
                                +{h.exp || 10} XP
                            </span>
                            <div 
                                onClick={(e) => { e.stopPropagation(); deleteHabit(h.id); }}
                                className={`text-[#444] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1`}
                            >
                                <Trash2 size={14} />
                            </div>
                        </div>
                        
                        <div>
                            <h3 className={`font-bold text-sm tracking-wide mb-1 ${isDone ? 'text-black' : 'text-white'}`}>{h.title}</h3>
                            <p className={`text-[10px] font-mono ${isDone ? 'text-[#444]' : 'text-[#666]'}`}>{h.streak} DAY STREAK</p>
                        </div>
                    </button>
                );
            })}
        </div>
    </div>
  );
};

const CalendarView = ({ allLogs, currentUser }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Logic: Calculate ACTIVE DAYS for this month based on unique dates from logs
  const activeDaysCount = new Set(allLogs
      .filter(l => l.userId === currentUser.uid)
      .map(l => {
          const d = new Date(l.date);
          // Only count if within current month/year
          if(d.getMonth() === currentMonth && d.getFullYear() === currentYear) return l.date;
          return null;
      })
      .filter(d => d !== null) // Remove nulls
  ).size;

  return (
    <div className="pb-24 max-w-4xl mx-auto space-y-8">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest border-b border-[#333] pb-4">Activity Log</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <span className={THEME.fontSmallCaps}>{today.toLocaleString('default', { month: 'long' }).toUpperCase()} {currentYear}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                        {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-[10px] text-[#666] font-bold">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                         {/* Empty slots for start of month */}
                        {Array.from({length: new Date(currentYear, currentMonth, 1).getDay()}, (_, i) => <div key={`empty-${i}`} />)}
                        
                        {Array.from({length: daysInMonth}, (_, i) => {
                            const day = i + 1;
                            const dateStr = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
                            // Check if log exists for this specific day
                            const hasLog = allLogs.some(l => {
                                // Important: Compare just YYYY-MM-DD strings to avoid timezone issues
                                return l.date === dateStr && l.userId === currentUser.uid;
                            });
                            const isToday = day === today.getDate();
                            
                            return (
                                <div key={day} className="aspect-square flex items-center justify-center">
                                    <div className={`w-8 h-8 flex items-center justify-center text-xs font-mono transition-all
                                        ${isToday ? 'border border-white text-white' : ''}
                                        ${hasLog ? 'bg-white text-black font-bold' : 'bg-[#1A1A1A] text-[#444]'}
                                    `}>
                                        {day}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
            
            <div className="space-y-4">
                <Card className="flex flex-col items-center justify-center py-10">
                    <p className={THEME.fontSmallCaps}>MONTHLY CONSISTENCY</p>
                    <p className="text-5xl font-mono text-white mt-4">{activeDaysCount}<span className="text-[#444] text-2xl">/{daysInMonth}</span></p>
                    <p className="text-xs text-[#666] mt-2 font-mono uppercase">DAYS ACTIVE</p>
                </Card>
                <Card className="py-6 px-4">
                    <div className="flex items-center gap-4">
                         <div className="bg-[#333] p-3"><Activity size={20} className="text-white"/></div>
                         <div>
                             <p className={THEME.fontSmallCaps}>TOTAL LOGS</p>
                             <p className="text-xl text-white font-mono">{allLogs.filter(l => l.userId === currentUser.uid).length}</p>
                         </div>
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [view, setView] = useState('login'); // Start at login
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => { window.addEventListener('resize', () => setIsMobile(window.innerWidth < 768)); }, []);

  useEffect(() => {
    onAuthStateChanged(auth, u => {
        if (!u) signInAnonymously(auth);
        setUser(u);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubUsers = onSnapshot(collection(db, COLLECTIONS.USERS), (snap) => {
        const users = snap.docs.map(d => d.data());
        setUsersData(users);
        if (currentUserData) {
            const me = users.find(u => u.uid === currentUserData.uid);
            if(me) setCurrentUserData(me);
        }
        setIsLoading(false);
    });
    const unsubHabits = onSnapshot(collection(db, COLLECTIONS.HABITS), (snap) => setHabits(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubLogs = onSnapshot(collection(db, COLLECTIONS.LOGS), (snap) => setLogs(snap.docs.map(d => d.data())));
    return () => { unsubUsers(); unsubHabits(); unsubLogs(); };
  }, [user]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleLogin = async (userData) => {
    try {
        // SAFE LOGIN: Fetch actual user doc first to avoid overwriting points
        const userRef = doc(db, COLLECTIONS.USERS, userData.uid);
        const userSnap = await import("firebase/firestore").then(mod => mod.getDoc(userRef));
        
        let finalUserData;
        
        if (userSnap.exists()) {
            const dbData = userSnap.data();
            // Force local config for avatar to ensure Emoji is used, but keep DB points
            finalUserData = { 
                ...dbData, 
                ...userData, // This ensures Avatar is '🐶' or '🐱'
                points: dbData.points, 
                streak: dbData.streak 
            };
            
            // Force update DB with correct avatar immediately
            await updateDoc(userRef, { avatar: userData.avatar });
        } else {
            // New user, use defaults
            finalUserData = { ...userData, points: 0, streak: 0 };
            await setDoc(userRef, finalUserData);
        }

        setCurrentUserData(finalUserData);
        setView('dashboard');
    } catch (e) { 
        console.error("Login Error:", e);
        showToast("System Error. Check Console."); 
    }
  };

  const createHabit = async (h) => addDoc(collection(db, COLLECTIONS.HABITS), { ...h, userId: currentUserData.uid, streak: 0, lastCompleted: null });
  
  const seedHabits = async () => {
      PRESET_HABITS.forEach(async (h) => {
          await addDoc(collection(db, COLLECTIONS.HABITS), { ...h, userId: currentUserData.uid, streak: 0, lastCompleted: null });
      });
  };

  const deleteHabit = async (id) => deleteDoc(doc(db, COLLECTIONS.HABITS, id));
  
  const toggleHabit = async (h) => {
      const today = getTodayString();
      if (h.lastCompleted === today) {
          // UNDO Logic
          await updateDoc(doc(db, COLLECTIONS.HABITS, h.id), { lastCompleted: null, streak: Math.max(0, (h.streak || 1) - 1) });
          await updateDoc(doc(db, COLLECTIONS.USERS, currentUserData.uid), { points: Math.max(0, (currentUserData.points || 0) - (h.exp || 10)) });
      } else {
          // DO Logic
          await updateDoc(doc(db, COLLECTIONS.HABITS, h.id), { lastCompleted: today, streak: (h.streak || 0) + 1 });
          await updateDoc(doc(db, COLLECTIONS.USERS, currentUserData.uid), { points: (currentUserData.points || 0) + (h.exp || 10) });
          showToast(`+${h.exp || 10} XP`);
      }
  };

  const updateLog = async (logData) => {
    const logId = `${currentUserData.uid}_${getTodayString()}`;
    
    // Find previous log to calculate new tasks completed
    const prevLog = logs.find(l => l.userId === currentUserData.uid && l.date === getTodayString());
    const prevCompletedCount = prevLog ? prevLog.tasks.filter(t => t.completed).length : 0;
    const newCompletedCount = logData.tasks.filter(t => t.completed).length;
    
    const diff = newCompletedCount - prevCompletedCount;
    if(diff !== 0) {
        const xpChange = diff * 20; // 20 XP per task
        await updateDoc(doc(db, COLLECTIONS.USERS, currentUserData.uid), {
            points: Math.max(0, (currentUserData.points || 0) + xpChange)
        });
    }

    await setDoc(doc(db, COLLECTIONS.LOGS, logId), {
        ...logData,
        userId: currentUserData.uid,
        date: getTodayString()
    });
    showToast(`Log Saved.${diff > 0 ? ` +${diff * 20} XP` : ''}`);
  };

  if (isLoading) return (
      <div className={`min-h-screen ${THEME.bg} flex items-center justify-center text-white font-mono flex-col gap-4`}>
          <div className="flex items-center gap-1 text-xl tracking-widest">
              INITIALIZING SYSTEM
              <span className="animate-[pulse_1s_ease-in-out_infinite]">.</span>
              <span className="animate-[pulse_1s_ease-in-out_infinite_200ms]">.</span>
              <span className="animate-[pulse_1s_ease-in-out_infinite_400ms]">.</span>
          </div>
      </div>
  );
  if (!currentUserData) return <Login onLogin={handleLogin} existingUsers={usersData} />;

  const myHabits = habits.filter(h => h.userId === currentUserData.uid);
  const myLog = logs.find(l => l.userId === currentUserData.uid && l.date === getTodayString());

  return (
    <div className={`min-h-screen ${THEME.bg} text-[#EBEBEB] font-sans flex`}>
        <Toast message={toast.message} show={toast.show} />
        
        {/* Mobile Nav */}
        {isMobile ? (
            <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#111] border-t border-[#333] flex justify-around items-center z-50 pb-4">
                {['dashboard','habits','daily','calendar'].map(id => (
                    <button key={id} onClick={() => setView(id)} className={`flex flex-col items-center gap-1 transition-colors ${view === id ? 'text-white' : 'text-[#444]'}`}>
                        {id === 'dashboard' && <LayoutDashboard size={20}/>}
                        {id === 'habits' && <CheckCircle size={20}/>}
                        {id === 'daily' && <ListTodo size={20}/>}
                        {id === 'calendar' && <Calendar size={20}/>}
                        {view === id && <div className="w-1 h-1 bg-white rounded-full"/>}
                    </button>
                ))}
                <button onClick={() => setCurrentUserData(null)} className="flex flex-col items-center gap-1 text-[#444]"><LogOut size={20}/></button>
            </div>
        ) : (
            // Desktop Sidebar
            <div className="w-64 h-screen fixed left-0 top-0 bg-[#111] border-r border-[#333] p-6 flex flex-col">
                <h1 className="text-xl font-bold text-white mb-8 tracking-tighter uppercase">Gamified Life</h1>
                {['dashboard','habits','daily','calendar'].map(id => (
                    <button key={id} onClick={() => setView(id)} className={`flex items-center gap-3 px-4 py-3 mb-1 text-xs font-bold uppercase tracking-widest transition-all ${view === id ? 'bg-white text-black' : 'text-[#666] hover:bg-[#222] hover:text-white'}`}>
                        {id === 'dashboard' && <LayoutDashboard size={16} />}
                        {id === 'habits' && <CheckCircle size={16} />}
                        {id === 'daily' && <ListTodo size={16} />}
                        {id === 'calendar' && <Calendar size={16} />}
                        {id}
                    </button>
                ))}
                <div className="mt-auto">
                    <button onClick={() => setCurrentUserData(null)} className="flex items-center gap-3 px-4 py-3 text-[#666] hover:text-white text-xs font-bold uppercase tracking-widest"><LogOut size={16} /> Logout</button>
                </div>
            </div>
        )}

        {/* Content */}
        <div className={`flex-1 p-6 ${isMobile ? 'pb-24' : 'ml-64 p-12'}`}>
            {view === 'dashboard' && <Dashboard users={usersData} currentUser={currentUserData} setView={setView} />} 
            {view === 'habits' && <HabitTracker habits={myHabits} toggleHabit={toggleHabit} createHabit={createHabit} deleteHabit={deleteHabit} seedHabits={seedHabits} />}
            {view === 'daily' && <DailyLog currentUser={currentUserData} myLog={myLog} updateLog={updateLog} />}
            {view === 'calendar' && <CalendarView allLogs={logs} currentUser={currentUserData} />}
        </div>
    </div>
  );
}