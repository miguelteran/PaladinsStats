import { getPlayer, getMatchHistory, getChampionRanks } from '@miguelteran/paladins-api-wrapper';
import { PlayerStats } from './player-stats';
import { getPercentageString, getTimeString } from '@/util/string-util';
import { ChampionStatsSummary } from '@/models/champion-stats-summary';
import { getKDARatio, getPercentage } from '@/util/number-util';


export default async function Page() {

    const [player, recentMatches, championStats] = await Promise.all([getPlayer(724293931), getMatchHistory(724293931), getChampionRanks(724293931)]);

    const totalMatchesPlayed = player.Wins + player.Losses;
    const winRate = getPercentageString(getPercentage(totalMatchesPlayed, player.Wins));
    const timePlayed = getTimeString(player.MinutesPlayed);

    const champions: ChampionStatsSummary[] = championStats.map(champion => {
        const numMatches = champion.Wins + champion.Losses;
        return {
            championId: champion.champion_id,
            championName: champion.champion,
            rank: champion.Rank,
            numberOfMatches: numMatches,
            winRate: getPercentage(numMatches, champion.Wins),
            kda: `${champion.Kills}/${champion.Deaths}/${champion.Assists}`,
            kdaRatio: getKDARatio(champion.Kills, champion.Deaths, champion.Assists),
            minutesPlayed: champion.Minutes
        }
    });

    return (
        <div>
            <img
                src={player.AvatarURL}
                alt="Profile picture"
            />
            <div>{player.Name}</div>
            <div>{player.Title}</div>
            <div>{player.Tier_RankedKBM}</div>
            <div>{player.Last_Login_Datetime}</div>
            <div>{player.Platform}</div>
            <div>{player.Region}</div>
            <div>{player.Level}</div>
            <div>{winRate}</div>
            <div>{totalMatchesPlayed}</div>
            <div>{timePlayed}</div>

            <PlayerStats
                recentMatches={recentMatches}
                championStats={champions}
            />

        </div>
    );
}
