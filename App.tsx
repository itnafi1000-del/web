import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PartyCard from './components/PartyCard';
import AdminDashboard from './components/AdminDashboard';
import PublicResults from './components/PublicResults';
import { Party, ViewState } from './types';
import { ADMIN_PASSWORD } from './constants';
import { Lock, AlertCircle, Vote, Loader2, ArrowRight } from 'lucide-react';
import { fetchParties, castVote } from './services/partyService';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  // Application State
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Local storage check for UX (database has the real check)
  const [hasVoted, setHasVoted] = useState<boolean>(() => {
    return localStorage.getItem('has_voted_survey') === 'true';
  });

  const [view, setView] = useState<ViewState>(ViewState.VOTING);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState('');

  const loadParties = async () => {
    try {
      const data = await fetchParties();
      setParties(data);
    } catch (error) {
      console.error("Failed to load parties", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParties();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('public:parties')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parties' }, (payload) => {
        loadParties();
      })
      .subscribe();

    // Polling fallback: Refresh every 5 seconds to ensure counts are accurate
    // This satisfies the "refreshing every few seconds" requirement robustly
    const intervalId = setInterval(() => {
      loadParties();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

  const handleVote = async (id: string) => {
    // 1. Client-side check (fast)
    if (hasVoted) {
      alert("You have already participated in this survey locally.");
      return;
    }

    try {
      // 2. Server-side IP check & Vote
      await castVote(id);
      
      // 3. Success
      setParties(prev => prev.map(p => 
        p.id === id ? { ...p, voteCount: p.voteCount + 1 } : p
      ));
      setHasVoted(true);
      localStorage.setItem('has_voted_survey', 'true');
      alert("Vote successful! Redirecting to results...");
      setView(ViewState.RESULTS);

    } catch (error: any) {
      console.error("Error casting vote:", error);
      // Handle the "Already voted" error specifically if it comes from our service
      if (error.message.includes('already voted')) {
        alert("Our records show that a vote has already been cast from this internet connection.");
        setHasVoted(true);
        localStorage.setItem('has_voted_survey', 'true');
      } else {
        alert("There was a problem recording your vote. Please try again.");
      }
      loadParties();
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminInput === ADMIN_PASSWORD) {
      setView(ViewState.ADMIN_DASHBOARD);
      setAdminError('');
      setAdminInput('');
      loadParties();
    } else {
      setAdminError('Invalid access key');
    }
  };

  const handleLogout = () => {
    setView(ViewState.VOTING);
  };

  if (loading && parties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-green-600" />
          <p>Loading survey data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar currentView={view} setView={setView} />

      <main>
        {view === ViewState.VOTING && (
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight mb-4">
                13th National Parliament Survey
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-500">
                Participate in our democratic survey. Your voice matters. Select your preferred party below.
              </p>
              {hasVoted && (
                 <div className="flex flex-col items-center mt-6 gap-4">
                   <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 font-medium text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      You have already participated
                   </div>
                   <button 
                     onClick={() => setView(ViewState.RESULTS)}
                     className="flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                   >
                     View Live Results <ArrowRight className="w-4 h-4 ml-1" />
                   </button>
                 </div>
              )}
            </div>

            {parties.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Vote className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">The survey is not yet configured.</h3>
                    <p className="text-gray-500 mt-2">Please login to the Admin Panel to add political parties and start the survey.</p>
                    <button 
                        onClick={() => setView(ViewState.ADMIN_LOGIN)}
                        className="mt-6 text-blue-600 font-medium hover:text-blue-800 transition-colors"
                    >
                        Go to Admin Login
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {parties.map(party => (
                    <PartyCard 
                    key={party.id} 
                    party={party} 
                    onVote={handleVote} 
                    hasVoted={hasVoted}
                    />
                ))}
                </div>
            )}
          </div>
        )}

        {view === ViewState.RESULTS && (
          <PublicResults parties={parties} />
        )}

        {view === ViewState.ADMIN_LOGIN && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Lock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Access</h2>
              <p className="text-center text-gray-500 mb-8">Enter secure key to view analytics</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={adminInput}
                    onChange={(e) => setAdminInput(e.target.value)}
                    placeholder="Enter access key (hint: admin)"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                {adminError && (
                  <div className="flex items-center text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {adminError}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all transform hover:scale-[1.02]"
                >
                  Access Dashboard
                </button>
              </form>
            </div>
          </div>
        )}

        {view === ViewState.ADMIN_DASHBOARD && (
          <AdminDashboard parties={parties} onRefresh={loadParties} onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
};

export default App;