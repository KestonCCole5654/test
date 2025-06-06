import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  Save, 
  X, 
  Calendar, 
  Mail, 
  User, 
  Building2, 
  Phone, 
  MapPin,
  ChevronRight,
  Loader2,
  Upload,
  Trash2,
  LogOut,
  Shield,
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { LoadingSpinner } from '../../components/ui/loadingSpinner';

interface UserData {
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  lastLogin?: string;
  accountType?: string;
  phone?: string;
}

interface BusinessData {
  companyName: string;
  phone: string;
  address: string;
  email: string;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    name: "John Doe",
    email: "john.doe@example.com",
    avatarUrl: "",
    createdAt: "2024-01-15T08:00:00.000Z",
    lastLogin: "2024-01-20T10:30:00.000Z",
    accountType: "Free Beta User",
    phone: "+1 (555) 123-4567",
  });
  
  const [businessData, setBusinessData] = useState<BusinessData>({
    companyName: "Acme Corporation",
    phone: "+1 (555) 987-6543",
    address: "123 Business St, Suite 100, San Francisco, CA 94105",
    email: "contact@acme.com",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingBusiness, setIsUpdatingBusiness] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>("https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1");
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePhrase, setDeletePhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBusinessUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingBusiness(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsUpdatingBusiness(false);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDeleting(false);
    setShowDeleteModal(false);
    setDeletePhrase("");
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    setShowLogoUpload(true);
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Settings</h1>
            <p className="text-sm text-slate-600 mt-1">Manage your account and business information</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center sm:h-10 sm:w-10">
              <User className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb - Hidden on mobile */}
        <nav className="hidden sm:flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/dashboard" className="text-slate-500 hover:text-slate-700">Dashboard</a>
            </li>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <li className="text-slate-900 font-medium">Settings</li>
          </ol>
        </nav>

        <div className="space-y-6">
          {/* Account Profile Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div 
              className="p-4 sm:p-6 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('profile')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Account Profile</h2>
                    <p className="text-sm text-slate-600 hidden sm:block">Manage your personal information</p>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform sm:hidden ${activeSection === 'profile' ? 'rotate-90' : ''}`} />
              </div>
            </div>
            
            <div className={`${activeSection === 'profile' || window.innerWidth >= 640 ? 'block' : 'hidden'} border-t border-slate-200`}>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <User className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700">Full Name</p>
                      <p className="text-sm text-slate-900 truncate">{userData.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <Mail className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700">Email</p>
                      <p className="text-sm text-slate-900 truncate">{userData.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <Calendar className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700">Account Created</p>
                      <p className="text-sm text-slate-900">{formatDate(userData.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                    <Shield className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700">Account Type</p>
                      <p className="text-sm text-slate-900">{userData.accountType}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div 
              className="p-4 sm:p-6 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('business')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Business Details</h2>
                    <p className="text-sm text-slate-600 hidden sm:block">Configure your business information</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      setIsEditing(!isEditing);
                    }}
                    className="hidden sm:flex"
                  >
                    {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                  <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform sm:hidden ${activeSection === 'business' ? 'rotate-90' : ''}`} />
                </div>
              </div>
            </div>

            <div className={`${activeSection === 'business' || window.innerWidth >= 640 ? 'block' : 'hidden'} border-t border-slate-200`}>
              {/* Logo Section */}
              <div className="p-4 sm:p-6 border-b border-slate-200">
                <h3 className="text-base font-medium text-slate-900 mb-3">Company Logo</h3>
                <p className="text-sm text-slate-600 mb-4">Upload your company logo for invoices</p>
                
                {logoUrl && !showLogoUpload ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <img 
                      src={logoUrl} 
                      alt="Company Logo" 
                      className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg border border-slate-200 bg-white"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleRemoveLogo}>
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowLogoUpload(true)}>
                        <Upload className="h-4 w-4" />
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-2">Drop your logo here or click to upload</p>
                    <Button variant="outline" size="sm">Choose File</Button>
                  </div>
                )}
              </div>

              {/* Business Form */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:hidden">
                  <h3 className="text-base font-medium text-slate-900">Business Information</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      setIsEditing(!isEditing);
                    }}
                  >
                    {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>

                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                        <Building2 className="h-5 w-5 text-slate-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700">Company Name</p>
                          <p className="text-sm text-slate-900 truncate">{businessData.companyName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                        <Mail className="h-5 w-5 text-slate-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700">Business Email</p>
                          <p className="text-sm text-slate-900 truncate">{businessData.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                        <Phone className="h-5 w-5 text-slate-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700">Phone Number</p>
                          <p className="text-sm text-slate-900">{businessData.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 sm:col-span-2">
                        <MapPin className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-700">Address</p>
                          <p className="text-sm text-slate-900">{businessData.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBusinessUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label htmlFor="companyName" className="text-sm font-medium text-slate-700">Company Name *</label>
                      <Input
                        id="companyName"
                        value={businessData.companyName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusinessData(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="Your company name"
                        required
                      />
                      
                      <label htmlFor="businessEmail" className="text-sm font-medium text-slate-700">Business Email *</label>
                      <Input
                        id="businessEmail"
                        type="email"
                        value={businessData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusinessData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contact@example.com"
                        required
                      />
                      
                      <label htmlFor="businessPhone" className="text-sm font-medium text-slate-700">Phone Number</label>
                      <Input
                        id="businessPhone"
                        value={businessData.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusinessData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                      
                      <label htmlFor="businessAddress" className="text-sm font-medium text-slate-700">Address</label>
                      <Input
                        id="businessAddress"
                        value={businessData.address}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusinessData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Business St, Suite 100, City, State, ZIP"
                      />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isUpdatingBusiness}
                        className="w-full sm:w-auto"
                      >
                        {isUpdatingBusiness ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Terms & Privacy Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div 
              className="p-4 sm:p-6 cursor-pointer sm:cursor-default"
              onClick={() => toggleSection('legal')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Terms & Privacy</h2>
                    <p className="text-sm text-slate-600 hidden sm:block">Legal documents and policies</p>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform sm:hidden ${activeSection === 'legal' ? 'rotate-90' : ''}`} />
              </div>
            </div>

            <div className={`${activeSection === 'legal' || window.innerWidth >= 640 ? 'block' : 'hidden'} border-t border-slate-200`}>
              <div className="p-4 sm:p-6 space-y-3">
                <a
                  href="/legal?tab=terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700">Terms of Service</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>
                
                <a
                  href="/legal?tab=privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700">Privacy Policy</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <LogOut className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Account Actions</h2>
                  <p className="text-sm text-slate-600">Logout or manage your account</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleLogout} className="w-full sm:w-auto">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        style={{ display: showDeleteModal ? 'flex' : 'none' }}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Delete Account</h2>
          <p className="text-sm text-slate-700 mb-4">
            This action is irreversible. Your account and all associated data will be permanently deleted.
          </p>
          
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded border-slate-300" />
              Also delete all my invoices stored in Google Sheets
            </label>
          </div>

          <label htmlFor="deleteConfirm" className="text-sm font-medium text-slate-700">
            Type <strong>DELETE</strong> to confirm:
          </label>
          <Input
            id="deleteConfirm"
            value={deletePhrase}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeletePhrase(e.target.value)}
            placeholder="DELETE"
            autoFocus
          />

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deletePhrase !== "DELETE" || isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}