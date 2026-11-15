import { ArrowRight, BadgeCheck, ClipboardCheck, Database, Hash, Lock, ScanText, Search, ShieldCheck, Shirt, Type, Upload, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { JerseyIllustration } from '../components/JerseyIllustration';
import { PublicNav } from '../components/PublicNav';
import { Button, ButtonLink, Eyebrow, Logo } from '../components/ui';
import { useAuth } from '../lib/auth';
import { navigate, scrollToId } from '../lib/router';

const floating: Array<{ icon: LucideIcon; title: string; text: string; pos: string; anim: string }> = [
  { icon: Hash, title: 'Jersey Number Detected', text: 'Back number read with OCR', pos: 'left-0 top-2', anim: 'animate-float' },
  { icon: Type, title: 'Printed Name Extracted', text: 'Name text above the number', pos: 'right-0 top-28', anim: 'animate-float-slow' },
  { icon: Users, title: 'Indian Team Roster Match', text: 'Compared with roster records', pos: 'left-0 bottom-28', anim: 'animate-float-slow' },
  { icon: ClipboardCheck, title: 'Verification Status', text: 'Manual verification recommended', pos: 'right-0 bottom-2', anim: 'animate-float' },
];

const features: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Hash, title: 'Jersey number detection', text: 'Reads the number printed on the back of a jersey using OCR on the uploaded image.' },
  { icon: Type, title: 'Printed name recognition', text: 'Extracts the player name printed above the number, when it is visible and legible.' },
  { icon: Users, title: 'Roster-based matching', text: 'Compares the extracted clues with Indian team roster records to suggest a possible player.' },
  { icon: ClipboardCheck, title: 'Verification first', text: 'Every result is a suggestion. Anything unclear is flagged for manual verification, never guessed.' },
  { icon: Database, title: 'Analysis history', text: 'Each analysis is saved to your account so results can be reviewed, searched and exported.' },
  { icon: Search, title: 'Player directory', text: 'Browse and filter roster records by player name, jersey number and playing role.' },
];

const steps = [
  { icon: Upload, title: 'Upload', text: 'Drop a JPG, PNG or WEBP cricket image.' },
  { icon: ScanText, title: 'Read text clues', text: 'OCR looks for a jersey number and printed name.' },
  { icon: Users, title: 'Match roster', text: 'Clues are compared with Indian team roster records.' },
  { icon: BadgeCheck, title: 'Verify', text: 'You review the evidence and confirm the result.' },
];

export default function Landing() {
  const { token } = useAuth();
  const start = () => navigate(token ? '/identify' : '/login');
  return (
    <div className="bg-hero min-h-screen">
      <PublicNav onLanding />

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-8 lg:grid-cols-2 lg:pb-24 lg:pt-20">
        <div className="animate-fade-up">
          <Eyebrow>AI-powered Indian cricket team identification</Eyebrow>
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Identify Indian Cricket Players <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">with AI</span></h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-mute sm:text-lg">Upload cricket match images and discover Indian cricket team members through jersey number detection, printed name recognition and roster-based matching.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={start} className="px-6"><Search className="size-4" aria-hidden /> Identify Player</Button>
            <Button variant="secondary" onClick={() => scrollToId('features')} className="px-6">Explore Features <ArrowRight className="size-4" aria-hidden /></Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-mute">
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-brand-400" aria-hidden /> No facial recognition</li>
            <li className="flex items-center gap-2"><Lock className="size-4 text-brand-400" aria-hidden /> Private account history</li>
            <li className="flex items-center gap-2"><ClipboardCheck className="size-4 text-brand-400" aria-hidden /> Manual verification built in</li>
          </ul>
        </div>

        <div className="animate-fade-up">
          <div className="relative mx-auto max-w-xl">
            <div className="absolute inset-8 rounded-full bg-brand-600/20 blur-3xl" aria-hidden />
            <div className="relative mx-auto w-60 py-8"><JerseyIllustration /></div>
            {/* Floating cards: pipeline stages only. They illustrate the workflow and are not detection results. */}
            <div className="hidden sm:block">
              {floating.map(({ icon: Icon, title, text, pos, anim }) => (
                <div key={title} className={`absolute ${pos} ${anim} w-44 rounded-xl border border-navy-500 bg-navy-800/95 p-3 shadow-xl shadow-black/30 backdrop-blur`}>
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-lg bg-navy-700 text-brand-400"><Icon className="size-4" aria-hidden /></span>
                    <div><b className="block text-[11px] leading-tight">{title}</b><small className="text-[10px] text-mute-2">{text}</small></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 sm:hidden">
              {floating.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-center gap-3 rounded-xl border border-navy-500 bg-navy-800 p-3">
                  <span className="grid size-8 place-items-center rounded-lg bg-navy-700 text-brand-400"><Icon className="size-4" aria-hidden /></span>
                  <div><b className="block text-xs">{title}</b><small className="text-[11px] text-mute-2">{text}</small></div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-mute-2">Illustration only – an illustrative jersey, not a real player or a real detection result.</p>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 border-t border-navy-600/50 bg-navy-900/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <Eyebrow>Features</Eyebrow>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight">Everything needed to go from match image to verified roster clue</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-navy-600 bg-navy-800 p-6 transition duration-200 hover:-translate-y-1 hover:border-brand-400/40">
                <span className="mb-4 grid size-11 place-items-center rounded-xl bg-navy-700 text-brand-400"><Icon className="size-5" aria-hidden /></span>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-3xl font-extrabold tracking-tight">Four steps, evidence at every stage</h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative rounded-2xl border border-navy-600 bg-navy-800 p-6">
                <span className="absolute right-5 top-4 text-4xl font-black text-navy-600" aria-hidden>{i + 1}</span>
                <span className="mb-4 grid size-11 place-items-center rounded-xl bg-navy-700 text-brand-400"><Icon className="size-5" aria-hidden /></span>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mute">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="responsible-ai" className="scroll-mt-20 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid items-center gap-8 rounded-3xl border border-navy-600 bg-gradient-to-br from-navy-800 to-navy-900 p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
            <div>
              <Eyebrow>Responsible AI</Eyebrow>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Identification from visible evidence – never from faces</h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mute">CricketVision AI does not use facial recognition or any biometric data. It only reads text that is visibly printed on a jersey and compares it with roster records. When no reliable number or name is found, the platform says <b className="text-ink-soft">“Player Not Identified – Manual Verification Required”</b> instead of guessing.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={start}>Identify Player</Button>
                <ButtonLink to="/directory" variant="secondary">Browse player directory</ButtonLink>
              </div>
            </div>
            <Shirt className="hidden size-28 text-navy-500 lg:block" aria-hidden />
          </div>
        </div>
      </section>

      <footer className="border-t border-navy-600/50 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-mute-2 sm:px-8">
          <Logo />
          <p>Final-year college project · Roster data shown is a labelled sample, not an official squad list.</p>
        </div>
      </footer>
    </div>
  );
}
