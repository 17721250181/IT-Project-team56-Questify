import React from 'react';
import { Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../../styles/UserAvatar.css';

/**
 * UserAvatar Component
 * Reusable component for displaying user avatars
 * 
 * @param {string} avatarUrl - URL of the user's avatar image
 * @param {string} size - Size of the avatar: 'small', 'medium', 'large', 'xlarge'
 * @param {boolean} showBorder - Whether to show border around avatar
 * @param {string} borderColor - Bootstrap color variant for border (primary, secondary, etc.)
 * @param {boolean} hoverable - Whether to show hover effect
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 */
const UserAvatar = ({
    avatarUrl,
    size = 'medium',
    showBorder = true,
    borderColor = 'secondary',
    hoverable = false,
    className = '',
    style = {},
}) => {
    // Size configurations
    const sizeMap = {
        small: { dimension: 32, iconSize: '32px' },
        medium: { dimension: 40, iconSize: '40px' },
        large: { dimension: 64, iconSize: '64px' },
        xlarge: { dimension: 150, iconSize: '150px' },
    };

    const { dimension, iconSize } = sizeMap[size] || sizeMap.medium;

    // Build CSS classes
    const avatarClasses = [
        'user-avatar',
        `user-avatar-${size}`,
        hoverable && 'user-avatar-hoverable',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const borderClasses = showBorder 
        ? `border border-${size === 'xlarge' ? '3' : '2'} border-${borderColor}` 
        : '';

    return (
        <>
            {avatarUrl ? (
                <Image
                    src={avatarUrl}
                    roundedCircle
                    width={dimension}
                    height={dimension}
                    alt="User avatar"
                    className={`${avatarClasses} ${borderClasses}`}
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center 10%',
                        ...style,
                    }}
                />
            ) : (
                <i
                    className={`bi bi-person-circle text-secondary ${avatarClasses}`}
                    style={{
                        fontSize: iconSize,
                        lineHeight: 1,
                        ...style,
                    }}
                />
            )}
        </>
    );
};

UserAvatar.propTypes = {
    avatarUrl: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
    showBorder: PropTypes.bool,
    borderColor: PropTypes.string,
    hoverable: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
};

export default UserAvatar;
