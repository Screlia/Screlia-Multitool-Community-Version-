import React, { useState } from 'react';
import { X, MessageSquarePlus, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<'bug' | 'feature'>('feature');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmitted(true);
    
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      setEmail('');
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-theme-secondary/90 backdrop-blur-xl border border-theme rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-theme flex items-center justify-between bg-theme-primary/30">
              <h3 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-indigo-600" />
                Geri Bildirim Gönder
              </h3>
              <button onClick={onClose} className="text-theme-secondary hover:text-theme-primary hover:bg-theme-primary/50 p-1 rounded-full transition-all duration-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100/50 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-medium text-theme-primary">Teşekkürler!</h4>
                  <p className="text-theme-secondary">Geri bildiriminiz alındı, Screlia'yı geliştirmemize yardımcı olacak.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setType('feature')}
                      className={`p-3 text-sm font-medium rounded-xl border transition-all duration-300 ${
                        type === 'feature'
                          ? 'bg-indigo-50/50 border-indigo-200 text-indigo-700 shadow-sm'
                          : 'bg-theme-primary/50 border-theme text-theme-secondary hover:border-indigo-300 hover:bg-theme-primary hover:shadow-sm'
                      }`}
                    >
                      Özellik İsteği
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('bug')}
                      className={`p-3 text-sm font-medium rounded-xl border transition-all duration-300 ${
                        type === 'bug'
                          ? 'bg-red-50/50 border-red-200 text-red-700 shadow-sm'
                          : 'bg-theme-primary/50 border-theme text-theme-secondary hover:border-red-300 hover:bg-theme-primary hover:shadow-sm'
                      }`}
                    >
                      Hata Bildir
                    </button>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-sm font-medium text-theme-primary group-hover:text-indigo-600 transition-colors">Mesaj</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={type === 'feature' ? "Şunu görmek isterdim..." : "Şunu yaparken bir hata oluştu..."}
                      className="w-full p-3 bg-theme-primary/50 text-theme-primary border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32 transition-all duration-300 hover:bg-theme-primary hover:shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-sm font-medium text-theme-primary group-hover:text-indigo-600 transition-colors">E-posta (isteğe bağlı)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@eposta.com"
                      className="w-full p-3 bg-theme-primary/50 text-theme-primary border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-300 hover:bg-theme-primary hover:shadow-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Gönder"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
