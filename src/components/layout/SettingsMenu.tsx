import { useState } from 'react';
import { useT, LOCALES } from '../../i18n';
import type { Locale } from '../../i18n';
import { useSettings } from '../../store/settings-store';
import styles from './SettingsMenu.module.css';

export function SettingsMenu() {
  const { locale, setLocale, t } = useT();
  const [open, setOpen] = useState(false);
  const settings = useSettings();

  return (
    <>
      <button
        className={styles.btn}
        onClick={() => setOpen(true)}
        title={t('settings')}
      >
        ⚙
      </button>
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.dialog} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <span className={styles.title}>{t('settings')}</span>
              <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className={styles.body}>
              {/* ── Language ─────────────────────── */}
              <Section label={t('language')}>
                <div className={styles.options}>
                  {(Object.entries(LOCALES) as [Locale, { label: string }][]).map(
                    ([key, { label }]) => (
                      <button
                        key={key}
                        className={`${styles.option} ${key === locale ? styles.active : ''}`}
                        onClick={() => setLocale(key)}
                      >
                        {label}
                      </button>
                    ),
                  )}
                </div>
              </Section>

              {/* ── Audio ────────────────────────── */}
              <Section label={t('settingsAudio')}>
                <SliderRow
                  label={t('music')}
                  value={settings.musicVolume}
                  enabled={settings.musicEnabled}
                  onToggle={() => settings.set('musicEnabled', !settings.musicEnabled)}
                  onChange={v => settings.set('musicVolume', v)}
                />
                <SliderRow
                  label={t('sfx')}
                  value={settings.sfxVolume}
                  enabled={settings.sfxEnabled}
                  onToggle={() => settings.set('sfxEnabled', !settings.sfxEnabled)}
                  onChange={v => settings.set('sfxVolume', v)}
                />
              </Section>

              {/* ── Display ──────────────────────── */}
              <Section label={t('settingsDisplay')}>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>{t('animationSpeed')}</span>
                  <div className={styles.segmented}>
                    {(['off', 'fast', 'normal'] as const).map(speed => (
                      <button
                        key={speed}
                        className={`${styles.seg} ${settings.animationSpeed === speed ? styles.segActive : ''}`}
                        onClick={() => settings.set('animationSpeed', speed)}
                      >
                        {t(speed === 'off' ? 'animOff' : speed === 'fast' ? 'animFast' : 'animNormal')}
                      </button>
                    ))}
                  </div>
                </div>
                <ToggleRow
                  label={t('showDamageNumbers')}
                  checked={settings.showDamageNumbers}
                  onChange={() => settings.set('showDamageNumbers', !settings.showDamageNumbers)}
                />
              </Section>

              {/* ── Gameplay ─────────────────────── */}
              <Section label={t('settingsGameplay')}>
                <ToggleRow
                  label={t('autoConfirm')}
                  desc={t('autoConfirmDesc')}
                  checked={settings.autoConfirm}
                  onChange={() => settings.set('autoConfirm', !settings.autoConfirm)}
                />
              </Section>

              {/* ── Reset ────────────────────────── */}
              <div className={styles.footer}>
                <button className={styles.resetBtn} onClick={settings.reset}>
                  {t('resetSettings')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>{label}</div>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  enabled,
  onToggle,
  onChange,
}: {
  label: string;
  value: number;
  enabled: boolean;
  onToggle: () => void;
  onChange: (v: number) => void;
}) {
  return (
    <div className={styles.row}>
      <button
        className={`${styles.toggle} ${enabled ? styles.toggleOn : ''}`}
        onClick={onToggle}
      >
        <span className={styles.toggleKnob} />
      </button>
      <span className={`${styles.rowLabel} ${!enabled ? styles.muted : ''}`}>{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={!enabled}
        className={styles.slider}
        onChange={e => onChange(Number(e.target.value))}
      />
      <span className={`${styles.volNum} ${!enabled ? styles.muted : ''}`}>{value}</span>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className={styles.row}>
      <button
        className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
        onClick={onChange}
      >
        <span className={styles.toggleKnob} />
      </button>
      <div className={styles.rowText}>
        <span className={styles.rowLabel}>{label}</span>
        {desc && <span className={styles.rowDesc}>{desc}</span>}
      </div>
    </div>
  );
}
