import React, { useState, useEffect } from 'react';
import { User, Plus, Edit3, Trash2, Download, Upload } from 'lucide-react';

import { StorageService, generateId } from '../utils/storage';
import type { UserProfile,FormData} from '../types';

const ProfileManager: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Load profiles on component mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    const loadedProfiles = StorageService.getProfiles();
    setProfiles(loadedProfiles);
  };

  const createEmptyProfile = (): UserProfile => ({
    id: generateId(),
    name: '',
    data: {
      fullName: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      company: '',
      jobTitle: '',
      workEmail: '',
      workPhone: '',
      dateOfBirth: '',
      gender: '',
      website: '',
      customFields: {}
    },
    createdAt: new Date(),
    lastUsed: new Date()
  });

  const handleSaveProfile = (profile: UserProfile) => {
    try {
      StorageService.saveProfile(profile);
      loadProfiles();
      setShowForm(false);
      setSelectedProfile(null);
      setIsEditing(false);
    } catch (error) {
      alert('Error saving profile: ' + error);
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        StorageService.deleteProfile(profileId);
        loadProfiles();
        if (selectedProfile?.id === profileId) {
          setSelectedProfile(null);
        }
      } catch (error) {
        alert('Error deleting profile: ' + error);
      }
    }
  };

  const handleExport = () => {
    const data = StorageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autofill-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (StorageService.importData(content)) {
          loadProfiles();
          alert('Data imported successfully!');
        } else {
          alert('Error importing data. Please check the file format.');
        }
      } catch (error) {
        alert('Error importing data: ' + error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="profile-manager">
      <div className="header">
        <h2>Autofill Profiles</h2>
        <div className="header-actions">
          <button onClick={() => { setSelectedProfile(createEmptyProfile()); setShowForm(true); setIsEditing(false); }}>
            <Plus size={16} /> New Profile
          </button>
          <button onClick={handleExport}>
            <Download size={16} /> Export
          </button>
          <label className="import-btn">
            <Upload size={16} /> Import
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div className="content">
        <div className="profiles-list">
          <h3>Saved Profiles ({profiles.length})</h3>
          {profiles.length === 0 ? (
            <p className="empty-state">No profiles saved yet. Create your first profile!</p>
          ) : (
            profiles.map(profile => (
              <div key={profile.id} className={`profile-item ${selectedProfile?.id === profile.id ? 'active' : ''}`}>
                <div className="profile-info" onClick={() => setSelectedProfile(profile)}>
                  <User size={16} />
                  <div>
                    <div className="profile-name">{profile.name || 'Unnamed Profile'}</div>
                    <div className="profile-email">{profile.data.email}</div>
                  </div>
                </div>
                <div className="profile-actions">
                  <button 
                    onClick={() => { setSelectedProfile(profile); setShowForm(true); setIsEditing(true); }}
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProfile(profile.id)}
                    title="Delete"
                    className="delete-btn"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedProfile && !showForm && (
          <div className="profile-details">
            <h3>Profile Details</h3>
            <div className="detail-section">
              <h4>Personal Information</h4>
              <div className="detail-grid">
                <div><strong>Full Name:</strong> {selectedProfile.data.fullName}</div>
                <div><strong>Email:</strong> {selectedProfile.data.email}</div>
                <div><strong>Phone:</strong> {selectedProfile.data.phone}</div>
                <div><strong>Date of Birth:</strong> {selectedProfile.data.dateOfBirth}</div>
              </div>
            </div>
            
            <div className="detail-section">
              <h4>Address</h4>
              <div className="detail-grid">
                <div><strong>Address:</strong> {selectedProfile.data.address}</div>
                <div><strong>City:</strong> {selectedProfile.data.city}</div>
                <div><strong>State:</strong> {selectedProfile.data.state}</div>
                <div><strong>Zip Code:</strong> {selectedProfile.data.zipCode}</div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Work Information</h4>
              <div className="detail-grid">
                <div><strong>Company:</strong> {selectedProfile.data.company}</div>
                <div><strong>Job Title:</strong> {selectedProfile.data.jobTitle}</div>
                <div><strong>Work Email:</strong> {selectedProfile.data.workEmail}</div>
                <div><strong>Work Phone:</strong> {selectedProfile.data.workPhone}</div>
              </div>
            </div>
          </div>
        )}

        {showForm && selectedProfile && (
          <ProfileForm
            profile={selectedProfile}
            isEditing={isEditing}
            onSave={handleSaveProfile}
            onCancel={() => { setShowForm(false); setSelectedProfile(null); }}
          />
        )}
      </div>
    </div>
  );
};

// Component form để edit profile
interface ProfileFormProps {
  profile: UserProfile;
  isEditing: boolean;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, isEditing, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Profile name is required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="profile-form">
      <h3>{isEditing ? 'Edit Profile' : 'New Profile'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h4>Profile Settings</h4>
          <div className="form-group">
            <label>Profile Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Personal, Work, etc."
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h4>Personal Information</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.data.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.data.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.data.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={formData.data.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Address</h4>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Address</label>
              <input
                type="text"
                value={formData.data.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={formData.data.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={formData.data.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                value={formData.data.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Work Information</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                value={formData.data.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                value={formData.data.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Work Email</label>
              <input
                type="email"
                value={formData.data.workEmail}
                onChange={(e) => handleInputChange('workEmail', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Work Phone</label>
              <input
                type="tel"
                value={formData.data.workPhone}
                onChange={(e) => handleInputChange('workPhone', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit">Save Profile</button>
        </div>
      </form>
    </div>
  );
};

export default ProfileManager;