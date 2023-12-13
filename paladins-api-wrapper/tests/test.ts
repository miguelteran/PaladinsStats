import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import * as PaladinsApiWrapper from '../src/functions/functions';


describe('Test Paladins API Functions', () => {

    test('testSession() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.testSession();
      assert.notStrictEqual(result, undefined);
    });
  
    test('getDataUsed() should not return undefined', async () => {
      PaladinsApiWrapper.setSessionId('123'); // simulate expired session
      const result = await PaladinsApiWrapper.getDataUsed();
      assert.notStrictEqual(result, undefined);
    });
  
    test('getHirezServerStatus() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getHirezServerStatus();
      assert.notStrictEqual(result, undefined);
    });
  
    test('getChampions() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getChampions();
      assert.notStrictEqual(result, undefined);
    });
  
    test('getChampionCards() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getChampionCards(1);
      assert.notStrictEqual(result, undefined);
    });
  
    test('getChampionSkins() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getChampionSkins(1);
      assert.notStrictEqual(result, undefined);
    });
  
    test('getAllChampionSkins() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getAllChampionSkins();
      assert.notStrictEqual(result, undefined);
    });
  
    test('getItems() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getItems();
      assert.notStrictEqual(result, undefined);
    });
  
    test('getBountyItems() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getBountyItems();
      assert.notStrictEqual(result, undefined);
    });
  
    test('getPlayer() should not return undefined if player exists', async () => {
      const result = await PaladinsApiWrapper.getPlayer('Xero1st');
      assert.notStrictEqual(result, undefined);
    });

    test('getPlayer() should return undefined if player does not exist', async () => {
      const result = await PaladinsApiWrapper.getPlayer('nonexistent123');
      assert.strictEqual(result, undefined);
    });
  
    test('getPlayerBatch() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getPlayerBatch(['123', '456']);
      assert.notStrictEqual(result, undefined);
    });
  
    test('getChampionRanks() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getChampionRanks('123');
      assert.notStrictEqual(result, undefined);
    });
  
    test('getPlayerLoadouts() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getPlayerLoadouts('123');
      assert.notStrictEqual(result, undefined);
    });
  
    test('getMatchHistory() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getMatchHistory('123');
      assert.notStrictEqual(result, undefined);
    });
  
    test('getQueueStats() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getQueueStats('123', 123);
      assert.notStrictEqual(result, undefined);
    });
  
    test('getQueueStatsBatch() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getQueueStatsBatch('123', [123, 456]);
      assert.notStrictEqual(result, undefined);
    });
  
    test('searchPlayers() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.searchPlayers('playerName123');
      assert.notStrictEqual(result, undefined);
    });
  
    test('getMatchDetails() should not return undefined for valid match', async () => {
      const result = await PaladinsApiWrapper.getMatchDetails('1240496890');
      assert.notStrictEqual(result, undefined);
    });

    test('getMatchDetails() should return undefined for corrupted match', async () => {
      const result = await PaladinsApiWrapper.getMatchDetails('1238618129');
      assert.strictEqual(result, undefined);
    });

    test('getMatchDetails() should return undefined for invalid match', async () => {
      const result = await PaladinsApiWrapper.getMatchDetails('123');
      assert.strictEqual(result, undefined);
    });
  
    test('getMatchDetailsBatch() should not return undefined for valid matches', async () => {
      const result = await PaladinsApiWrapper.getMatchDetailsBatch(['1240496890', '1240764083']);
      assert.notStrictEqual(result, undefined);
    });

    test('getMatchDetailsBatch() should return empty list for corrupted matches', async () => {
      const result = await PaladinsApiWrapper.getMatchDetailsBatch(['1238618129', '1238618135']);
      assert.strictEqual(result.length, 0);
    });
  
    test('getMatchIdsByQueue() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getMatchIdsByQueue(123, '2023-09-15', '12,00');
      assert.notStrictEqual(result, undefined);
    });
});
  