import { fade } from './fade';

export const fadeIn = async (player: Spotify.Player): Promise<void> => fade(player, 0, 1);
