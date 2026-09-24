import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, CheckCircle2, Clock, ShieldCheck, ArrowRight, User, Mail, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';
import { portfolioProfile, servicePlans, getCalendlyUrl } from '../data/portfolioData';
import { useScrollLock } from '../hooks/use-scroll-lock';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
}

const DEFAULT_SCHEDULE_OPTION = {
    dayKey: 'mardi',
    label: 'Mardi',
    date: 'Mardi 22 Sept.',
    hours: '08:00 - 12:00',
    slots: ['08:30 - 08:50', '09:30 - 09:50', '10:30 - 10:50', '11:15 - 11:35'],
};

const SCHEDULE_OPTIONS = [
  DEFAULT_SCHEDULE_OPTION,
  {
    dayKey: 'mercredi',
    label: 'Mercredi',
    date: 'Mercredi 23 Sept.',
    hours: '09:00 - 15:00',
    slots: ['09:30 - 09:50', '11:00 - 11:20', '13:00 - 13:20', '14:15 - 14:35'],
  },
  {
    dayKey: 'jeudi',
    label: 'Jeudi',
    date: 'Jeudi 24 Sept.',
    hours: '09:00 - 12:00',
    slots: ['09:15 - 09:35', '10:15 - 10:35', '11:00 - 11:20', '11:35 - 11:55'],
  },
];

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialPlan }) => {
  useScrollLock(isOpen);
  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan || 'Organisation Administrative');
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(DEFAULT_SCHEDULE_OPTION.slots[1] ?? DEFAULT_SCHEDULE_OPTION.slots[0] ?? '');
  const [step, setStep] = useState<'slot' | 'info' | 'success'>('slot');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan]);

  const currentDayConfig = SCHEDULE_OPTIONS[selectedDay] ?? DEFAULT_SCHEDULE_OPTION;

  useEffect(() => {
    if (currentDayConfig && !currentDayConfig.slots.includes(selectedSlot)) {
      setSelectedSlot(currentDayConfig.slots[0] ?? '');
    }
  }, [selectedDay, currentDayConfig]);

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRedirecting) return;
    setIsRedirecting(true);
    const details = [
      `Formule : ${selectedPlan}`,
      `Préférence : ${currentDayConfig.label}, ${selectedSlot}`,
      note.trim(),
    ].filter(Boolean).join(' — ');
    const url = getCalendlyUrl(selectedPlan, { name: name.trim(), email: email.trim(), note: details });
    window.location.assign(url);
  };

  const handleReset = () => {
    setStep('slot');
    setIsRedirecting(false);
    onClose();
  };

  const calendlyDirectUrl = getCalendlyUrl(selectedPlan, { name, email, note });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden sm:items-center sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            role="dialog"
            aria-modal="true"
            aria-label="Réserver un appel"
            className="relative z-10 max-h-[100dvh] w-full overflow-y-auto overscroll-contain rounded-t-2xl border border-[#E7DFD5] bg-[#FAF8F5] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-[#2D241E] shadow-2xl sm:my-auto sm:max-h-[92vh] sm:max-w-xl sm:rounded-3xl sm:p-8"
          >
            {/* Close button */}
            <button
              id="close-booking-modal-btn"
              onClick={onClose}
              className="sticky top-0 z-20 float-right grid h-10 w-10 place-items-center rounded-full bg-[#FAF8F5]/95 text-[#7A6C5E] shadow-sm backdrop-blur-sm hover:text-[#2C2723] hover:bg-[#EFE9E0] transition-colors cursor-pointer sm:absolute sm:top-5 sm:right-5"
              aria-label="Fermer la fenêtre"
            >
              <X className="w-5 h-5" />
            </button>

            {step === 'slot' && (
              <div className="clear-both sm:clear-none">
                <div className="flex items-start gap-2 pr-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#7A583E] mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#A87C51]" />
                  <span>Échange découverte • 20 minutes offertes</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#2D241E] tracking-tight">
                  Planifiez votre appel avec Candya
                </h3>
                <p className="text-xs sm:text-sm text-[#635345] mt-1 leading-relaxed">
                  20 minutes sans engagement pour faire le point sur votre boîte mail, votre suivi client ou vos factures et voir comment vous libérer du temps.
                </p>

                {/* Plan / Service selector */}
                <div className="mt-4">
                  <label className="text-xs font-bold text-[#473B30] uppercase tracking-wider block mb-2">
                    1. Formule ou sujet de l'appel
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {servicePlans.map((plan) => {
                      const isSelected = selectedPlan === plan.name;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlan(plan.name)}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#2D241E] text-white border-[#2D241E] shadow-xs'
                              : 'bg-white text-[#4A3F35] border-[#E8DFD3] hover:border-[#C4B3A1]'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className="block text-xs font-bold truncate">
                              {plan.name}
                            </span>
                            <span className={`block text-[10px] mt-0.5 truncate ${
                              isSelected ? 'text-[#D5C2B1]' : 'text-[#7A695B]'
                            }`}>
                              {plan.badge}
                            </span>
                          </div>
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-[#E0A97E] shrink-0" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[#E5DDD2] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Day selector */}
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center sm:justify-between mb-2">
                    <label className="text-xs font-bold text-[#473B30] uppercase tracking-wider block">
                      2. Choisissez le jour (Mar, Mer, Jeu)
                    </label>
                    <span className="w-fit text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      East Africa Time
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {SCHEDULE_OPTIONS.map((day, idx) => (
                      <button
                        key={day.dayKey}
                        type="button"
                        onClick={() => setSelectedDay(idx)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedDay === idx
                            ? 'bg-[#2D241E] text-white border-[#2D241E] shadow-xs'
                            : 'bg-white text-[#4A3F35] border-[#E8DFD3] hover:border-[#C4B3A1]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="block text-xs font-bold">{day.label}</span>
                          <span className={`text-[10px] font-medium ${selectedDay === idx ? 'text-[#D5C2B1]' : 'text-[#8A7969]'}`}>
                            {day.hours}
                          </span>
                        </div>
                        <span className="block text-[11px] opacity-80 mt-1">{day.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time slot selector */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#473B30] uppercase tracking-wider block">
                      3. Créneaux disponibles ({currentDayConfig.label} : {currentDayConfig.hours})
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentDayConfig.slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                          selectedSlot === slot
                            ? 'bg-[#A87C51] text-white border-[#A87C51] shadow-xs'
                            : 'bg-white text-[#4A3F35] border-[#E8DFD3] hover:border-[#C4B3A1]'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guarantees */}
                <div className="mt-5 p-3 rounded-xl bg-[#F0EAE0]/70 border border-[#E4D9CC] grid grid-cols-1 gap-2 sm:flex sm:items-center sm:justify-between text-[11px] text-[#635345]">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#7A583E]" />
                    <span>20 min chrono</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7A583E]" />
                    <span>100% offert & sans engagement</span>
                  </div>
                </div>

                {/* CTA Next */}
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#EAE2D7]">
                  <a
                    href={getCalendlyUrl(selectedPlan)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-w-full text-center text-xs text-[#7A583E] hover:underline font-semibold inline-flex items-center justify-center gap-1.5 break-words"
                  >
                    <span>Ouvrir sur Calendly ({selectedPlan})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    id="booking-next-step-btn"
                    type="button"
                    onClick={() => setStep('info')}
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#2D241E] hover:bg-[#3E3228] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Continuer avec ce créneau</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 'info' && (
              <form onSubmit={handleConfirmBooking}>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A583E] mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#A87C51]" />
                  <span>Étape finale • Vos coordonnées</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#2D241E] tracking-tight">
                  Confirmez votre créneau
                </h3>
                <div className="p-3 rounded-xl bg-white border border-[#E8DFD3] text-xs font-medium text-[#4A3F35] mt-2 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#2D241E]">🎯 {selectedPlan}</span>
                    <span className="text-[#C2B29F]">•</span>
                    <span>📅 {SCHEDULE_OPTIONS[selectedDay]?.date ?? DEFAULT_SCHEDULE_OPTION.date}</span>
                    <span className="text-[#C2B29F]">•</span>
                    <span>⏰ {selectedSlot}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep('slot')}
                    className="text-[#7A583E] hover:underline text-[11px] font-semibold text-left sm:text-right"
                  >
                    Modifier
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-[#473B30] block mb-1">
                      Votre nom & prénom *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8C7A68] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="booking-input-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Sophie Martin"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DCD1C4] text-xs sm:text-sm text-[#2D241E] focus:outline-hidden focus:border-[#7A583E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#473B30] block mb-1">
                      Votre adresse email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8C7A68] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="booking-input-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sophie@monbusiness.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DCD1C4] text-xs sm:text-sm text-[#2D241E] focus:outline-hidden focus:border-[#7A583E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#473B30] block mb-1">
                      Votre activité & ce qui vous pèse (optionnel)
                    </label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-[#8C7A68] absolute left-3.5 top-3" />
                      <textarea
                        id="booking-input-note"
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Ex: Coach business, 150 emails/jour à trier, retards de paiement..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#DCD1C4] text-xs sm:text-sm text-[#2D241E] focus:outline-hidden focus:border-[#7A583E]"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#EAE2D7]">
                  <button
                    type="button"
                    onClick={() => setStep('slot')}
                    className="px-4 py-2 text-xs font-semibold text-[#635345] hover:text-[#2D241E]"
                  >
                    ← Retour
                  </button>
                <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center">
                    <a
                      href={calendlyDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-4 py-3 rounded-full bg-[#FAF7F2] border border-[#DCD1C4] hover:bg-[#F2ECE2] text-[#473B30] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Calendly direct</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#7A583E]" />
                    </a>
                    <button
                      id="booking-submit-btn"
                      type="submit"
                       disabled={isRedirecting}
                       aria-busy={isRedirecting}
                       className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-[#2D241E] hover:bg-[#3E3228] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:cursor-wait disabled:opacity-70"
                    >
                       <span>{isRedirecting ? 'Ouverture de Calendly…' : 'Continuer sur Calendly'}</span>
                      <CheckCircle2 className="w-4 h-4 text-[#E0A97E]" />
                    </button>
                  </div>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#EBF5EA] text-[#2E7A33] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#2D241E]">
                  C'est réservé !
                </h3>
                <p className="text-xs sm:text-sm text-[#635345] max-w-md mx-auto leading-relaxed">
                  Merci {name || 'cher client'} ! Votre appel de découverte est programmé pour le{' '}
                  <strong className="text-[#2D241E]">{SCHEDULE_OPTIONS[selectedDay]?.date ?? DEFAULT_SCHEDULE_OPTION.date}</strong> à{' '}
                  <strong className="text-[#2D241E]">{selectedSlot}</strong>.
                </p>
                <div className="p-4 rounded-2xl bg-white border border-[#E7DFD5] text-xs text-[#5C4D3E] max-w-sm mx-auto text-left space-y-1.5 shadow-2xs">
                  <div><strong>Formule ciblée :</strong> <span className="text-[#A87C51] font-bold">{selectedPlan}</span></div>
                  <div><strong>Email :</strong> {email || 'Envoyé par email'}</div>
                  <div><strong>Format :</strong> Visioconférence Google Meet (20 min offertes)</div>
                  <div><strong>Objectif :</strong> Clarifier vos points de blocage et vos priorités</div>
                </div>

                {/* Direct Calendly confirmation bridge */}
                <div className="p-3.5 rounded-2xl bg-[#F8F4EE] border border-[#E8DFC8] text-xs text-[#635345] max-w-sm mx-auto">
                  <p className="mb-2.5 text-[11px] leading-relaxed">
                    Préférez-vous bloquer automatiquement le créneau sur votre compte Calendly avec ce plan ?
                  </p>
                  <a
                    href={calendlyDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#2D241E] text-white text-xs font-semibold hover:bg-[#3E3228] transition-colors"
                  >
                    <span>Ouvrir sur Calendly avec {selectedPlan}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#E0A97E]" />
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-full bg-white border border-[#DCD1C4] text-[#473B30] text-xs font-semibold hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    Retourner au portfolio
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
