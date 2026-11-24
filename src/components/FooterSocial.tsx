import { ExternalLink, Github, Globe, Linkedin } from 'lucide-react';
import type { SocialPlatform } from '../types/portfolio';

export function getSocialIcon(platform: SocialPlatform) {
  switch (platform) {
    case 'github':
      return Github;
    case 'linkedin':
      return Linkedin;
    case 'website':
      return Globe;
    default:
      return ExternalLink;
  }
}
