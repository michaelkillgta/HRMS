'use client';

interface AvatarProps {
  avatar?: string;
  name: string;
  color?: string;
  size?: number;
  className?: string;
}

export default function Avatar({
  avatar,
  name,
  color = '#2563eb',
  size = 36,
  className = 'avatar-circle'
}: AvatarProps) {
  const isImage = avatar && (
    avatar.startsWith('data:image') ||
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('/photos/') ||
    avatar.startsWith('/avatars/')
  );

  const getInitials = (text: string) => {
    if (!text) return 'EM';
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return text.slice(0, 2).toUpperCase();
  };

  const displayText = avatar && avatar.length <= 3 ? avatar : getInitials(name);

  return (
    <div
      className={className}
      style={{
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 600,
        fontSize: size >= 48 ? '1.1rem' : (size >= 36 ? '0.82rem' : '0.75rem'),
        flexShrink: 0
      }}
    >
      {isImage ? (
        <img
          src={avatar}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
        />
      ) : (
        <span>{displayText}</span>
      )}
    </div>
  );
}
