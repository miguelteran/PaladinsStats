import { describe, test, before } from 'node:test';
import assert from 'node:assert/strict';
import * as PaladinsApiWrapper from '../src/index';


describe('Test Paladins API Functions', () => {

    before(async () => {
        console.log("Setting sessionId");
        const sessionId = await PaladinsApiWrapper.createSession();
        PaladinsApiWrapper.setSessionId(sessionId);
    });

    test('testSession() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.testSession();
      assert.notStrictEqual(result, undefined);
    });
  
    test('getDataUsed() should not return undefined', async () => {
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
  
    test('getPlayer() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getPlayer('123');
      assert.notStrictEqual(result, undefined);
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
  
    test('getMatchDetails() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getMatchDetails('123');
      assert.notStrictEqual(result, undefined);
    });
  
    test('getMatchDetailsBatch() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getMatchDetailsBatch(['123', '456']);
      assert.notStrictEqual(result, undefined);
    });
  
    test('getMatchIdsByQueue() should not return undefined', async () => {
      const result = await PaladinsApiWrapper.getMatchIdsByQueue(123, '2023-09-15', '12,00');
      assert.notStrictEqual(result, undefined);
    });
});
  