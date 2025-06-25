import { effectsList } from '@/app/audio-forge/effects';
import { EffectCard } from './EffectCard';

// You may need to adjust these props to match your actual handlers and state
export function EffectsPanel(props) {
  return (
    <div>
      {/* Anchor Navigation */}
      <nav className="mb-6 sticky top-0 z-10 bg-background">
        <ul className="flex flex-wrap gap-2">
          {effectsList.map(effect => (
            <li key={effect.id}>
              <a href={`#${effect.id}`} className="underline text-blue-600">{effect.name}</a>
            </li>
          ))}
        </ul>
      </nav>
      {/* Render all effects */}
      <div className="grid gap-6">
        {effectsList.map(effect => (
          <section id={effect.id} key={effect.id}>
            <EffectCard
              effect={effect}
              currentSettings={props.effectSettings?.[effect.id] || {}} // Defensive fallback
              onApplyEffect={props.onApplyEffect}
              onParameterChange={props.onParameterChange}
              isLoading={props.isLoading}
              isAudioLoaded={props.isAudioLoaded}
              analysisResult={props.analysisResult}
              analysisSourceEffectId={props.analysisSourceEffectId}
            />
          </section>
        ))}
      </div>
    </div>
  );
}