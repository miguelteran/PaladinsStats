import { getPlayer, getMatchHistory, getChampionRanks } from '@miguelteran/paladins-api-wrapper';
import { PlayerStats } from '../player-stats';
import { ChampionStatsSummary } from '@/models/champion-stats-summary';
import { getPercentageString, getTimeString } from '@/util/string-util';
import { getKDARatio, getPercentage } from '@/util/number-util';
import { notFound } from 'next/navigation';
import { PaladinsRoles } from '@/models/role';
import { championsMap, getRank } from '@/util/static-data';
import { TextWithLabel } from '@/components/text-with-label';
import { ProfilePicture } from '../profile-picture';


export default async function PlayerPage( { params }: { params: { playerId: string } }) {

    const [player, recentMatches, championStats] = await Promise.all([getPlayer(params.playerId), getMatchHistory(params.playerId), getChampionRanks(params.playerId)]);

    if (!player) {
        notFound();
    }
    
    const rank = getRank(player.Tier_RankedKBM);
    const totalMatchesPlayed = player.Wins + player.Losses;
    const winRate = getPercentageString(getPercentage(totalMatchesPlayed, player.Wins));
    const timePlayed = getTimeString(player.MinutesPlayed);

    const championSummaries: ChampionStatsSummary[] = championStats.map(champion => {
        const numMatches = champion.Wins + champion.Losses; 
        return {
            championId: champion.champion_id,
            championName: champion.champion,
            championRole: championsMap.get(Number(champion.champion_id))?.Roles as PaladinsRoles,
            rank: champion.Rank,
            numberOfMatches: numMatches,
            winRate: getPercentage(numMatches, champion.Wins),
            kda: `${champion.Kills}/${champion.Deaths}/${champion.Assists}`,
            kdaRatio: getKDARatio(champion.Kills, champion.Deaths, champion.Assists),
            minutesPlayed: champion.Minutes
        }
    });

    return (
        <div id='player-container'>
            <div className='flex flex-row flex-wrap pb-4'>
                <ProfilePicture url={player.AvatarURL}/>
                <div className='p-4'>
                    <p className='text-3xl font-bold'>{player.Name}</p>
                    <p>{player.Title}</p>
                </div>
            </div>
            <div id='player-info-container' className='pb-4'>
                <TextWithLabel label='ID' value={player.Id}/>
                <TextWithLabel label='Last Played' value={player.Last_Login_Datetime}/>
                <TextWithLabel label='Rank' value={rank}/>
                <TextWithLabel label='Level' value={player.Level}/>
                <TextWithLabel label='Platform' value={player.Platform}/>
                <TextWithLabel label='Region' value={player.Region}/>
                <TextWithLabel label='Win Rate' value={winRate}/>
                <TextWithLabel label='Matches Played' value={totalMatchesPlayed}/>
                <TextWithLabel label='Time Played' value={timePlayed}/>
            </div>
            <PlayerStats
                recentMatches={recentMatches}
                championStats={championSummaries}
            />

        </div>
    );
}
