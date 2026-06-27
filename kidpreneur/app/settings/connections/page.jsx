"use client";
import React, { useState } from 'react';
// import { useEffect } from 'react'; // unused
import Navbar from '../../components/Navbar';
// import { API_BASE } from '../../../lib/api'; // unused

const ConnectionsPage = () => {
  const [connections, setConnections] = useState([
    { id: 1, name: 'Google', connected: true },
    { id: 2, name: 'GitHub', connected: false },
    { id: 3, name: 'Twitter', connected: false },
    { id: 4, name: 'LinkedIn', connected: false },
  ]);

  const toggleConnection = (id) => {
    setConnections(connections.map(conn => 
      conn.id === id ? { ...conn, connected: !conn.connected } : conn
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="max-w-6xl mx-auto p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Connected Accounts</h1>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Social Accounts</h2>
            <div className="space-y-4">
              {connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <i className={`fa-brands fa-${connection.name.toLowerCase()} text-xl`}></i>
                    </div>
                    <span className="font-medium text-gray-800">{connection.name}</span>
                  </div>
                  <button
                    onClick={() => toggleConnection(connection.id)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      connection.connected 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {connection.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Link New Account</h2>
            <p className="text-gray-600 mb-6">Connect with other services to enhance your experience.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Facebook', 'Instagram', 'Discord', 'Slack'].map((service) => (
                <button
                  key={service}
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <i className={`fa-brands fa-${service.toLowerCase()} text-2xl text-gray-600`}></i>
                  <span className="text-sm font-medium text-gray-700">Connect {service}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;
