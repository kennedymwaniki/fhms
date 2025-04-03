import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon, Bell, Lock, Globe, Database,
  User, Mail, Save, Server, Shield, Sliders
} from 'lucide-react';
import DashboardHeader from '../../components/DashboardHeader';
import api from '../../api/config';

export default function Settings() {
  // System settings state
  const [generalSettings, setGeneralSettings] = useState({
    facilityName: 'Funeral Home Management System',
    contactEmail: 'admin@fhms.com',
    contactPhone: '+254 712 345 678',
    address: 'Nairobi, Kenya',
    currency: 'KSH',
    timeZone: 'Africa/Nairobi',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    documentAlerts: true,
    paymentAlerts: true,
    bookingAlerts: true,
    systemAlerts: true
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: 90, // days
    sessionTimeout: 30, // minutes
    minPasswordLength: 8,
    requirePasswordComplexity: true
  });

  // Data retention settings
  const [dataRetentionSettings, setDataRetentionSettings] = useState({
    logRetention: 90, // days
    archiveInactiveUsers: 365, // days
    backupFrequency: 'daily',
    backupRetention: 30 // days
  });

  const [loading, setLoading] = useState({
    general: false,
    notification: false,
    security: false,
    data: false
  });

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // In a real implementation, we would fetch settings from the backend
        // const response = await api.get('/settings');
        // setGeneralSettings(response.data.general);
        // setNotificationSettings(response.data.notifications);
        // setSecuritySettings(response.data.security);
        // setDataRetentionSettings(response.data.dataRetention);
        
        // For now, we're using the default state values
        console.log('Settings initialized with default values');
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      }
    };

    fetchSettings();
  }, []);

  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationSettingsChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSecuritySettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDataRetentionSettingsChange = (e) => {
    const { name, value } = e.target;
    setDataRetentionSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveGeneralSettings = async () => {
    setLoading(prev => ({ ...prev, general: true }));
    try {
      // In a real implementation, we would save settings to the backend
      // await api.put('/settings/general', generalSettings);
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('General settings saved successfully');
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast.error('Failed to save general settings');
    } finally {
      setLoading(prev => ({ ...prev, general: false }));
    }
  };

  const saveNotificationSettings = async () => {
    setLoading(prev => ({ ...prev, notification: true }));
    try {
      // In a real implementation, we would save settings to the backend
      // await api.put('/settings/notifications', notificationSettings);
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setLoading(prev => ({ ...prev, notification: false }));
    }
  };

  const saveSecuritySettings = async () => {
    setLoading(prev => ({ ...prev, security: true }));
    try {
      // In a real implementation, we would save settings to the backend
      // await api.put('/settings/security', securitySettings);
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Security settings saved successfully');
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast.error('Failed to save security settings');
    } finally {
      setLoading(prev => ({ ...prev, security: false }));
    }
  };

  const saveDataRetentionSettings = async () => {
    setLoading(prev => ({ ...prev, data: true }));
    try {
      // In a real implementation, we would save settings to the backend
      // await api.put('/settings/data-retention', dataRetentionSettings);
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Data retention settings saved successfully');
    } catch (error) {
      console.error('Error saving data retention settings:', error);
      toast.error('Failed to save data retention settings');
    } finally {
      setLoading(prev => ({ ...prev, data: false }));
    }
  };

  const runBackup = async () => {
    try {
      toast.loading('Initiating system backup...');
      
      // In a real implementation, we would trigger a backup API endpoint
      // await api.post('/system/backup');
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.dismiss();
      toast.success('System backup initiated. You will be notified when it completes.');
    } catch (error) {
      console.error('Error running backup:', error);
      toast.error('Failed to initiate system backup');
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <DashboardHeader 
        pageTitle="System Settings"
        actions={
          <button
            onClick={runBackup}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Database className="w-4 h-4 mr-2" />
            Run Backup
          </button>
        }
      />

      {/* Settings Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8 px-6 overflow-x-auto">
            <a
              href="#general"
              className="border-primary-500 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              General
            </a>
            <a
              href="#notifications"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Notifications
            </a>
            <a
              href="#security"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Security
            </a>
            <a
              href="#data-retention"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Data Retention
            </a>
          </nav>
        </div>
      </div>

      {/* General Settings */}
      <div id="general" className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <SettingsIcon className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Configure basic system information and preferences
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
          <div>
            <label htmlFor="facilityName" className="block text-sm font-medium text-gray-700">
              Facility Name
            </label>
            <input
              type="text"
              name="facilityName"
              id="facilityName"
              value={generalSettings.facilityName}
              onChange={handleGeneralSettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              id="contactEmail"
              value={generalSettings.contactEmail}
              onChange={handleGeneralSettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
              Contact Phone
            </label>
            <input
              type="text"
              name="contactPhone"
              id="contactPhone"
              value={generalSettings.contactPhone}
              onChange={handleGeneralSettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={generalSettings.address}
              onChange={handleGeneralSettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              name="currency"
              id="currency"
              value={generalSettings.currency}
              onChange={handleGeneralSettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="KSH">Kenya Shilling (KSH)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="GBP">British Pound (GBP)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700">
              Time Zone
            </label>
            <select
              name="timeZone"
              id="timeZone"
              value={generalSettings.timeZone}
              onChange={handleGeneralSettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="Africa/Nairobi">East Africa Time (EAT) - Nairobi</option>
              <option value="UTC">Coordinated Universal Time (UTC)</option>
              <option value="America/New_York">Eastern Time (ET) - New York</option>
              <option value="Europe/London">Greenwich Mean Time (GMT) - London</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
              Date Format
            </label>
            <select
              name="dateFormat"
              id="dateFormat"
              value={generalSettings.dateFormat}
              onChange={handleGeneralSettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700">
              Time Format
            </label>
            <select
              name="timeFormat"
              id="timeFormat"
              value={generalSettings.timeFormat}
              onChange={handleGeneralSettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={saveGeneralSettings}
            disabled={loading.general}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {loading.general ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save General Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div id="notifications" className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Configure how and when system notifications are sent
          </p>
        </div>
        <div className="p-6 space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-base font-medium text-gray-900">Notification Methods</legend>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="emailNotifications"
                  name="emailNotifications"
                  type="checkbox"
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationSettingsChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="emailNotifications" className="font-medium text-gray-700">Email Notifications</label>
                <p className="text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="smsNotifications"
                  name="smsNotifications"
                  type="checkbox"
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  checked={notificationSettings.smsNotifications}
                  onChange={handleNotificationSettingsChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="smsNotifications" className="font-medium text-gray-700">SMS Notifications</label>
                <p className="text-gray-500">Receive notifications via SMS (carrier charges may apply)</p>
              </div>
            </div>
          </fieldset>
          
          <fieldset className="space-y-4">
            <legend className="text-base font-medium text-gray-900">Notification Events</legend>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="documentAlerts"
                  name="documentAlerts"
                  type="checkbox"
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  checked={notificationSettings.documentAlerts}
                  onChange={handleNotificationSettingsChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="documentAlerts" className="font-medium text-gray-700">Document Alerts</label>
                <p className="text-gray-500">Notifications about document uploads and status changes</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="paymentAlerts"
                  name="paymentAlerts"
                  type="checkbox"
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  checked={notificationSettings.paymentAlerts}
                  onChange={handleNotificationSettingsChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="paymentAlerts" className="font-medium text-gray-700">Payment Alerts</label>
                <p className="text-gray-500">Notifications about payments and invoices</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="bookingAlerts"
                  name="bookingAlerts"
                  type="checkbox"
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  checked={notificationSettings.bookingAlerts}
                  onChange={handleNotificationSettingsChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="bookingAlerts" className="font-medium text-gray-700">Booking Alerts</label>
                <p className="text-gray-500">Notifications about new and updated service bookings</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="systemAlerts"
                  name="systemAlerts"
                  type="checkbox"
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  checked={notificationSettings.systemAlerts}
                  onChange={handleNotificationSettingsChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="systemAlerts" className="font-medium text-gray-700">System Alerts</label>
                <p className="text-gray-500">Important system notifications and updates</p>
              </div>
            </div>
          </fieldset>
        </div>
        <div className="px-6 py-3 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={saveNotificationSettings}
            disabled={loading.notification}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {loading.notification ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div id="security" className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Lock className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Configure security and authentication options
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
          <div className="col-span-full">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="twoFactorAuth"
                  name="twoFactorAuth"
                  type="checkbox"
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  checked={securitySettings.twoFactorAuth}
                  onChange={handleSecuritySettingsChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="twoFactorAuth" className="font-medium text-gray-700">Two-Factor Authentication</label>
                <p className="text-gray-500">Require two-factor authentication for all admin users</p>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="passwordExpiry" className="block text-sm font-medium text-gray-700">
              Password Expiry (Days)
            </label>
            <input
              type="number"
              name="passwordExpiry"
              id="passwordExpiry"
              min="0"
              max="365"
              value={securitySettings.passwordExpiry}
              onChange={handleSecuritySettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Set to 0 to disable password expiry</p>
          </div>
          
          <div>
            <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
              Session Timeout (Minutes)
            </label>
            <input
              type="number"
              name="sessionTimeout"
              id="sessionTimeout"
              min="5"
              max="1440"
              value={securitySettings.sessionTimeout}
              onChange={handleSecuritySettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="minPasswordLength" className="block text-sm font-medium text-gray-700">
              Minimum Password Length
            </label>
            <input
              type="number"
              name="minPasswordLength"
              id="minPasswordLength"
              min="6"
              max="32"
              value={securitySettings.minPasswordLength}
              onChange={handleSecuritySettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          <div className="col-span-full">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="requirePasswordComplexity"
                  name="requirePasswordComplexity"
                  type="checkbox"
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  checked={securitySettings.requirePasswordComplexity}
                  onChange={handleSecuritySettingsChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="requirePasswordComplexity" className="font-medium text-gray-700">Require Password Complexity</label>
                <p className="text-gray-500">Passwords must contain uppercase, lowercase, numbers, and special characters</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={saveSecuritySettings}
            disabled={loading.security}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {loading.security ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Security Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Data Retention Settings */}
      <div id="data-retention" className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Database className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-lg font-medium text-gray-900">Data Retention Settings</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Configure how long data is stored and backup policies
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
          <div>
            <label htmlFor="logRetention" className="block text-sm font-medium text-gray-700">
              Log Retention (Days)
            </label>
            <input
              type="number"
              name="logRetention"
              id="logRetention"
              min="30"
              max="365"
              value={dataRetentionSettings.logRetention}
              onChange={handleDataRetentionSettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="archiveInactiveUsers" className="block text-sm font-medium text-gray-700">
              Archive Inactive Users (Days)
            </label>
            <input
              type="number"
              name="archiveInactiveUsers"
              id="archiveInactiveUsers"
              min="90"
              max="730"
              value={dataRetentionSettings.archiveInactiveUsers}
              onChange={handleDataRetentionSettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700">
              Backup Frequency
            </label>
            <select
              name="backupFrequency"
              id="backupFrequency"
              value={dataRetentionSettings.backupFrequency}
              onChange={handleDataRetentionSettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="backupRetention" className="block text-sm font-medium text-gray-700">
              Backup Retention (Days)
            </label>
            <input
              type="number"
              name="backupRetention"
              id="backupRetention"
              min="7"
              max="365"
              value={dataRetentionSettings.backupRetention}
              onChange={handleDataRetentionSettingsChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={saveDataRetentionSettings}
            disabled={loading.data}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {loading.data ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Data Retention Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}