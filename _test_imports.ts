// Test file to verify all imports work correctly
// This file is not executed, just for TypeScript verification

// UI Components
import { Icon, VerifiedBadge, CTAButton, ActionButton, StatsRow } from './src/components/ui';

// Feed Components
import { VerticalFeedItem } from './src/components/feed/VerticalFeedItem';
import { VerticalFeedList } from './src/components/feed/VerticalFeedList';

// Story Components
import { StoryRing } from './src/components/story/StoryRing';
import { StoriesList } from './src/components/story/StoriesList';

// Comment Components
import { CommentItem } from './src/components/comments/CommentItem';
import { CommentInput } from './src/components/comments/CommentInput';

// Profile Components
import { MediaGrid } from './src/components/profile/MediaGrid';

// Place Components
import { PlaceActions } from './src/components/places/PlaceActions';
import { PlaceAmenities } from './src/components/places/PlaceAmenities';
import { PlacePhotoGrid } from './src/components/places/PlacePhotoGrid';

// Event Components
import { EventOrganizer } from './src/components/events/EventOrganizer';
import { EventParticipants } from './src/components/events/EventParticipants';

// Types
import type { Comment } from './src/features/comments/types';
import type { UserProfile, ProfilePost } from './src/features/profile/types';
import type { Event } from './src/features/events/types';

console.log('✅ All imports successful!');
