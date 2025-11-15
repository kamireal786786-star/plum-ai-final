import React from 'react';

interface TroubleshootingGuideProps {
    error: string;
}

export const TroubleshootingGuide: React.FC<TroubleshootingGuideProps> = ({ error }) => {
    return (
        <div className="bg-red-900/40 p-4 rounded-lg border border-red-700/50 mt-4 text-red-300">
            <p className="font-bold mb-2">API Verification Failed</p>
            <p className="text-sm font-mono bg-red-900/50 p-2 rounded mb-4 whitespace-pre-wrap">{error}</p>

            <h4 className="font-semibold text-white mb-2">Common Causes & Solutions:</h4>
            <ol className="list-decimal list-inside space-y-3 text-sm">
                <li>
                    <strong className="text-white">API Not Enabled:</strong> The most common reason for this error is that the required APIs are not enabled in your Google Cloud project.
                    <div className="mt-1 pl-2">
                        <a href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 underline hover:text-purple-200">
                            → Enable the Google Calendar API
                        </a>
                        <br />
                        <a href="https://console.cloud.google.com/apis/library/gmail.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-purple-300 underline hover:text-purple-200">
                            → Enable the Gmail API
                        </a>
                    </div>
                </li>
                <li>
                    <strong className="text-white">API Key Restrictions:</strong> Your API Key might have restrictions that are blocking access.
                     <div className="mt-1 pl-2">
                        <p>For web applications, you may need to add an "HTTP referrer" to allow the URL of this app.</p>
                        <p>To test, you can temporarily remove all restrictions to see if that resolves the issue.</p>
                         <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-purple-300 underline hover:text-purple-200">
                            → Manage your API Key restrictions
                        </a>
                    </div>
                </li>
                 <li>
                    <strong className="text-white">Billing Not Enabled:</strong> Some Google Cloud services require a billing account to be linked to the project, even for free-tier usage.
                     <div className="mt-1 pl-2">
                         <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="text-purple-300 underline hover:text-purple-200">
                            → Check your project's billing status
                        </a>
                    </div>
                </li>
            </ol>
             <p className="text-xs mt-4 text-red-400">After making changes in your Google Cloud project, you may need to use the "Reset Configuration" button and re-enter your details.</p>
        </div>
    );
};
