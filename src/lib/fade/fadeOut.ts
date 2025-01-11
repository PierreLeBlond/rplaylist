import { fade } from './fade';

export const fadeOut = async (player: Spotify.Player): Promise<void> => fade(player, 1, 0);
