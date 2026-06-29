import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  EditIcon,
  GlobeIcon,
} from '../../components/icons/Icons';

const COLORS = {
  bg: '#0B0D12',
  surface: '#121620',
  elevated: 'rgba(255,255,255,0.06)',
  input: 'rgba(15,23,42,0.72)',
  border: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  textSecondary: '#B8C0CC',
  muted: '#7D8796',
  accent: '#FF7A59',
  success: '#22D3EE',
  primaryButton: '#F8F9FA',
  primaryButtonText: '#111827',
};

const FieldLabel = ({ label }) => (
  <div
    style={{
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.2,
      color: COLORS.textSecondary,
      marginBottom: 10,
      marginTop: 4,
      textTransform: 'uppercase',
    }}
  >
    {label}
  </div>
);

const TagChip = ({ tag, onRemove }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '9px 14px',
      borderRadius: 999,
      background: 'rgba(255,122,89,0.18)',
      border: '1px solid rgba(255,122,89,0.35)',
      color: COLORS.text,
      fontSize: 13,
      fontWeight: 600,
    }}
  >
    {tag}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${tag}`}
      style={{
        width: 18,
        height: 18,
        padding: 0,
        border: 'none',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)',
        color: COLORS.text,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
);

const ToggleSwitch = ({ value, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    role="switch"
    aria-checked={value}
    aria-label="Toggle project visibility"
    style={{
      width: 52,
      height: 30,
      borderRadius: 999,
      padding: 3,
      border: 'none',
      background: value ? COLORS.accent : 'rgba(255,255,255,0.16)',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: value ? 'flex-end' : 'flex-start',
      transition: 'background 0.2s ease, transform 0.15s ease',
      WebkitTapHighlightColor: 'transparent',
      boxShadow: value
        ? '0 8px 20px rgba(255,122,89,0.22)'
        : 'inset 0 0 0 1px rgba(255,255,255,0.05)',
    }}
  >
    <span
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.24)',
      }}
    />
  </button>
);

const StepConnector = ({ filled, half }) => {
  const background = filled
    ? COLORS.success
    : half
      ? 'linear-gradient(90deg, #FF7A59, rgba(255,255,255,0.16))'
      : 'rgba(255,255,255,0.12)';

  return (
    <div
      style={{
        flex: 1,
        height: 2,
        borderRadius: 999,
        margin: '0 10px 24px',
        background,
      }}
    />
  );
};

const STEPS = [
  { num: 1, label: 'Type', status: 'done' },
  { num: 2, label: 'Assets', status: 'done' },
  { num: 3, label: 'Info', status: 'active' },
  { num: 4, label: 'Preview', status: 'upcoming' },
  { num: 5, label: 'Publish', status: 'upcoming' },
];

const CURRENT_STEP = 3;

const MODEL_THUMB =
  'https://image.qwenlm.ai/public_source/581c980c-93ea-4473-a881-d706c334af84/16f5b8c4e-7f3a-4b6d-9c8e-2d4a5e6f7a8b.png';

const UploadPage = () => {
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState('Neon Cube Composition');
  const [category] = useState('3D Art');
  const [description, setDescription] = useState(
    'A cubist-inspired 3D render exploring mid-century architectural forms with a cardboard material study.'
  );
  const [tags, setTags] = useState(['cubism', 'render', 'abstract']);
  const [newTag, setNewTag] = useState('');
  const [tools, setTools] = useState({
    Blender: true,
    ZBrush: true,
    'Unreal Engine': false,
    Maya: false,
    'After Effects': false,
  });
  const [isPublic, setIsPublic] = useState(true);

  const removeTag = (tag) => setTags((prev) => prev.filter((item) => item !== tag));

  const addTag = () => {
    const nextTag = newTag.trim();
    if (nextTag && !tags.includes(nextTag)) {
      setTags((prev) => [...prev, nextTag]);
      setNewTag('');
    }
  };

  const toggleTool = (tool) => {
    setTools((prev) => ({ ...prev, [tool]: !prev[tool] }));
  };

  return (
    <div
      className="mobile-frame anim-fade-up"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top left, rgba(255,122,89,0.14), transparent 30%), radial-gradient(circle at top right, rgba(34,211,238,0.10), transparent 32%), linear-gradient(180deg, rgba(18,22,32,0.9) 0%, rgba(11,13,18,1) 26%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 18px 10px',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 18px)',
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: COLORS.text,
            margin: 0,
            letterSpacing: -0.4,
          }}
        >
          New Project
        </h1>
        <button
          type="button"
          aria-label="Close"
          onClick={() => navigate('/app/profile')}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: COLORS.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          <CloseIcon size={20} />
        </button>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '6px 18px 14px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {STEPS.map((step, idx) => (
          <div
            key={step.num}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: idx < STEPS.length - 1 ? 1 : 'unset',
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                minWidth: 52,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    step.status === 'done'
                      ? COLORS.success
                      : step.status === 'active'
                        ? COLORS.accent
                        : 'rgba(255,255,255,0.10)',
                  color: step.status === 'upcoming' ? COLORS.muted : '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                  boxShadow:
                    step.status === 'active' ? '0 8px 18px rgba(255,122,89,0.24)' : 'none',
                }}
              >
                {step.status === 'done' ? <CheckIcon size={14} weight="3" /> : step.num}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color:
                    step.status === 'done'
                      ? COLORS.success
                      : step.status === 'active'
                        ? COLORS.text
                        : COLORS.muted,
                  letterSpacing: 0.1,
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <StepConnector filled={idx < CURRENT_STEP - 1} half={idx === CURRENT_STEP - 1} />
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px 0',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div
            style={{
              background: COLORS.elevated,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 28,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.30)',
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <img
                  src={MODEL_THUMB}
                  alt="3D model"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.88 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'rgba(18,22,32,0.96)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 18px rgba(0,0,0,.32)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: COLORS.text,
                  }}
                >
                  <EditIcon size={11} />
                </div>
              </div>

              <div>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: COLORS.text,
                    margin: '0 0 4px',
                    letterSpacing: -0.3,
                  }}
                >
                  Tell us about your project
                </h2>
                <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: 0, fontWeight: 500 }}>
                  3D model asset uploaded
                </p>
              </div>
            </div>

            <FieldLabel label="Project Title" />
            <input
              id="project-title"
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="field-input"
              style={{
                width: '100%',
                minHeight: 56,
                marginBottom: 18,
                borderRadius: 16,
                padding: '15px 18px',
                background: COLORS.input,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                boxShadow: 'none',
                outline: 'none',
              }}
            />

            <FieldLabel label="Category" />
            <button
              type="button"
              style={{
                width: '100%',
                minHeight: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '0 16px',
                background: COLORS.input,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                marginBottom: 18,
                cursor: 'pointer',
                color: COLORS.text,
                transition: 'border-color 0.2s ease, transform 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: COLORS.accent,
                    boxShadow: '0 0 0 4px rgba(255,122,89,0.14)',
                  }}
                />
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: COLORS.text,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {category}
                </span>
              </div>
              <ChevronDownIcon size={18} />
            </button>

            <FieldLabel label="Description" />
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="field-input"
              style={{
                width: '100%',
                minHeight: 112,
                marginBottom: 18,
                resize: 'none',
                lineHeight: 1.5,
                borderRadius: 16,
                padding: '16px 18px',
                background: COLORS.input,
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
                boxShadow: 'none',
                outline: 'none',
              }}
            />

            <FieldLabel label="Tags" />
            <div
              style={{
                background: 'rgba(15,23,42,0.42)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: 14,
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                {tags.map((tag) => (
                  <TagChip key={tag} tag={tag} onRemove={() => removeTag(tag)} />
                ))}
              </div>
              <input
                id="new-tag-input"
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTag();
                }}
                placeholder="Add tag..."
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  fontSize: 14,
                  color: COLORS.text,
                  outline: 'none',
                  padding: '4px 0',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <FieldLabel label="Tools Used" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
              {Object.entries(tools).map(([tool, selected]) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  aria-pressed={selected}
                  style={{
                    minHeight: 44,
                    padding: '10px 14px',
                    borderRadius: 999,
                    border: `1px solid ${selected ? 'rgba(255,122,89,0.38)' : COLORS.border}`,
                    background: selected ? 'rgba(255,122,89,0.16)' : 'rgba(18,22,32,0.92)',
                    color: selected ? COLORS.text : COLORS.textSecondary,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'transform 0.15s ease, border-color 0.2s ease, background 0.2s ease',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {selected && <CheckIcon size={14} weight="3" />}
                  {tool}
                </button>
              ))}
            </div>

            <FieldLabel label="Visibility" />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '14px 16px',
                background: COLORS.input,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <GlobeIcon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>Public</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 500 }}>
                    Anyone can view this project
                  </div>
                </div>
              </div>
              <ToggleSwitch value={isPublic} onChange={() => setIsPublic(!isPublic)} />
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            padding: '14px 16px calc(env(safe-area-inset-bottom, 0px) + 16px)',
            background:
              'linear-gradient(180deg, rgba(11,13,18,0) 0%, rgba(11,13,18,0.88) 28%, rgba(11,13,18,1) 100%)',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="btn btn--ghost"
              style={{
                flex: 1,
                height: 56,
                borderRadius: 20,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: COLORS.text,
                boxShadow: 'none',
              }}
              onClick={() => navigate('/app/project/1')}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn--primary"
              style={{
                flex: 1.5,
                height: 56,
                borderRadius: 20,
                background: COLORS.primaryButton,
                color: COLORS.primaryButtonText,
                boxShadow: '0 14px 30px rgba(0,0,0,0.28)',
              }}
              onClick={() => navigate('/app/home')}
            >
              Next: Preview
              <ArrowRightIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
