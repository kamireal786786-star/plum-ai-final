
import React, { useState, useEffect, useContext, useMemo } from 'react';
import * as settingsService from '../services/settingsService';
import { CalendarSettings, DaySchedule, DateExclusion } from '../services/settingsService';
import { GoogleAuthContext } from '../contexts/GoogleAuthContext';
import { GoogleIcon } from '../components/icons/GoogleIcon';
import * as configService from '../services/configService';
import * as googleApiService from '../services/googleApiService';
import { TroubleshootingGuide } from '../components/TroubleshootingGuide';
import * as calendarService from '../services/calendarService';
import { UpcomingMeeting } from '../services/calendarService';
import { CloseIcon } from '../components/icons/CloseIcon';
import * as adminAuthService from '../services/adminAuthService';

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

interface ApiStatus {
    calendar: VerificationStatus;
    gmail: VerificationStatus;
}

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// --- Sub-components for Admin Page ---

const UpcomingMeetingsList: React.FC<{ enabled: boolean }> = ({ enabled }) => {
    const [meetings, setMeetings] = useState<UpcomingMeeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) {
            setIsLoading(false);
            return;
        }

        const fetchMeetings = async () => {
            setIsLoading(true);
            setError(null);
            const result = await calendarService.getUpcomingMeetings();
            if (typeof result === 'string') {
                setError(result);
            } else {
                setMeetings(result);
            }
            setIsLoading(false);
        };

        fetchMeetings();
    }, [enabled]);
    
    if (!enabled) {
      return <p className="text-center text-gray-500 text-sm">Connect your Google Account to see upcoming meetings.</p>;
    }

    if (isLoading) {
        return <p className="text-center text-gray-400 animate-pulse">Loading upcoming meetings...</p>;
    }

    if (error) {
        return <p className="text-center text-red-400">{error}</p>;
    }

    if (meetings.length === 0) {
        return <p className="text-center text-gray-500 text-sm">No upcoming meetings found that were scheduled by PlumBot.</p>;
    }

    return (
        <ul className="space-y-3">
            {meetings.map(meeting => (
                <li key={meeting.id} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <p className="font-semibold text-white">{meeting.summary}</p>
                    <p className="text-sm text-gray-400">
                        {new Date(meeting.start).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {meeting.attendees.length > 0 && 
                      <p className="text-xs text-purple-400">{meeting.attendees[0].email}</p>
                    }
                </li>
            ))}
        </ul>
    );
};


