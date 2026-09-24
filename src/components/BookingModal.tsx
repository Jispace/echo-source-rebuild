import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, CheckCircle2, Clock, ShieldCheck, ArrowRight, User, Mail, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';
import { servicePlans } from '../data/portfolioData';
import { useScrollLock } from '../hooks/use-scroll-lock';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const SLOT_MINUTES = 20;

/** Consecutive 20-minute slots between start and end hour (EAT). */
function makeSlots(startH: number, endH: number) {
  const out: string[] = [];
  for (let m = startH * 60; m + SLOT_MINUTES <= endH * 60; m += SLOT_MINUTES) {
    const e = m + SLOT_MINUTES;
    out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)} - ${pad(Math.floor(e / 60))}:${pad(e % 60)}`);
  }
  return out;
}

// Candya's weekly availability (East Africa Time, UTC+3). Key = weekday (2=Tue, 3=Wed, 4=Thu).
const WEEKLY_SLOTS: Record<number, { label: string; hours: string; slots: string[] }> = {
  2: { label: 'Mardi', hours: '08:00 - 12:00', slots: makeSlots(8, 12) },
  3: { label: 'Mercredi', hours: '09:00 - 15:00', slots: makeSlots(9, 15) },
  4: { label: 'Jeudi', hours: '09:00 - 12:00', slots: makeSlots(9, 12) },
};
const EAT_OFFSET_MS = 3 * 3600 * 1000;
const MONTHS = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];

interface DayOption { key: string; label: string; date: string; hours: string; slots: string[] }

/** Absolute timestamp (ms) for a slot start on an EAT calendar day. */
function slotStartMs(dayKey: string, slot: string) {
  const [h = 0, m = 0] = slot.slice(0, 5).split(":").map(Number);
  return Date.parse(`${dayKey}T${pad(h)}:${pad(m)}:00+03:00`);
}

/** Next working days (Tue/Wed/Thu) that still have at least one future slot. */
function buildUpcomingDays(nowMs: number, count = 3): DayOption[] {
  const days: DayOption[] = [];
  const eatNow = new Date(nowMs + EAT_OFFSET_MS);
  for (let i = 0; i < 28 && days.length < count; i++) {
    const d = new Date(Date.UTC(eatNow.getUTCFullYear(), eatNow.getUTCMonth(), eatNow.getUTCDate() + i));
    const cfg = WEEKLY_SLOTS[d.getUTCDay()];
    if (!cfg) continue;
    const key = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    const slots = cfg.slots.filter((s) => slotStartMs(key, s) > nowMs);
    if (!slots.length) continue;
    days.push({
      key,
      label: i === 0 ? "Aujourd'hui" : cfg.label,
      date: `${cfg.label} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`,
      hours: cfg.hours,
      slots,
    });
  }
  return days;
}

const CALENDLY_EVENT_URL = 'https://calendly.com/rancandya/appel-decouverte-candya';

/** Calendly link that opens directly on the chosen time slot, prefilled. */
function buildCalendlySlotUrl(dayKey: string, slot: string, info: { name?: string; email?: string; note?: string }) {
  const start = `${dayKey}T${slot.slice(0, 5)}:00+03:00`;
  const params = new URLSearchParams({ month: dayKey.slice(0, 7), date: dayKey });
  if (info.name) params.set('name', info.name);
  if (info.email) params.set('email', info.email);
  if (info.note) params.set('a1', info.note);
  params.set('utm_source', 'portfolio');
  return `${CALENDLY_EVENT_URL}/${start}?${params.toString()}`;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialPlan }) => {
  useScrollLock(isOpen);
  const [selectedPlan, setSelectedPlan] = useState<string>(initialPlan || 'Organisation Administrative');
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [selectedDayKey, setSelectedDayKey] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
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

  // Refresh "now" every 30s while open so past slots disappear in real time.
  useEffect(() => {
    if (!isOpen) return;
    setNowMs(Date.now());
    const id = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [isOpen]);

  const upcomingDays = React.useMemo(() => buildUpcomingDays(nowMs), [nowMs]);
  const currentDayConfig: DayOption | undefined =
    upcomingDays.find((d) => d.key === selectedDayKey) ?? upcomingDays[0];

  useEffect(() => {
    if (!currentDayConfig) return;
    if (currentDayConfig.key !== selectedDayKey) setSelectedDayKey(currentDayConfig.key);
    if (!currentDayConfig.slots.includes(selectedSlot)) setSelectedSlot(currentDayConfig.slots[0] ?? '');
  }, [currentDayConfig, selectedDayKey, selectedSlot]);

  const [sentMessage, setSentMessage] = useState('');

  const resetForm = () => {
    setStep('slot');
    setName('');
    setEmail('');
    setNote('');
    setSelectedDayKey('');
    setSelectedSlot('');
    setSelectedPlan(initialPlan || 'Organisation Administrative');
    setIsRedirecting(false);
  };

  const sendToCalendly = (info: { name?: string; email?: string; note?: string }) => {
    if (!currentDayConfig || !selectedSlot) return;
    if (slotStartMs(currentDayConfig.key, selectedSlot) <= Date.now()) {
      setNowMs(Date.now());
      return;
    }
    setIsRedirecting(true);
    const label = `${currentDayConfig.date} à ${selectedSlot.slice(0, 5)}`;
    const win = window.open(buildCalendlySlotUrl(currentDayConfig.key, selectedSlot, info), '_blank', 'noopener');
    if (!win) {
      window.location.assign(buildCalendlySlotUrl(currentDayConfig.key, selectedSlot, info));
      return;
    }
    resetForm();
    setSentMessage(`Créneau du ${label} envoyé sur Calendly. Confirmez-le dans l'onglet ouvert.`);
    window.setTimeout(() => setSentMessage(''), 6000);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRedirecting) return;
    const details = [`Formule : ${selectedPlan}`, note.trim()].filter(Boolean).join(' — ');
    sendToCalendly({ name: name.trim(), email: email.trim(), note: details });
  };

  const handleReset = () => {
    resetForm();
    setSentMessage('');
    onClose();
  };

  const calendlyLinkBtn = (
    <a
      href={CALENDLY_EVENT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full sm:w-auto px-5 py-3 rounded-full bg-white border border-[#DCD1C4] hover:bg-[#F2ECE2] text-[#473B30] text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
    >
      <span>Aller sur Calendly</span>
      <ExternalLink className="w-3.5 h-3.5 text-[#8F6544]" />
    </a>
  );

  const backToPortfolioBtn = (
    <button
      type="button"
      onClick={handleReset}
      className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-[#635345] hover:text-[#2D241E] underline-offset-2 hover:underline cursor-pointer"
    >
      ← Retour au portfolio
    </button>
  );

  const selectedDateLabel = currentDayConfig?.date ?? '';

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

            {sentMessage && (
              <div role="status" className="clear-both mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{sentMessage}</span>
              </div>
            )}

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
                      2. Choisissez le jour
                    </label>
                    <span className="text-[10px] font-medium text-[#7A695B]">
                      Aujourd'hui : {(() => { const d = new Date(nowMs + EAT_OFFSET_MS); return `${['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; })()}
                    </span>
                    <span className="w-fit text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      East Africa Time
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {upcomingDays.map((day) => (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => setSelectedDayKey(day.key)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          currentDayConfig?.key === day.key
                            ? 'bg-[#2D241E] text-white border-[#2D241E] shadow-xs'
                            : 'bg-white text-[#4A3F35] border-[#E8DFD3] hover:border-[#C4B3A1]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="block text-xs font-bold">{day.label}</span>
                          <span className={`text-[10px] font-medium ${currentDayConfig?.key === day.key ? 'text-[#D5C2B1]' : 'text-[#8A7969]'}`}>
                            {day.slots.length} créneau{day.slots.length > 1 ? 'x' : ''}
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
                      3. Créneaux disponibles {currentDayConfig ? `(${currentDayConfig.date})` : ''}
                    </label>
                  </div>
                  {upcomingDays.length === 0 && (
                    <p className="text-xs text-[#635345]">Aucun créneau disponible pour le moment.</p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(currentDayConfig?.slots ?? []).map((slot) => (
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
                <div className="mt-5 grid grid-cols-1 sm:flex sm:flex-wrap items-center justify-between gap-2 pt-4 border-t border-[#EAE2D7]">
                  <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
                    <button
                      id="booking-send-slot-btn"
                      type="button"
                      disabled={!selectedSlot || isRedirecting}
                      onClick={() => sendToCalendly({ note: `Formule : ${selectedPlan}` })}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#A87C51] hover:bg-[#8F6544] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                    >
                      <span>{isRedirecting ? 'Envoi…' : 'Envoyer'}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    {calendlyLinkBtn}
                  </div>
                  <button
                    id="booking-next-step-btn"
                    type="button"
                    disabled={!selectedSlot}
                    onClick={() => setStep('info')}
                    className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#2D241E] hover:bg-[#3E3228] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Ajouter mes coordonnées</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 flex justify-center">{backToPortfolioBtn}</div>
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
                    <span>📅 {selectedDateLabel}</span>
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
                    {calendlyLinkBtn}
                    <button
                      id="booking-submit-btn"
                      type="submit"
                       disabled={isRedirecting}
                       aria-busy={isRedirecting}
                       className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-[#2D241E] hover:bg-[#3E3228] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:cursor-wait disabled:opacity-70"
                    >
                       <span>{isRedirecting ? 'Envoi…' : 'Envoyer'}</span>
                      <CheckCircle2 className="w-4 h-4 text-[#E0A97E]" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex justify-center">{backToPortfolioBtn}</div>
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
                  <strong className="text-[#2D241E]">{selectedDateLabel}</strong> à{' '}
                  <strong className="text-[#2D241E]">{selectedSlot}</strong>.
                </p>
                <div className="p-4 rounded-2xl bg-white border border-[#E7DFD5] text-xs text-[#5C4D3E] max-w-sm mx-auto text-left space-y-1.5 shadow-2xs">
                  <div><strong>Formule ciblée :</strong> <span className="text-[#A87C51] font-bold">{selectedPlan}</span></div>
                  <div><strong>Email :</strong> {email || 'Envoyé par email'}</div>
                  <div><strong>Format :</strong> Visioconférence Google Meet (20 min offertes)</div>
                  <div><strong>Objectif :</strong> Clarifier vos points de blocage et vos priorités</div>
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
