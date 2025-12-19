// Flameoff – Full-Stack Web App (Supabase Backend, Auto Tables)
// Stack: React + Supabase (Auth, Database, Storage)
// UI: Futuristic dark, iOS 19 liquid-glass (glassmorphism)

import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

/* ================= SUPABASE CONFIG ================= */
const SUPABASE_URL = https://vsbljqiqqesutewblfhj.supabase.co';
const SUPABASE_ANON_KEY = sb_publishable_74ABbVMh5u4A06BrF_NHWw_3d6I6PfT';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ================= MAIN APP ================= */
export default function FlameoffApp() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.session();
    setUser(session?.user ?? null);
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <Navbar user={user} />
      <PublicHome />
      {!user && <Auth />}
      {user && <Home user={user} />}
    </div>
  );
}

/* ================= NAVBAR ================= */
function Navbar({ user }) {
  return (
    <nav className="flex justify-between px-6 py-4 backdrop-blur-xl bg-white/5 border-b border-white/10">
      <h1 className="text-xl font-bold">🔥 Flameoff</h1>
      <div className="space-x-4 text-sm">
        <a>Home</a>
        <a>Gaming</a>
        <a>Netflix</a>
        <a>Tech & AI</a>
        <a>Fashion</a>
        <a>Life Hacks</a>
        <a>Blog</a>
        <a>Workspace</a>
        {!user && <span className="opacity-70">(Browse without login)</span>}
      </div>
    </nav>
  );
}

/* ================= AUTH ================= */
function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);

    // Automatically add user to users table
    await supabase.from('users').insert([{ id: user.id, email: user.email, role: 'free' }]);
    alert('Signup successful!');
  };

  const login = async () => {
    const { user, error } = await supabase.auth.signIn({ email, password });
    if (error) return alert(error.message);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-xl w-80">
        <h2 className="text-lg mb-4">Join Flameoff</h2>
        <input className="w-full mb-2 p-2 rounded bg-black/40" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full mb-4 p-2 rounded bg-black/40" placeholder="Password" type="password" onChange={(e)=>setPassword(e.target.value)} />
        <button onClick={signup} className="w-full mb-2 bg-white/20 p-2 rounded">Sign Up</button>
        <button onClick={login} className="w-full bg-white/10 p-2 rounded">Login</button>
      </div>
    </div>
  );
}

/* ================= PUBLIC HOME ================= */
function PublicHome() {
  return (
    <div className="p-8">
      <Sections />
    </div>
  );
}

/* ================= HOME ================= */
function Home({ user }) {
  return (
    <div className="p-8">
      <WelcomeVideo />
      <Sections />
      <Workspace user={user} />
    </div>
  );
}

/* ================= WELCOME VIDEO ================= */
function WelcomeVideo() {
  const [file, setFile] = useState(null);

  const uploadVideo = async () => {
    if (!file) return;
    const { data, error } = await supabase.storage.from('welcome').upload('video.mp4', file, { cacheControl: '3600', upsert: true });
    if (error) return alert(error.message);
    alert('Welcome video uploaded successfully!');
  };

  return (
    <div className="mb-8 bg-white/5 p-4 rounded-xl">
      <h3 className="mb-2">Welcome Video (Admin)</h3>
      <input type="file" accept="video/*" onChange={(e)=>setFile(e.target.files[0])} />
      <button onClick={uploadVideo} className="ml-2 bg-white/20 p-2 rounded">Upload</button>
    </div>
  );
}

/* ================= SECTIONS ================= */
function Sections() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card title="🎮 Gaming" />
      <Card title="🎬 Netflix Movies & Series" link="https://netflix.com" />
      <Card title="🤖 Tech & AI" />
      <Card title="👗 Fashion" />
      <Card title="💡 Life Hacks" />
      <Card title="📚 Learning" link="https://youtube.com" />
      <Card title="🛒 Marketplace" />
    </div>
  );
}

function Card({ title, link }) {
  return (
    <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-xl hover:bg-white/20 transition">
      <h3>{title}</h3>
      {link && <a href={link} target="_blank" className="text-sm opacity-70">Open</a>}
    </div>
  );
}

/* ================= WORKSPACE ================= */
function Workspace({ user }) {
  const [role, setRole] = useState('free');
  const [secret, setSecret] = useState('');
  const [post, setPost] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchRole = async () => {
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (data) setRole(data.role);
    };
    fetchRole();
  }, [user]);

  const unlockAdmin = async () => {
    if (secret !== 'flamonade') return;
    await supabase.from('users').update({ role: 'admin' }).eq('id', user.id);
    setRole('admin');
  };

  const uploadPost = async () => {
    if (!post) return;
    await supabase.from('posts').insert([{ text: post, user_id: user.id }]);
    setPost('');
  };

  return (
    <div className="mt-10 bg-white/5 p-6 rounded-2xl">
      <h2 className="text-xl mb-2">Workspace</h2>

      {role === 'free' && <p>Free member – view only</p>}

      {role === 'premium' && (
        <div>
          <textarea className="w-full bg-black/40 p-2 rounded" placeholder="Upload post" value={post} onChange={(e)=>setPost(e.target.value)} />
          <button onClick={uploadPost} className="mt-2 bg-white/20 p-2 rounded">Post</button>
        </div>
      )}

      {role === 'admin' && <p className="text-red-400">Admin portfolio & content control</p>}

      <div className="mt-4">
        <input className="p-2 bg-black/40 rounded" placeholder="Admin code" onChange={(e)=>setSecret(e.target.value)} />
        <button onClick={unlockAdmin} className="ml-2 p-2 bg-white/20 rounded">Unlock</button>
      </div>
    </div>
  );
}
