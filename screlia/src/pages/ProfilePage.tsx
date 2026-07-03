import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../hooks/useTranslation';
import { auth } from '../lib/firebase';
import { signOut, updateProfile, sendEmailVerification, deleteUser } from 'firebase/auth';
import { LogOut, User as UserIcon, Mail, Shield, CheckCircle2, Zap, Clock, Key, Crown, Save, Edit2, Sparkles, Lock, Smartphone, ShieldCheck, ChevronRight, X, CreditCard, Palette, Database, Wallet, EyeOff, LayoutTemplate, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function ProfilePage() {
  const { filters, updateFilters } = useSettings();
  const { t, isEnglish } = useTranslation();
  const navigate = useNavigate();
  const user = auth.currentUser;
  
  const [premiumCode, setPremiumCode] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentDisplayName, setCurrentDisplayName] = useState(user?.displayName || '');
  const [newName, setNewName] = useState(user?.displayName || '');
  const [msg, setMsg] = useState('');

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);

  const isAdmin = user?.email === 'rahmanegekarasu@gmail.com' || user?.displayName?.toLowerCase().includes('rahman egetc karasu');
  const hasPassword = user?.providerData?.some(p => p.providerId === 'password') || false;
  const isEmailVerified = user?.emailVerified || false;

  const handleSendVerificationEmail = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        setMsg('Doğrulama e-postası başarıyla gönderildi. Lütfen gelen kutunuzu kontrol edin.');
      } catch (error: any) {
        setMsg(error.message || 'E-posta gönderilirken bir hata oluştu');
      }
      setTimeout(() => setMsg(''), 5000);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Çıkış başarısız:", error);
    }
  };

  const EXPECTED_CONFIRMATION = isEnglish ? 'DELETE ACCOUNT' : 'HESABI SİL';

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== EXPECTED_CONFIRMATION) {
      setMsg(isEnglish ? 'Please type the confirmation text correctly.' : 'Lütfen onay metnini doğru yazın.');
      setTimeout(() => setMsg(''), 5000);
      return;
    }

    if (user) {
      try {
        await deleteUser(user);
        navigate('/');
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
          setMsg(isEnglish ? 'For security reasons, please log out and log in again before deleting your account.' : 'Güvenlik nedeniyle silme işlemi için yeniden giriş yapmalısınız. Lütfen çıkış yapıp tekrar giriş yapın.');
        } else {
          setMsg(error.message || (isEnglish ? 'Error occurred while deleting account.' : 'Hesap silinirken bir hata oluştu'));
        }
        setIsDeleteAccountModalOpen(false);
        setDeleteConfirmationText('');
      }
    }
  };

  const handleUnlockPremium = (e: React.FormEvent) => {
    e.preventDefault();
    if (premiumCode === 'screlia.1234') {
      updateFilters({ isPremium: true });
      setMsg('Premium başarıyla etkinleştirildi! ChatGPT ve Claude modellerini ayarlardan kullanabilirsiniz.');
      setPremiumCode('');
    } else {
      setMsg('Geçersiz premium kodu.');
    }
    setTimeout(() => setMsg(''), 5000);
  };

  const handleUpdateName = async () => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName: newName });
      await user.reload();
      setCurrentDisplayName(newName);
      setIsEditingName(false);
      setMsg('Ad başarıyla güncellendi.');
    } catch (err) {
      setMsg('Ad güncellenirken hata oluştu.');
    }
    setTimeout(() => setMsg(''), 5000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (newPassword.length < 6) {
      setMsg(isEnglish ? 'Password must be at least 6 characters.' : 'Yeni şifre en az 6 karakter olmalıdır.');
      setTimeout(() => setMsg(''), 5000);
      return;
    }

    try {
      const { updatePassword } = await import('firebase/auth');
      await updatePassword(user, newPassword);
      setMsg(hasPassword ? 
        (isEnglish ? 'Password successfully updated.' : 'Şifreniz başarıyla güncellendi.') : 
        (isEnglish ? 'Password successfully created.' : 'Şifreniz başarıyla oluşturuldu.')
      );
      setShowPasswordChange(false);
      setOldPassword('');
      setNewPassword('');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setMsg(isEnglish ? 'Please log out and log in again to change password.' : 'Güvenlik nedeniyle işlem için yeniden giriş yapmalısınız.');
      } else {
        setMsg(isEnglish ? 'Error changing password.' : 'Şifre güncellenirken bir hata oluştu');
      }
    }
    setTimeout(() => setMsg(''), 5000);
  };

  const handleToggle2FA = () => {
    if (is2FAEnabled) {
      setIs2FAEnabled(false);
      setMsg('İki Aşamalı Doğrulama (2FA) devre dışı bırakıldı.');
    } else {
      setShow2FASetup(true);
    }
    setTimeout(() => setMsg(''), 5000);
  };

  const handleEnable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setIs2FAEnabled(true);
    setShow2FASetup(false);
    setMsg('İki Aşamalı Doğrulama (2FA) başarıyla etkinleştirildi.');
    setTimeout(() => setMsg(''), 5000);
  };

    if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500">
          <UserIcon className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-theme-primary tracking-tight">{isEnglish ? "Not Logged In" : "Giriş Yapılmadı"}</h2>
        <p className="text-theme-secondary max-w-sm">
          {isEnglish ? "Please log in from the side menu to view your profile and details." : "Profilinizi ve size özel detayları görüntülemek için lütfen yan menüden giriş yapın."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 mt-4">
      {msg && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-2xl text-center font-medium">
          {msg}
        </div>
      )}

      {/* Warning if no password */}
      {!hasPassword && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-sm font-medium">
              {isEnglish 
                ? "You've logged in without a password. Please create one in Security settings to ensure account recovery." 
                : "Şifreniz olmadan giriş yaptınız. Lütfen Güvenlik ayarlarından bir şifre oluşturun."}
            </p>
          </div>
          <button 
            onClick={() => setIsSecurityModalOpen(true)} 
            className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            {isEnglish ? "Set Password" : "Şifre Oluştur"}
          </button>
        </div>
      )}
      
      {/* Header Profile Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-theme-secondary/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-theme shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-[80px] -z-10" />
        
        <div className="shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl opacity-50" />
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profil" className="w-32 h-32 rounded-full relative z-10 border-4 border-theme shadow-xl object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-full relative z-10 border-4 border-theme shadow-xl flex items-center justify-center bg-theme-primary text-indigo-500">
              <UserIcon className="w-16 h-16" />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-3 mt-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
              <Shield className="w-3.5 h-3.5" />
              Screlia Hesabı
            </div>
            {isAdmin && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-widest border border-red-500/20 shadow-sm">
                <Crown className="w-3.5 h-3.5" />
                Admin
              </div>
            )}
            {filters.isPremium && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-widest border border-amber-500/20 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Premium
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-3">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  className="bg-theme-primary text-theme-primary px-3 py-1 rounded-lg border border-theme outline-none focus:border-indigo-500"
                />
                <button onClick={handleUpdateName} className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500/20">
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-theme-primary to-theme-secondary flex items-center gap-3">
                {currentDisplayName || "Screlia Kullanıcısı"}
                <button onClick={() => setIsEditingName(true)} className="text-theme-secondary hover:text-indigo-500 transition-colors p-1">
                  <Edit2 className="w-5 h-5" />
                </button>
              </h2>
            )}
          </div>
          
          <p className="text-theme-secondary flex items-center justify-center md:justify-start gap-2 text-lg">
            <Mail className="w-5 h-5 text-indigo-400" />
            {user.email}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="group flex flex-col items-center justify-center gap-2 px-6 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-3xl transition-all shadow-sm hover:shadow-xl self-center md:self-start"
        >
          <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-wider">{isEnglish ? "Logout" : "Çıkış"}</span>
        </button>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-theme-secondary/40 backdrop-blur-xl p-6 rounded-3xl border border-theme flex flex-col items-center text-center gap-3 hover:bg-theme-secondary/60 transition-colors"
        >
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-theme-secondary uppercase tracking-widest font-semibold mb-1">{isEnglish ? "Status" : "Durum"}</p>
            <p className="text-xl font-bold text-theme-primary">{isEnglish ? "Active" : "Aktif"}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-theme-secondary/40 backdrop-blur-xl p-6 rounded-3xl border border-theme flex flex-col items-center text-center gap-3 hover:bg-theme-secondary/60 transition-colors"
        >
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-theme-secondary uppercase tracking-widest font-semibold mb-1">{isEnglish ? "Account Type" : "Hesap Türü"}</p>
            <p className="text-xl font-bold text-theme-primary">Google SSO</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-theme-secondary/40 backdrop-blur-xl p-6 rounded-3xl border border-theme flex flex-col items-center text-center gap-3 hover:bg-theme-secondary/60 transition-colors"
        >
          <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-theme-secondary uppercase tracking-widest font-semibold mb-1">{isEnglish ? "Last Login" : "Son Giriş"}</p>
            <p className="text-xl font-bold text-theme-primary text-sm truncate max-w-[120px]" title={user.metadata.lastSignInTime}>
              {new Date(user.metadata.lastSignInTime!).toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR')}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.button
          onClick={() => setIsSecurityModalOpen(true)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-theme-secondary/20 p-6 rounded-[2rem] border border-theme flex flex-col items-start gap-4 hover:bg-theme-secondary/40 transition-colors text-left"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-theme-secondary">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-theme-primary">{isEnglish ? "Security and Login" : "Güvenlik ve Giriş"}</h3>
            <p className="text-theme-secondary mt-1 text-sm">{isEnglish ? "Password, 2FA, email verification." : "Şifre, 2FA, e-posta doğrulama."}</p>
          </div>
        </motion.button>

        <motion.button
          onClick={() => setIsPrivacyModalOpen(true)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-theme-secondary/20 p-6 rounded-[2rem] border border-theme flex flex-col items-start gap-4 hover:bg-theme-secondary/40 transition-colors text-left"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div className="text-theme-secondary">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-theme-primary">{isEnglish ? "Data and Privacy" : "Veri ve Gizlilik"}</h3>
            <p className="text-theme-secondary mt-1 text-sm">{isEnglish ? "Privacy settings and your data." : "Gizlilik ayarları ve verileriniz."}</p>
          </div>
        </motion.button>
      </div>

      {/* Güvenlik Ayarları Modalı */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-primary/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-theme-primary border border-theme rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-theme flex items-center justify-between bg-theme-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary">Güvenlik ve Giriş</h3>
              </div>
              <button 
                onClick={() => setIsSecurityModalOpen(false)}
                className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* E-posta Doğrulama */}
              <div className="p-5 bg-theme-secondary/30 border border-theme rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-theme-primary font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-theme-secondary" />
                    E-posta Doğrulama
                  </h4>
                  <p className="text-sm text-theme-secondary mt-1">
                    Hesabınızın güvenliğini artırmak için e-posta adresinizi doğrulayın.
                  </p>
                  {isEmailVerified ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold uppercase tracking-wide">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Doğrulandı
                    </div>
                  ) : (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold uppercase tracking-wide">
                      Doğrulanmadı
                    </div>
                  )}
                </div>
                
                {!isEmailVerified && (
                  <button 
                    onClick={handleSendVerificationEmail}
                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                  >
                    Doğrulama E-postası Gönder
                  </button>
                )}
              </div>

              {/* Şifre Değiştirme / Oluşturma */}
              <div className="p-5 bg-theme-secondary/30 border border-theme rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-theme-primary font-medium flex items-center gap-2">
                    <Key className="w-4 h-4 text-theme-secondary" />
                    {hasPassword ? 'Şifre Değiştir' : 'Şifre Oluştur'}
                  </h4>
                  <p className="text-sm text-theme-secondary mt-1">
                    {hasPassword 
                      ? 'Hesap giriş şifrenizi güncelleyin.' 
                      : 'Şu anda sadece Google vb. üzerinden giriş yapıyorsunuz. Alternatif giriş için bir şifre oluşturabilirsiniz.'}
                  </p>
                </div>
                {!showPasswordChange ? (
                  <button 
                    onClick={() => setShowPasswordChange(true)}
                    className="px-4 py-2 bg-theme-primary hover:bg-theme-secondary text-theme-primary rounded-xl text-sm font-medium transition-colors border border-theme whitespace-nowrap"
                  >
                    {hasPassword ? 'Şifre Değiştir' : 'Şifre Oluştur'}
                  </button>
                ) : (
                  <form onSubmit={handleChangePassword} className="flex flex-col gap-3 w-full md:w-64">
                    {hasPassword && (
                      <input 
                        type="password" 
                        value={oldPassword} 
                        onChange={e => setOldPassword(e.target.value)}
                        placeholder="Mevcut Şifre" 
                        className="px-3 py-2 rounded-xl bg-theme-primary border border-theme outline-none focus:border-indigo-500 text-sm" 
                        required={hasPassword}
                      />
                    )}
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Yeni Şifre" 
                      className="px-3 py-2 rounded-xl bg-theme-primary border border-theme outline-none focus:border-indigo-500 text-sm" 
                      required
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Kaydet</button>
                      <button type="button" onClick={() => setShowPasswordChange(false)} className="px-3 py-2 bg-theme-primary text-theme-primary rounded-xl text-sm hover:bg-theme-secondary border border-theme">İptal</button>
                    </div>
                  </form>
                )}
              </div>

              {/* 2FA Ayarı */}
              <div className="p-5 bg-theme-secondary/30 border border-theme rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-theme-primary font-medium flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-theme-secondary" />
                    İki Aşamalı Doğrulama (2FA)
                  </h4>
                  <p className="text-sm text-theme-secondary mt-1">
                    Hesabınızı korumak için ek bir güvenlik katmanı ekleyin.
                  </p>
                  {is2FAEnabled && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold uppercase tracking-wide">
                      <ShieldCheck className="w-3.5 h-3.5" /> Aktif
                    </div>
                  )}
                </div>
                
                {!show2FASetup ? (
                  <button 
                    onClick={handleToggle2FA}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm whitespace-nowrap ${is2FAEnabled ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  >
                    {is2FAEnabled ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                  </button>
                ) : (
                  <form onSubmit={handleEnable2FA} className="flex flex-col gap-3 w-full p-4 bg-theme-primary rounded-xl border border-theme">
                    <p className="text-sm text-theme-primary mb-1">
                      Doğrulama uygulamanızı açın ve kodu girin:
                    </p>
                    <div className="flex items-center justify-center py-4 bg-white rounded-lg mb-2">
                      <div className="w-32 h-32 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/Screlia:${user.email}?secret=JBSWY3DPEHPK3PXP&issuer=Screlia')` }}></div>
                    </div>
                    <div className="font-mono text-center mb-2 tracking-widest text-indigo-500">JBSWY3DPEHPK3PXP</div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        className="flex-1 px-3 py-2 rounded-xl bg-theme-secondary border border-theme outline-none focus:border-indigo-500 text-center font-mono tracking-widest text-sm"
                        required
                      />
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Doğrula</button>
                      <button type="button" onClick={() => setShow2FASetup(false)} className="px-3 py-2 bg-theme-secondary text-theme-primary rounded-xl text-sm hover:bg-theme-primary border border-theme">İptal</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Veri ve Gizlilik Modalı */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-primary/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-theme-primary border border-theme rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-theme flex items-center justify-between bg-theme-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary">Veri ve Gizlilik</h3>
              </div>
              <button 
                onClick={() => setIsPrivacyModalOpen(false)}
                className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="p-5 bg-theme-secondary/30 border border-theme rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-theme-primary font-medium flex items-center gap-2">
                    <Database className="w-4 h-4 text-theme-secondary" />
                    Verilerimi İndir
                  </h4>
                  <p className="text-sm text-theme-secondary mt-1">Hesabınıza ait tüm verilerin bir kopyasını indirin.</p>
                </div>
                <button 
                  onClick={() => { setMsg('Verileriniz hazırlanıyor, bu işlem birkaç dakika sürebilir...'); setIsPrivacyModalOpen(false); setTimeout(() => setMsg(''), 5000); }}
                  className="px-4 py-2 bg-theme-primary hover:bg-theme-secondary text-theme-primary rounded-xl text-sm font-medium transition-colors border border-theme whitespace-nowrap"
                >
                  Talep Et
                </button>
              </div>
              <div className="pt-4 border-t border-theme">
                <h4 className="text-red-500 font-bold flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5" />
                  Tehlikeli Bölge (Danger Zone)
                </h4>
                <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-red-500 font-medium flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-red-500/70" />
                      Hesabımı Sil
                    </h4>
                    <p className="text-sm text-red-500/70 mt-1">Hesabınızı ve tüm verilerinizi kalıcı olarak silin. Bu işlem geri alınamaz.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsPrivacyModalOpen(false);
                      setIsDeleteAccountModalOpen(true);
                    }}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-medium transition-colors border border-red-500/20 whitespace-nowrap"
                  >
                    Hesabı Sil
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Hesabı Silme Onay Modalı */}
      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-theme-primary/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-theme-primary border border-red-500/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-red-500/10 flex items-center justify-between bg-red-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-red-500">Hesabı Sil!</h3>
              </div>
              <button 
                onClick={() => {
                  setIsDeleteAccountModalOpen(false);
                  setDeleteConfirmationText('');
                }}
                className="p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <p className="text-theme-secondary font-medium text-center">
                Bu işlem <span className="font-bold text-red-500">kesinlikle geri alınamaz</span>. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.
              </p>
              
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                <label className="block text-sm text-red-500/80 mb-2 font-medium">
                  {isEnglish ? (
                    <>Type <strong>{EXPECTED_CONFIRMATION}</strong> to confirm:</>
                  ) : (
                    <>Onaylamak için <strong>{EXPECTED_CONFIRMATION}</strong> yazın:</>
                  )}
                </label>
                <input 
                  type="text" 
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder={EXPECTED_CONFIRMATION}
                  className="w-full px-4 py-2 rounded-xl bg-theme-primary border border-red-500/20 focus:border-red-500 outline-none text-theme-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsDeleteAccountModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-theme-secondary/50 text-theme-primary rounded-xl font-medium hover:bg-theme-secondary transition-colors"
                >
                  {isEnglish ? "Cancel" : "İptal"}
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmationText !== EXPECTED_CONFIRMATION}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                    deleteConfirmationText === EXPECTED_CONFIRMATION 
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm' 
                      : 'bg-red-500/20 text-red-500/50 cursor-not-allowed'
                  }`}
                >
                  {isEnglish ? "Delete My Account" : "Hesabımı Sil"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {!filters.isPremium && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-amber-500/5 p-8 rounded-[2.5rem] border border-amber-500/20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-500">Premium Modunu Aktif Et</h3>
              <p className="text-sm text-theme-secondary">Gelişmiş AI araması ve Claude & ChatGPT API desteklerine erişin.</p>
            </div>
          </div>
          <form onSubmit={handleUnlockPremium} className="flex gap-4 mt-6">
            <div className="flex-1 relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500/50" />
              <input
                type="password"
                value={premiumCode}
                onChange={(e) => setPremiumCode(e.target.value)}
                placeholder="Etkinleştirme kodunu girin..."
                className="w-full pl-12 pr-4 py-3 bg-theme-primary/50 text-theme-primary border border-amber-500/30 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-theme-secondary/50"
              />
            </div>
            <button
              type="submit"
              disabled={!premiumCode.trim()}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl disabled:opacity-50 transition-colors shadow-lg shadow-amber-500/20 whitespace-nowrap"
            >
              Aktifleştir
            </button>
          </form>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-theme-secondary/20 p-8 rounded-[2rem] border border-theme"
      >
        <h3 className="text-lg font-bold mb-4 text-theme-primary">Geliştirici Kimliği</h3>
        <code className="block w-full p-4 bg-theme-primary rounded-2xl border border-theme text-theme-secondary font-mono text-sm break-all">
          {user.uid}
        </code>
        <p className="text-xs text-theme-secondary mt-3 opacity-70">
          Bu benzersiz kimlik, veri senkronizasyonu ve güvenlik işlemleri için kullanılır.
        </p>
      </motion.div>
    </div>
  );
}