const CalendarSettingsManager: React.FC<{ disabled: boolean }> = ({ disabled }) => {
    const [settings, setSettings] = useState<CalendarSettings>(settingsService.getCalendarSettings());
    const [saveStatus, setSaveStatus] = useState('');

    const [newExclusion, setNewExclusion] = useState<{ date: string, allDay: boolean, start: string, end: string }>({
        date: '', allDay: true, start: '09:00', end: '17:00'
    });

    const handleSave = () => {
        settingsService.saveCalendarSettings(settings);
        setSaveStatus('Settings saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const handleScheduleChange = (dayIndex: number, value: Partial<DaySchedule>) => {
        const newSchedule = [...settings.schedule];
        newSchedule[dayIndex] = { ...newSchedule[dayIndex], ...value };
        setSettings(s => ({ ...s, schedule: newSchedule }));
    };

    const handleAddExclusion = () => {
        if (!newExclusion.date) {
            alert("Please select a date for the exclusion.");
            return;
        }
        const exclusion: DateExclusion = {
            id: crypto.randomUUID(),
            ...newExclusion
        };
        setSettings(s => ({ ...s, exclusions: [...s.exclusions, exclusion] }));
        // Reset form
        setNewExclusion({ date: '', allDay: true, start: '09:00', end: '17:00' });
    };

    const handleRemoveExclusion = (id: string) => {
        setSettings(s => ({ ...s, exclusions: s.exclusions.filter(ex => ex.id !== id) }));
    };

    return (
        <fieldset disabled={disabled} className="space-y-8 disabled:opacity-50">
            {/* Weekly Schedule */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Weekly Availability</h3>
                <div className="space-y-4">
                    {WEEK_DAYS.map((day, index) => (
                        <div key={day} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 items-center gap-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                            <div className="flex items-center space-x-3 md:col-span-1">
                                <input
                                    type="checkbox"
                                    id={`day-toggle-${index}`}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                                    checked={settings.schedule[index].enabled}
                                    onChange={e => handleScheduleChange(index, { enabled: e.target.checked })}
                                />
                                <label htmlFor={`day-toggle-${index}`} className="font-medium text-gray-200">{day}</label>
                            </div>
                            <div className="sm:col-span-2 md:col-span-3 flex items-center gap-4">
                                <input
                                    type="time"
                                    value={settings.schedule[index].start}
                                    onChange={e => handleScheduleChange(index, { start: e.target.value })}
                                    disabled={!settings.schedule[index].enabled}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                                />
                                <span>-</span>
                                <input
                                    type="time"
                                    value={settings.schedule[index].end}
                                    onChange={e => handleScheduleChange(index, { end: e.target.value })}
                                    disabled={!settings.schedule[index].enabled}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

             {/* Exclusions */}
             <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Date & Time Exclusions</h3>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        <div className="sm:col-span-2 lg:col-span-1">
                             <label htmlFor="exclusion-date" className="block text-xs font-medium text-gray-400 mb-1">Date to Exclude</label>
                             <input type="date" id="exclusion-date" value={newExclusion.date} onChange={e => setNewExclusion(s => ({...s, date: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                        </div>
                        {!newExclusion.allDay && (
                            <div className="flex items-center gap-2">
                                <div>
                                    <label htmlFor="exclusion-start" className="block text-xs font-medium text-gray-400 mb-1">Start</label>
                                    <input type="time" id="exclusion-start" value={newExclusion.start} onChange={e => setNewExclusion(s => ({...s, start: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                                </div>
                                <div>
                                    <label htmlFor="exclusion-end" className="block text-xs font-medium text-gray-400 mb-1">End</label>
                                    <input type="time" id="exclusion-end" value={newExclusion.end} onChange={e => setNewExclusion(s => ({...s, end: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between col-span-full lg:col-span-1">
                             <div className="flex items-center space-x-2">
                                <input type="checkbox" id="all-day" checked={newExclusion.allDay} onChange={e => setNewExclusion(s => ({...s, allDay: e.target.checked}))} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500" />
                                <label htmlFor="all-day" className="text-sm text-gray-300">All day</label>
                            </div>
                            <button type="button" onClick={handleAddExclusion} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 text-sm">Add Exclusion</button>
                        </div>
                    </div>
                     {settings.exclusions.length > 0 && <hr className="border-gray-700"/>}
                    <ul className="space-y-2">
                        {settings.exclusions.map(ex => (
                            <li key={ex.id} className="flex justify-between items-center bg-gray-800/50 p-2 rounded">
                                <p className="text-sm text-gray-300">
                                    {ex.date}: {ex.allDay ? 'All Day' : `${ex.start} - ${ex.end}`}
                                </p>
                                <button onClick={() => handleRemoveExclusion(ex.id)} className="text-gray-500 hover:text-white"><CloseIcon className="w-4 h-4" /></button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Meeting Duration & Save */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                 <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Meeting Duration (minutes)</label>
                    <input
                        type="number"
                        id="duration"
                        min="1"
                        value={settings.meetingDuration}
                        onChange={e => setSettings(s => ({ ...s, meetingDuration: parseInt(e.target.value, 10) || 30 }))}
                        className="w-40 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <div className="flex items-center gap-4">
                     {saveStatus && <p className="text-green-400 text-sm">{saveStatus}</p>}
                     <button type="button" onClick={handleSave} className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed">
                        Save Calendar Settings
                    </button>
                </div>
            </div>
        </fieldset>
    );
};

const CredentialManager: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

    useEffect(() => {
        // Pre-fill the username field with the current username
        const creds = adminAuthService.getAdminCredentials();
        setNewUsername(creds.username);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: 'idle', message: '' });

        const currentCreds = adminAuthService.getAdminCredentials();
        
        if (currentPassword !== currentCreds.password) {
            setStatus({ type: 'error', message: 'Current password does not match.' });
            return;
        }

        if (newPassword && newPassword !== confirmNewPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }

        if (!newUsername.trim()) {
            setStatus({ type: 'error', message: 'Username cannot be empty.' });
            return;
        }

        // Use new password if provided, otherwise keep the old one
        const finalPassword = newPassword.trim() ? newPassword.trim() : currentCreds.password;
        adminAuthService.saveAdminCredentials(newUsername.trim(), finalPassword);

        setStatus({ type: 'success', message: 'Credentials updated successfully!' });
        // Clear password fields after successful update
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        
        setTimeout(() => setStatus({ type: 'idle', message: '' }), 4000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                <input type="password" id="current-password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <hr className="border-gray-700" />
            <div>
                <label htmlFor="new-username" className="block text-sm font-medium text-gray-300 mb-1">New Username</label>
                <input type="text" id="new-username" value={newUsername} onChange={e => setNewUsername(e.target.value)} required className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-1">New Password (leave blank to keep current)</label>
                <input type="password" id="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
             <div>
                <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                <input type="password" id="confirm-new-password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex items-center justify-between pt-2">
                <button type="submit" className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                    Update Credentials
                </button>
                 {status.type === 'success' && <p className="text-green-400 text-sm">{status.message}</p>}
                 {status.type === 'error' && <p className="text-red-400 text-sm">{status.message}</p>}
            </div>
        </form>
    );
};


const AdminPage: React.FC = () => {
    const [systemPrompt, setSystemPrompt] = useState('');
    const [promptSaveStatus, setPromptSaveStatus] = useState('');
    
    const [isConfigSaved, setIsConfigSaved] = useState(false);
    const [clientId, setClientId] = useState('');
    const [apiKey, setApiKey] = useState('');

    const { isLoggedIn, user, login, logout } = useContext(GoogleAuthContext);

    const [apiStatus, setApiStatus] = useState<ApiStatus>({ calendar: 'idle', gmail: 'idle' });
    const [apiError, setApiError] = useState<string | null>(null);
    const isVerifying = apiStatus.calendar === 'verifying' || apiStatus.gmail === 'verifying';
    const isApiVerified = apiStatus.calendar === 'success' && apiStatus.gmail === 'success';

    const currentStep = useMemo(() => {
        if (!isConfigSaved) return 1;
        if (!isApiVerified) return 2;
        if (!isLoggedIn) return 3;
        return 4; // All done
    }, [isConfigSaved, isApiVerified, isLoggedIn]);

    useEffect(() => {
        setSystemPrompt(settingsService.getSystemPrompt());
        const savedConfig = configService.getGoogleConfig();
        if (savedConfig) {
            setClientId(savedConfig.clientId);
            setApiKey(savedConfig.apiKey);
            setIsConfigSaved(true);
        }
    }, []);
    
    useEffect(() => {
        const verifyApis = async () => {
            if (isConfigSaved) {
                setApiStatus({ calendar: 'verifying', gmail: 'verifying' });
                setApiError(null);
                
                try {
                    await googleApiService.loadGapiService('calendar', 'v3');
                    setApiStatus(prev => ({ ...prev, calendar: 'success' }));
                } catch (calendarError: any) {
                    const errorMessage = calendarError instanceof Error ? calendarError.message : "An unknown error occurred.";
                    setApiError(errorMessage);
                    setApiStatus(prev => ({ ...prev, calendar: 'error' }));
                }
                 try {
                    await googleApiService.loadGapiService('gmail', 'v1');
                    setApiStatus(prev => ({ ...prev, gmail: 'success' }));
                } catch (gmailError: any) {
                    const errorMessage = gmailError instanceof Error ? gmailError.message : "An unknown error occurred.";
                    if (!apiError) setApiError(errorMessage);
                     setApiStatus(prev => ({ ...prev, gmail: 'error' }));
                }
            }
        };

        if(isConfigSaved) {
            verifyApis();
        }
    }, [isConfigSaved]);

    const handleSavePrompt = () => {
        settingsService.saveSystemPrompt(systemPrompt);
        setPromptSaveStatus('System prompt saved successfully!');
        setTimeout(() => setPromptSaveStatus(''), 3000);
    };
    
    const handleSaveConfig = () => {
        if (!clientId.trim() || !apiKey.trim()) {
            alert('Please provide both a Client ID and an API Key.');
            return;
        }
        configService.saveGoogleConfig({ clientId, apiKey });
        googleApiService.resetGapiInitialization();
        setIsConfigSaved(true);
    };

    const handleClearConfig = () => {
        logout();
        configService.clearGoogleConfig();
        googleApiService.resetGapiInitialization();
        setIsConfigSaved(false);
        setApiStatus({ calendar: 'idle', gmail: 'idle' });
        setApiError(null);
        setClientId('');
        setApiKey('');
    }

    const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
        <div className={`space-y-4 ${currentStep < number ? 'opacity-50' : ''}`}>
            <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${currentStep >= number ? 'bg-purple-600' : 'bg-gray-600'}`}>{number}</div>
                <h3 className="text-xl font-semibold">{title}</h3>
            </div>
            <div className="pl-11">{children}</div>
        </div>
    );

    return (
        <div className="container mx-auto px-6 pt-24 pb-12 sm:py-28 text-white">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 tracking-tight">Admin Settings</h1>
            
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Setup & Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-gray-800/50 p-6 sm:p-8 rounded-xl border border-gray-700/50 space-y-8">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold">Google Calendar & Gmail Integration</h2>
                            {isConfigSaved && (
                                <button onClick={handleClearConfig} className="text-sm text-gray-400 hover:text-white underline">
                                    Reset Configuration
                                </button>
                            )}
                        </div>
                        <Step number={1} title="Enter Configuration">
                            <fieldset disabled={isConfigSaved} className="space-y-4 disabled:opacity-50">
                                <p className="text-gray-400 text-sm">
                                    Provide your Google Cloud OAuth 2.0 Client ID and API Key.
                                    <a href="https://developers.google.com/workspace/guides/create-credentials" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline hover:text-purple-300 ml-1">
                                        Help
                                    </a>
                                </p>
                                <div>
                                    <label htmlFor="client-id" className="block text-sm font-medium text-gray-300 mb-1">Google OAuth Client ID</label>
                                    <input type="text" id="client-id" value={clientId} onChange={e => setClientId(e.target.value)} placeholder="xxxx.apps.googleusercontent.com" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                                <div>
                                    <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-1">Google API Key</label>
                                    <input type="password" id="api-key" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIzaSy..." className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                                {!isConfigSaved && (
                                    <button onClick={handleSaveConfig} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                                        Save & Verify
                                    </button>
                                )}
                            </fieldset>
                        </Step>
                        
                        {isConfigSaved && (
                            <Step number={2} title="Verify APIs">
                                {isVerifying && <p className="text-yellow-400 animate-pulse">Verifying API configuration...</p>}
                                {apiError && <p className="text-red-400">Verification failed.</p>}
                                {isApiVerified && <p className="text-green-400">✓ API configuration verified successfully.</p>}
                                {apiError && <TroubleshootingGuide error={apiError} />}
                            </Step>
                        )}
                        
                        <Step number={3} title="Connect Account">
                            {!isLoggedIn ? (
                                <>
                                    <p className="text-gray-400 text-sm">Connect your account to allow the chatbot to access your calendar.</p>
                                    <button onClick={login} disabled={!isApiVerified} className="inline-flex items-center space-x-3 bg-white text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                        <GoogleIcon className="w-5 h-5" />
                                        <span>Connect Google Account</span>
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center space-x-4">
                                        <img src={user?.picture} alt={user?.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-white">{user?.name}</p>
                                            <p className="text-sm text-gray-400">{user?.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={logout} className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors">Disconnect</button>
                                </div>
                            )}
                        </Step>
                    </div>

                    <div className="bg-gray-800/50 p-6 sm:p-8 rounded-xl border border-gray-700/50">
                        <h2 className="text-2xl font-bold mb-4">Calendar Settings</h2>
                        <p className="text-gray-400 mb-6">Define your working hours and meeting duration. The chatbot will only offer slots within these times that are free on your calendar and not excluded.</p>
                        <CalendarSettingsManager disabled={!isApiVerified || !isLoggedIn} />
                    </div>
                </div>

                {/* Right Column: Meetings & Prompt */}
                <div className="space-y-8">
                     <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                        <h2 className="text-xl font-bold mb-4">Upcoming Meetings</h2>
                        <UpcomingMeetingsList enabled={isLoggedIn && isApiVerified} />
                    </div>
                     <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                        <h2 className="text-xl font-bold mb-4">Security Settings</h2>
                        <CredentialManager />
                    </div>
                    <div className="bg-gray-800/50 p-6 sm:p-8 rounded-xl border border-gray-700/50">
                        <h2 className="text-2xl font-bold mb-4">Manage AI System Prompt</h2>
                        <p className="text-gray-400 mb-6 text-sm">This is the core instruction set for the AI. Modify its personality, goals, and knowledge here.</p>
                        <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={15} className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        <div className="mt-4 flex items-center justify-between">
                            <button onClick={handleSavePrompt} className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                                Save Prompt
                            </button>
                            {promptSaveStatus && <p className="text-green-400 text-sm">{promptSaveStatus}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;