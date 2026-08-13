import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BaseURL } from '../../../utils/BaseURL';
import toast from 'react-hot-toast';

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BaseURL}/auth/get-user`, { headers: { Authorization: `Bearer ${token}` } });
        const user = res.data.user;
        setContacts(user.emergencyContacts || []);
      } catch (err) {
        console.error('Failed to load user:', err);
        toast.error('Failed to load emergency contacts');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const addContact = () => {
    setContacts((s) => [...s, { contactType: 'trusted', name: '', phone: '' }]);
  };

  const updateAt = (idx, key, value) => {
    setContacts((s) => s.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));
  };

  const removeAt = (idx) => {
    setContacts((s) => s.filter((_, i) => i !== idx));
  };

  const save = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${BaseURL}/emergency/contacts`, { contacts }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Emergency contacts saved');
      setContacts(res.data.emergencyContacts || contacts);
    } catch (err) {
      console.error('Failed to save contacts', err);
      toast.error('Failed to save contacts');
    }
  };

  const callNumber = (phone) => {
    if (!phone) return toast.error('No phone number');
    window.location.href = `tel:${phone}`;
  };

  const copyShareLink = async () => {
    try {
      const url = window.location.href.replace(/\/settings.*$/, '/') + 'ride';
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied');
    } catch (e) {
      toast.error('Failed to copy share link');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Emergency Contacts</h2>
      <p className="mb-4 text-sm text-gray-600">Add trusted contacts we can notify in emergencies. You can also call them directly.</p>

      <div className="space-y-4">
        {contacts.map((c, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <select value={c.contactType} onChange={(e) => updateAt(idx, 'contactType', e.target.value)} className="p-2 border rounded">
              <option value="trusted">Trusted</option>
              <option value="police">Police</option>
            </select>
            <input value={c.name} onChange={(e) => updateAt(idx, 'name', e.target.value)} placeholder="Name" className="p-2 border rounded flex-1" />
            <input value={c.phone} onChange={(e) => updateAt(idx, 'phone', e.target.value)} placeholder="Phone" className="p-2 border rounded w-40" />
            <button onClick={() => callNumber(c.phone)} className="px-3 py-2 bg-green-500 text-white rounded">Call</button>
            <button onClick={() => removeAt(idx)} className="px-3 py-2 bg-red-500 text-white rounded">Remove</button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={addContact} className="px-4 py-2 bg-gray-200 rounded">Add Contact</button>
        <button onClick={save} className="px-4 py-2 bg-primaryPurple text-white rounded">Save</button>
        <button onClick={copyShareLink} className="px-4 py-2 bg-blue-500 text-white rounded">Copy Ride Share Link</button>
      </div>
    </div>
  );
}
